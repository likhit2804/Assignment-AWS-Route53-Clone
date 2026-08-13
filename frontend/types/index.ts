export type RecordType = "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "PTR" | "SRV" | "CAA";

export type RoutingPolicy = "Simple" | "Weighted" | "Latency" | "Failover" | "Geolocation" | "Multivalue Answer";

export type ZoneType = "Public" | "Private";

export interface HostedZone {
  id: string;
  name: string;
  caller_reference: string;
  description?: string;
  zone_type: ZoneType;
  vpcs?: string[];
  record_count: number;
  created_at: string;
  updated_at: string;
}

export interface DNSRecord {
  id: string;
  hosted_zone_id: string;
  name: string;
  type: RecordType;
  ttl: number;
  records: string[];
  routing_policy: RoutingPolicy;
  weight?: number;
  region?: string;
  health_check_id?: string;
  set_identifier?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  username: string;
  email: string;
  account_id: string;
  display_name: string;
  logged_in_at?: string;
}
