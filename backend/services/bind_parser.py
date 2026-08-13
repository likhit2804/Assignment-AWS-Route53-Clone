"""
Service: BIND Zone File Stream State-Machine Parser & Serializer (RFC 1035)
----------------------------------------------------------------------------
Decision: Zero-dependency stream parser built using standard Python `re` & `io.StringIO`.
Tokenizes $ORIGIN, $TTL, inline comments (;), multi-line SOA records ( ... ), and record lines.
Exposes both import parser (`parse_bind_zone`) and export serializer (`export_bind_zone`).
"""
import re
import io
from typing import List, Dict, Any, Tuple


class BINDParserError(Exception):
    """Custom exception for invalid BIND zone file syntax."""
    pass


def _strip_comment(line: str) -> str:
    """Strip inline BIND comments starting with ';' unless inside quotes."""
    in_quotes = False
    result = []
    for char in line:
        if char == '"':
            in_quotes = not in_quotes
        elif char == ';' and not in_quotes:
            break
        result.append(char)
    return "".join(result).strip()


def parse_bind_zone(zone_text: str, fallback_origin: str = "example.com.") -> Dict[str, Any]:
    """
    Parse BIND zone text into structured Python dictionaries.
    
    Returns:
        {
            "origin": "example.com.",
            "ttl": 300,
            "records": [
                {
                    "name": "api.example.com.",
                    "type": "A",
                    "ttl": 300,
                    "records": ["192.0.2.1"],
                    "routing_policy": "Simple"
                },
                ...
            ]
        }
    """
    if not fallback_origin.endswith("."):
        fallback_origin += "."

    origin = fallback_origin
    default_ttl = 300
    parsed_records: Dict[Tuple[str, str], Dict[str, Any]] = {}

    # Pre-process multi-line parentheses (SOA records often span multiple lines)
    raw_lines = zone_text.splitlines()
    cleaned_lines = []
    multiline_buf = []
    in_multiline = False

    for line in raw_lines:
        stripped = _strip_comment(line)
        if not stripped:
            continue
        
        if "(" in stripped and ")" not in stripped:
            in_multiline = True
            multiline_buf.append(stripped.replace("(", " "))
        elif in_multiline:
            if ")" in stripped:
                in_multiline = False
                multiline_buf.append(stripped.replace(")", " "))
                cleaned_lines.append(" ".join(multiline_buf))
                multiline_buf = []
            else:
                multiline_buf.append(stripped)
        else:
            cleaned_lines.append(stripped)

    # Process state machine line by line
    current_name = "@"
    
    for line in cleaned_lines:
        tokens = line.split()
        if not tokens:
            continue

        first_token = tokens[0].upper()

        # Directive: $ORIGIN <domain>
        if first_token == "$ORIGIN":
            if len(tokens) >= 2:
                origin = tokens[1]
                if not origin.endswith("."):
                    origin += "."
            continue

        # Directive: $TTL <seconds>
        if first_token == "$TTL":
            if len(tokens) >= 2 and tokens[1].isdigit():
                default_ttl = int(tokens[1])
            continue

        # Ignore other $ directives (e.g. $INCLUDE)
        if first_token.startswith("$"):
            continue

        # Parse Record Line: [Name] [TTL] [Class] Type Value...
        idx = 0
        
        # Determine Name
        token0 = tokens[0]
        if token0 == "@":
            name = origin
            idx += 1
        elif token0.isdigit() or token0.upper() in ["IN", "CS", "CH", "HS"] or token0.upper() in ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "PTR", "SRV", "CAA", "SOA"]:
            name = current_name
        else:
            name = token0
            idx += 1
            if not name.endswith("."):
                name = f"{name}.{origin}"
            current_name = name

        # Determine optional TTL
        ttl = default_ttl
        if idx < len(tokens) and tokens[idx].isdigit():
            ttl = int(tokens[idx])
            idx += 1

        # Determine optional CLASS (IN)
        if idx < len(tokens) and tokens[idx].upper() in ["IN", "CS", "CH", "HS"]:
            idx += 1

        # Determine Record TYPE
        if idx >= len(tokens):
            continue
        rec_type = tokens[idx].upper()
        idx += 1

        # Remaining tokens are the record VALUE
        val_tokens = tokens[idx:]
        if not val_tokens:
            continue

        val_raw = " ".join(val_tokens).strip()

        # Handle specific record value formatting
        if rec_type in ["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"]:
            if rec_type == "CNAME" and not val_raw.endswith("."):
                val_raw = f"{val_raw}.{origin}"
            elif rec_type == "NS" and not val_raw.endswith("."):
                val_raw = f"{val_raw}.{origin}"

            # Group values by (name, type) key
            key = (name.lower(), rec_type)
            if key not in parsed_records:
                parsed_records[key] = {
                    "name": name,
                    "type": rec_type,
                    "ttl": ttl,
                    "records": [val_raw],
                    "routing_policy": "Simple"
                }
            else:
                if val_raw not in parsed_records[key]["records"]:
                    parsed_records[key]["records"].append(val_raw)

    return {
        "origin": origin,
        "ttl": default_ttl,
        "records": list(parsed_records.values())
    }


def export_bind_zone(hosted_zone_name: str, records: List[Dict[str, Any]], default_ttl: int = 300) -> str:
    """
    Serialize DNS records into standard RFC 1035 BIND zone file format.
    """
    if not hosted_zone_name.endswith("."):
        hosted_zone_name += "."

    out = io.StringIO()
    out.write(f"; BIND Zone File Export for {hosted_zone_name}\n")
    out.write(f"; Generated by AWS Route53 Clone Engine\n")
    out.write(f"$ORIGIN {hosted_zone_name}\n")
    out.write(f"$TTL {default_ttl}\n\n")

    # Group records by type for clean formatting
    soa_records = [r for r in records if r.get("type") == "SOA"]
    ns_records = [r for r in records if r.get("type") == "NS"]
    other_records = [r for r in records if r.get("type") not in ["SOA", "NS"]]

    # Write NS Records
    if ns_records:
        out.write("; Name Server Records\n")
        for r in ns_records:
            name = r.get("name", "@")
            ttl = r.get("ttl", default_ttl)
            for val in r.get("records", []):
                out.write(f"{name:<30} {ttl:<6} IN  NS      {val}\n")
        out.write("\n")

    # Write Other Records (A, AAAA, CNAME, MX, TXT, SRV)
    if other_records:
        out.write("; Resource Records\n")
        for r in other_records:
            name = r.get("name", "@")
            ttl = r.get("ttl", default_ttl)
            rec_type = r.get("type", "A")
            for val in r.get("records", []):
                out.write(f"{name:<30} {ttl:<6} IN  {rec_type:<7} {val}\n")
        out.write("\n")

    return out.getvalue()
