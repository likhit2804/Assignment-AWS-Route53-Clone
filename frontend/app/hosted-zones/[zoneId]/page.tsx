"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, Search, RefreshCw, Download, Upload, ArrowLeft, Copy, CheckCircle, X, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { DNSRecord, HostedZone, RecordType, RoutingPolicy } from "@/types";
import { Breadcrumbs } from "@/components/aws/Breadcrumbs";
import { Badge, Button } from "@/components/aws/ui";

const RECORD_TYPE_COLORS: Record<string, "blue" | "green" | "orange" | "gray"> = {
  A: "blue", AAAA: "blue", CNAME: "green", MX: "orange",
  TXT: "gray", NS: "gray", PTR: "gray", SRV: "orange", CAA: "gray",
};

// ── Create Record Modal ────────────────────────────────────────────────
function CreateRecordModal({ zoneId, zoneName, onClose, onCreated }: {
  zoneId: string;
  zoneName: string;
  onClose: () => void;
  onCreated: (record: DNSRecord) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<RecordType>("A");
  const [ttl, setTtl] = useState("300");
  const [values, setValues] = useState("");
  const [routing, setRouting] = useState<RoutingPolicy>("Simple");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const recordValues = values.split("\n").map((v) => v.trim()).filter(Boolean);
    if (!name.trim()) { setError("Record name is required."); return; }
    if (recordValues.length === 0) { setError("At least one value is required."); return; }
    setLoading(true);
    try {
      const created = await api.createRecord(zoneId, {
        name: name.trim(),
        type,
        ttl: parseInt(ttl, 10),
        records: recordValues,
        routing_policy: routing,
      });
      onCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create DNS record.");
    } finally {
      setLoading(false);
    }
  };

  const placeholder: Record<RecordType, string> = {
    A: "192.0.2.1\n192.0.2.2",
    AAAA: "2001:db8::1",
    CNAME: "target.example.com.",
    MX: "10 mail.example.com.\n20 backup.example.com.",
    TXT: '"v=spf1 include:_spf.google.com ~all"',
    NS: "ns-1.awsdns-01.com.\nns-2.awsdns-01.net.",
    PTR: "example.com.",
    SRV: "10 20 80 target.example.com.",
    CAA: '0 issue "letsencrypt.org"',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-200">
        <div className="bg-aws-nav text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="font-bold text-sm">Create DNS record in {zoneName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              ⚠ {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Record name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`subdomain.${zoneName}`}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Record type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RecordType)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-aws-blue"
              >
                {["A", "AAAA", "CNAME", "MX", "TXT", "NS", "PTR", "SRV", "CAA"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">TTL (seconds)</label>
              <select
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-aws-blue"
              >
                <option value="60">60 (1 min)</option>
                <option value="300">300 (5 min)</option>
                <option value="3600">3600 (1 hour)</option>
                <option value="86400">86400 (1 day)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Routing policy</label>
              <select
                value={routing}
                onChange={(e) => setRouting(e.target.value as RoutingPolicy)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-aws-blue"
              >
                {["Simple", "Weighted", "Latency", "Failover", "Geolocation", "Multivalue Answer"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Value(s) <span className="text-red-500">*</span>
              <span className="font-normal text-gray-400 ml-1">— one per line</span>
            </label>
            <textarea
              value={values}
              onChange={(e) => setValues(e.target.value)}
              placeholder={placeholder[type]}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue resize-y"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>Create records</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Zone Modal ────────────────────────────────────────────────────
function EditZoneModal({
  zone,
  onClose,
  onUpdated,
}: {
  zone: HostedZone;
  onClose: () => void;
  onUpdated: (zone: HostedZone) => void;
}) {
  const [description, setDescription] = useState(zone.description || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const updated = await api.updateHostedZone(zone.id, { description });
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update hosted zone.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-200">
        <div className="bg-aws-nav text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="font-bold text-sm">Edit hosted zone {zone.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              ⚠ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Domain Name</label>
            <input
              type="text"
              disabled
              value={zone.name}
              className="w-full border border-gray-200 rounded px-3 py-2 text-xs bg-gray-100 text-gray-500 font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Hosted Zone ID</label>
            <input
              type="text"
              disabled
              value={zone.id}
              className="w-full border border-gray-200 rounded px-3 py-2 text-xs bg-gray-100 text-gray-500 font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Record Modal ──────────────────────────────────────────────────
function EditRecordModal({
  zoneId,
  record,
  onClose,
  onUpdated,
}: {
  zoneId: string;
  record: DNSRecord;
  onClose: () => void;
  onUpdated: (record: DNSRecord) => void;
}) {
  const [ttl, setTtl] = useState(record.ttl.toString());
  const [values, setValues] = useState(record.records.join("\n"));
  const [routing, setRouting] = useState<RoutingPolicy>(record.routing_policy);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const recordValues = values.split("\n").map((v) => v.trim()).filter(Boolean);
    if (recordValues.length === 0) { setError("At least one value is required."); return; }
    setLoading(true);
    try {
      const updated = await api.updateRecord(zoneId, record.id, {
        ttl: parseInt(ttl, 10),
        records: recordValues,
        routing_policy: routing,
      });
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update DNS record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-200">
        <div className="bg-aws-nav text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="font-bold text-sm">Edit record {record.name} ({record.type})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              ⚠ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Record Name</label>
            <input
              type="text"
              disabled
              value={record.name}
              className="w-full border border-gray-200 rounded px-3 py-2 text-xs bg-gray-100 text-gray-500 font-mono cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Record Type</label>
              <input
                type="text"
                disabled
                value={record.type}
                className="w-full border border-gray-200 rounded px-3 py-2 text-xs bg-gray-100 text-gray-500 font-mono cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">TTL (seconds)</label>
              <input
                type="number"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Value / Route traffic to <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={values}
              onChange={(e) => setValues(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Routing Policy</label>
            <select
              value={routing}
              onChange={(e) => setRouting(e.target.value as RoutingPolicy)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-aws-blue"
            >
              <option value="Simple">Simple routing</option>
              <option value="Weighted">Weighted routing</option>
              <option value="Latency">Latency routing</option>
              <option value="Failover">Failover routing</option>
              <option value="Geolocation">Geolocation routing</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Record Confirmation Modal ──────────────────────────────────
function DeleteRecordModal({
  count,
  onClose,
  onConfirm,
  loading,
}: {
  count: number;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const [confirmInput, setConfirmInput] = useState("");
  const isConfirmed = confirmInput.trim().toLowerCase() === "delete";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-base text-gray-900">
            Delete {count} record{count > 1 ? "s" : ""}?
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-gray-700">
          <p>
            Delete the record{count > 1 ? "s" : ""} permanently? This action cannot be undone. Routing for your domain may be affected.
          </p>

          <div className="pt-2 border-t border-gray-100">
            <label className="block font-semibold text-gray-800 mb-1.5">
              To confirm that you want to delete the record{count > 1 ? "s" : ""}, enter <span className="font-bold italic text-gray-900">delete</span> in the field.
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="delete"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue font-mono"
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={!isConfirmed || loading}
            loading={loading}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Zone Modal (AWS Console Style) ────────────────────────────────
function DeleteZoneModal({
  zones,
  onClose,
  onConfirm,
  loading,
}: {
  zones: HostedZone[];
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const [confirmInput, setConfirmInput] = useState("");
  const zoneName = zones.length === 1 ? zones[0].name : `${zones.length} hosted zones`;
  const isConfirmed = confirmInput.trim().toLowerCase() === "delete";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-base text-gray-900">
            Delete hosted zone {zoneName}?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs text-gray-700">
          <p>
            Delete the hosted zone permanently? This action cannot be undone. Your domain might become unavailable on the internet.
          </p>

          <div className="pt-2 border-t border-gray-100">
            <label className="block font-semibold text-gray-800 mb-1.5">
              To confirm that you want to delete the hosted zone, enter <span className="font-bold italic text-gray-900">delete</span> in the field.
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="delete"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue font-mono"
              autoFocus
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={!isConfirmed || loading}
            loading={loading}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Import BIND Zone Modal ─────────────────────────────────────────────
function ImportBindModal({
  zoneId,
  zoneName,
  onClose,
  onImported,
}: {
  zoneId: string;
  zoneName: string;
  onClose: () => void;
  onImported: (count: number) => void;
}) {
  const [zoneText, setZoneText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setZoneText(event.target?.result as string || "");
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!zoneText.trim()) {
      setError("Please paste BIND zone content or upload a zone file.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.importBindZone(zoneId, zoneText);
      onImported(res.imported_count);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to import BIND zone file. Please check syntax.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 select-none">
      <div className="bg-white dark:bg-[#0f141c] border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn text-xs transition-colors">
        {/* Modal Header */}
        <div className="bg-gray-50 dark:bg-[#0f141c] border-b border-gray-200 dark:border-gray-800 px-5 py-3 flex items-center justify-between transition-colors">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Import zone file</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-gray-700 dark:text-gray-300">
          <div className="p-3 bg-blue-50 dark:bg-blue-955/10 border border-blue-200 dark:border-blue-900 rounded text-blue-900 dark:text-blue-300 text-[11px] leading-relaxed">
            <strong>Supported records:</strong> A, AAAA, CNAME, MX, TXT, NS, SRV, CAA, PTR. Standard zone file directives like <code>$TTL</code> and <code>$ORIGIN</code> are parsed. Existing records with identical name, type, and values will not be duplicated.
          </div>

          <div>
            <label className="block text-gray-900 dark:text-white font-semibold mb-1">
              Select BIND zone file (.txt, .zone, or any text file)
            </label>
            <input
              type="file"
              accept=".txt,.zone,.conf,.db,*"
              onChange={handleFileChange}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-55 file:text-aws-blue hover:file:bg-blue-100 dark:file:bg-gray-850 dark:file:text-gray-300"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-gray-900 dark:text-white font-semibold">
                Or paste zone file text content
              </label>
              {zoneText && (
                <button
                  onClick={() => setZoneText("")}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-[11px]"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={zoneText}
              onChange={(e) => setZoneText(e.target.value)}
              placeholder={`$ORIGIN ${zoneName}\n$TTL 3600\n@   IN  SOA ns-1.awsdns.com. hostmaster.awsdns.com. (\n        2026081301 ; serial\n        7200       ; refresh\n        900        ; retry\n        1209600    ; expire\n        86400 )    ; minimum\n\n@   IN  NS  ns-1.awsdns.com.\nwww IN  A   192.0.2.1`}
              className="w-full h-64 p-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f141c] text-gray-800 dark:text-gray-100 rounded font-mono text-[11px] focus:ring-1 focus:ring-aws-blue focus:border-aws-blue focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-955/15 border border-red-200 dark:border-red-900 rounded text-red-700 dark:text-red-400 text-[11px]">
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 dark:bg-[#0f141c]/50 border-t border-gray-200 dark:border-gray-800 px-5 py-3 flex items-center justify-end gap-2 transition-colors">
          <Button variant="secondary" onClick={onClose} disabled={loading} size="sm">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleImport} loading={loading} size="sm">
            Import
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Row ───────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="px-4 py-3"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
      <td className="px-3 py-3"><div className="h-3 bg-gray-200 rounded w-32" /></td>
      <td className="px-3 py-3"><div className="h-5 bg-gray-200 rounded w-12" /></td>
      <td className="px-3 py-3"><div className="h-3 bg-gray-200 rounded w-14" /></td>
      <td className="px-3 py-3"><div className="h-3 bg-gray-200 rounded w-16" /></td>
      <td className="px-3 py-3"><div className="h-3 bg-gray-200 rounded w-40" /></td>
    </tr>
  );
}

// ── DNS Records Page (inner) ───────────────────────────────────────────
function ZoneDetailInner() {
  const { zoneId } = useParams<{ zoneId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [zone, setZone] = useState<HostedZone | null>(null);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showEditZone, setShowEditZone] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteZoneModal, setShowDeleteZoneModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingZone, setDeletingZone] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState(searchParams.get("created") === "1");
  const [recordCreatedBanner, setRecordCreatedBanner] = useState<string | null>(null);

  const fetchZone = useCallback(async () => {
    try {
      const z = await api.getHostedZone(zoneId);
      setZone(z);
    } catch (err: any) {
      setError(err.message || "Zone not found.");
    }
  }, [zoneId]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getRecords(zoneId, { search, record_type: filterType || undefined });
      setRecords(data.records);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }, [zoneId, search, filterType]);

  useEffect(() => { fetchZone(); }, [fetchZone]);
  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  useEffect(() => {
    const createdCount = searchParams.get("records_created");
    if (createdCount) {
      setRecordCreatedBanner(`Record creation successful. Created ${createdCount} record(s).`);
    }
  }, [searchParams]);

  // Re-fetch after a short delay to catch records seeded by backend on zone creation
  // (covers the race condition where browser navigates before DB commit is visible)
  useEffect(() => {
    const timer = setTimeout(() => { fetchRecords(); }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === records.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(records.map((r) => r.id)));
  };

  const handleDeleteClick = () => {
    if (selectedIds.size === 0) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map((id) => api.deleteRecord(zoneId, id)));
      setSelectedIds(new Set());
      setShowDeleteModal(false);
      fetchRecords();
      fetchZone();
    } catch (err: any) {
      setError(err.message || "Failed to delete record(s).");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteZone = async () => {
    setDeletingZone(true);
    try {
      await api.deleteHostedZone(zoneId);
      setShowDeleteZoneModal(false);
      router.push("/hosted-zones?deleted=" + encodeURIComponent(zone?.name || ""));
    } catch (err: any) {
      setError(err.message || "Failed to delete hosted zone.");
    } finally {
      setDeletingZone(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] dark:bg-[#0f141c] text-xs text-gray-800 dark:text-gray-200 transition-colors">
      <Breadcrumbs
        items={[
          { label: "Hosted zones", href: "/hosted-zones" },
          { label: zone?.name || zoneId },
        ]}
      />

      {/* ── Success Banner ── */}
      {successBanner && zone && (
        <div
          role="alert"
          className="flex items-start gap-3 bg-[#1d6535] text-white px-5 py-3 text-sm"
          style={{ animation: "slideDown 0.3s ease" }}
        >
          <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-300" />
          <div className="flex-1">
            <span className="font-semibold">{zone.name} was successfully created.</span>
            <span className="block text-green-100 text-xs mt-0.5">
              Now you can create records in the hosted zone to specify how you want Route 53 to route traffic for your domain.
            </span>
          </div>
          <button
            onClick={() => setSuccessBanner(false)}
            className="text-green-200 hover:text-white ml-2 mt-0.5 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {recordCreatedBanner && (
        <div
          role="alert"
          className="flex items-start gap-3 bg-[#1d6535] text-white px-5 py-3 text-sm"
          style={{ animation: "slideDown 0.3s ease" }}
        >
          <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-300" />
          <div className="flex-1">
            <span className="font-semibold">{recordCreatedBanner}</span>
          </div>
          <button
            onClick={() => setRecordCreatedBanner(null)}
            className="text-green-200 hover:text-white ml-2 mt-0.5 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f141c] transition-colors">
        <button
          onClick={() => router.push("/hosted-zones")}
          className="flex items-center gap-1 text-xs text-aws-blue dark:text-blue-400 hover:underline mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Hosted zones
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{zone?.name || "Loading..."}</h1>
            <div className="flex items-center gap-3 mt-1">
              {zone && (
                <>
                  <Badge variant={zone.zone_type === "Public" ? "blue" : "gray"}>{zone.zone_type}</Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono flex items-center gap-1">
                    {zone.id}
                    <button onClick={() => copyToClipboard(zone.id, "zone-id")} className="text-gray-400 hover:text-aws-blue">
                      {copied === "zone-id" ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-550">{total} record{total !== 1 ? "s" : ""}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowDeleteZoneModal(true)} loading={deletingZone}>
              Delete zone
            </Button>
            <Button variant="secondary" size="sm" disabled>
              Test record
            </Button>
            <Button variant="secondary" size="sm" disabled>
              Configure query logging
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowEditZone(true)}>
              Edit hosted zone
            </Button>
          </div>
        </div>

        {/* AWS Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-800 mt-4 text-xs font-medium">
          <button className="pb-2 text-aws-blue border-b-2 border-aws-blue font-bold flex items-center gap-1.5">
            Records ({total})
          </button>
          <button className="pb-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent">
            Accelerated recovery
          </button>
          <button className="pb-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent">
            DNSSEC signing
          </button>
          <button className="pb-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent">
            Hosted zone tags (0)
          </button>
        </div>
      </div>

      {/* Records Toolbar */}
      <div className="px-6 py-2.5 bg-gray-50 dark:bg-[#0f141c]/40 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 flex-wrap transition-colors">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-48">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Filter records by property or value"
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f141c] text-gray-800 dark:text-gray-100 rounded focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue transition-colors"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">Search</Button>
        </form>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f141c] text-gray-700 dark:text-gray-250 rounded px-2.5 py-1.5 focus:outline-none focus:border-aws-blue transition-colors"
        >
          <option value="" className="bg-white dark:bg-[#0f141c]">All types</option>
          {["A", "AAAA", "CNAME", "MX", "TXT", "NS", "PTR", "SRV", "CAA"].map((t) => (
            <option key={t} value={t} className="bg-white dark:bg-[#0f141c]">{t}</option>
          ))}
        </select>

        {/* Action Buttons in Single Row */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRecords}
            disabled={loading}
            title="Refresh"
            className="p-1.5 text-aws-blue hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Button
            variant="secondary"
            size="sm"
            disabled={selectedIds.size !== 1}
            onClick={() => setShowEdit(true)}
          >
            Edit record
          </Button>

          <Button
            variant={selectedIds.size > 0 ? "danger" : "secondary"}
            size="sm"
            disabled={selectedIds.size === 0}
            onClick={handleDeleteClick}
            loading={deleting}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete record {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
          </Button>

          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="w-3.5 h-3.5" />
            Import zone file
          </Button>

          <a href={api.exportBindUrl(zoneId)} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">
              <Download className="w-3.5 h-3.5" />
              Export BIND
            </Button>
          </a>

          <a href={api.exportJsonUrl(zoneId)} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </Button>
          </a>

          <Button variant="primary" size="sm" onClick={() => router.push(`/hosted-zones/${zoneId}/create-record`)}>
            <Plus className="w-3.5 h-3.5" />
            Create record
          </Button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-3 text-xs text-red-700 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded px-3 py-2">
          ⚠ {error}
        </div>
      )}

      {/* Records Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#0f141c] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 transition-colors">
              <th className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={records.length > 0 && selectedIds.size === records.length}
                  onChange={toggleAll}
                  className="accent-aws-blue cursor-pointer"
                />
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300">Record name</th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300">Type</th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300">Routing policy</th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300">TTL (sec)</th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300">Value / Route traffic to</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}
            {!loading && records.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400">
                  <p className="font-semibold text-gray-500 text-sm">No DNS records found</p>
                  <p className="text-xs mt-1">Add records to route traffic for your domain.</p>
                  <Button variant="primary" className="mt-4" onClick={() => router.push(`/hosted-zones/${zoneId}/create-record`)}>
                    <Plus className="w-3.5 h-3.5" />
                    Create record
                  </Button>
                </td>
              </tr>
            )}
            {!loading && records.map((record) => (
              <tr
                key={record.id}
                onClick={() => toggleSelect(record.id)}
                className={`border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer ${
                  selectedIds.has(record.id) ? "bg-aws-rowActive dark:bg-[#202734]" : "hover:bg-aws-rowHover dark:hover:bg-[#202734]/50"
                }`}
              >
                <td
                  className="px-4 py-2.5 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(record.id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(record.id)}
                    onChange={(e) => e.stopPropagation()}
                    className="accent-aws-blue cursor-pointer"
                  />
                </td>
                <td className="px-3 py-2.5 font-mono text-gray-800 dark:text-gray-250 text-[11px]">{record.name}</td>
                <td className="px-3 py-2.5">
                  <Badge variant={RECORD_TYPE_COLORS[record.type] || "gray"}>{record.type}</Badge>
                </td>
                <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{record.routing_policy}</td>
                <td className="px-3 py-2.5 font-mono text-gray-600 dark:text-gray-400">{record.ttl}</td>
                <td className="px-3 py-2.5 font-mono text-[11px] text-gray-700 dark:text-gray-300 max-w-xs">
                  {record.records.slice(0, 2).map((v, i) => (
                    <div key={i} className="truncate">{v}</div>
                  ))}
                  {record.records.length > 2 && (
                    <span className="text-gray-400">+{record.records.length - 2} more</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {showEdit && selectedIds.size === 1 && (() => {
        const recordToEdit = records.find((r) => selectedIds.has(r.id));
        if (!recordToEdit) return null;
        return (
          <EditRecordModal
            zoneId={zoneId}
            record={recordToEdit}
            onClose={() => setShowEdit(false)}
            onUpdated={(updated) => {
              setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
              setRecordCreatedBanner(`Record "${updated.name}" (${updated.type}) was successfully updated.`);
            }}
          />
        );
      })()}

      {showDeleteModal && (
        <DeleteRecordModal
          count={selectedIds.size}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}

      {showEditZone && zone && (
        <EditZoneModal
          zone={zone}
          onClose={() => setShowEditZone(false)}
          onUpdated={(updated) => {
            setZone(updated);
            setRecordCreatedBanner(`Hosted zone "${updated.name}" details updated.`);
          }}
        />
      )}

      {showImport && zone && (
        <ImportBindModal
          zoneId={zoneId}
          zoneName={zone.name}
          onClose={() => setShowImport(false)}
          onImported={(count) => {
            fetchRecords();
            fetchZone();
            setRecordCreatedBanner(`Successfully imported ${count} record(s) from BIND zone file.`);
          }}
        />
      )}

      {showDeleteZoneModal && zone && (
        <DeleteZoneModal
          zones={[zone]}
          onClose={() => setShowDeleteZoneModal(false)}
          onConfirm={handleDeleteZone}
          loading={deletingZone}
        />
      )}
    </div>
  );
}

// ── Default export with Suspense boundary ─────────────────────────────
export default function ZoneDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-32 text-gray-400 text-sm">Loading...</div>}>
      <ZoneDetailInner />
    </Suspense>
  );
}
