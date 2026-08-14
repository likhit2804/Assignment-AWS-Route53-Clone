"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Plus, Info, HelpCircle } from "lucide-react";
import { api } from "@/lib/api";
import { HostedZone, RecordType, RoutingPolicy } from "@/types";
import { Breadcrumbs } from "@/components/aws/Breadcrumbs";
import { Button } from "@/components/aws/ui";

interface RecordInput {
  name: string;
  type: RecordType;
  ttl: string;
  value: string;
  routing: RoutingPolicy;
}

const RECORD_TYPES_WITH_DESC: { value: RecordType; label: string }[] = [
  { value: "A", label: "A - Routes traffic to an IPv4 address and some AWS resources" },
  { value: "AAAA", label: "AAAA - Routes traffic to an IPv6 address and some AWS resources" },
  { value: "CNAME", label: "CNAME - Routes traffic to another domain name and to some AWS resources" },
  { value: "MX", label: "MX - Routes mail traffic to a mail server" },
  { value: "TXT", label: "TXT - Contains text information for use outside of Route 53" },
  { value: "NS", label: "NS - Identifies the name servers that are authoritative for the hosted zone" },
  { value: "PTR", label: "PTR - Maps an IP address to a domain name" },
  { value: "SRV", label: "SRV - Identifies a service by name, protocol, and domain name" },
  { value: "CAA", label: "CAA - Identifies the certification authorities that are allowed to issue certificates" },
];

function CreateRecordInner() {
  const { zoneId } = useParams<{ zoneId: string }>();
  const router = useRouter();
  const [zone, setZone] = useState<HostedZone | null>(null);
  const [loadingZone, setLoadingZone] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");

  const [records, setRecords] = useState<RecordInput[]>([
    { name: "", type: "A", ttl: "300", value: "", routing: "Simple" },
  ]);

  useEffect(() => {
    async function loadZone() {
      try {
        const z = await api.getHostedZone(zoneId);
        setZone(z);
      } catch (err: any) {
        setError(err.message || "Failed to load hosted zone.");
      } finally {
        setLoadingZone(false);
      }
    }
    loadZone();
  }, [zoneId]);

  const addRecord = () => {
    setRecords((prev) => [
      ...prev,
      { name: "", type: "A", ttl: "300", value: "", routing: "Simple" },
    ]);
  };

  const deleteRecord = (index: number) => {
    if (records.length <= 1) return;
    setRecords((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRecordField = (index: number, field: keyof RecordInput, val: any) => {
    setRecords((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: val } : r))
    );
  };

  const handleCreateRecords = async () => {
    setError("");
    setLoadingSubmit(true);
    try {
      // Validate all records first
      for (let i = 0; i < records.length; i++) {
        const r = records[i];
        const recordValues = r.value.split("\n").map((v) => v.trim()).filter(Boolean);
        if (recordValues.length === 0) {
          throw new Error(`Record ${i + 1}: At least one value/target is required.`);
        }
      }

      // Create all records sequentially or in parallel
      await Promise.all(
        records.map((r) => {
          const recordValues = r.value.split("\n").map((v) => v.trim()).filter(Boolean);
          // Standardize name formatting (prepend to zone name if needed)
          let finalName = r.name.trim();
          if (zone) {
            if (finalName === "") {
              finalName = zone.name;
            } else if (!finalName.endsWith(zone.name)) {
              finalName = `${finalName}.${zone.name}`;
            }
          }
          return api.createRecord(zoneId, {
            name: finalName,
            type: r.type,
            ttl: parseInt(r.ttl, 10) || 300,
            records: recordValues,
            routing_policy: r.routing,
          });
        })
      );

      // Redirect back with success message
      router.push(`/hosted-zones/${zoneId}?records_created=${records.length}`);
    } catch (err: any) {
      setError(err.message || "Failed to create one or more DNS records.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingZone) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-500">
        Loading hosted zone details...
      </div>
    );
  }

  const cleanZoneName = zone ? zone.name.replace(/\.$/, "") : "";

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#f8f9fa] dark:bg-[#0f141c] text-xs transition-colors">
      <Breadcrumbs
        items={[
          { label: "Hosted zones", href: "/hosted-zones" },
          { label: zone?.name || zoneId, href: `/hosted-zones/${zoneId}` },
          { label: "Create record" },
        ]}
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Method Picker Banner */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm transition-colors">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
              ▼ Record creation method
            </span>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-aws-blue bg-blue-50/20 dark:bg-blue-950/10 p-4 rounded cursor-pointer">
              <span className="font-bold text-gray-900 dark:text-white block mb-1">Quick create</span>
              <span className="text-gray-500 dark:text-gray-400 block leading-relaxed">
                Choose this method if you are confident in the process of creating records and know which options you need.
              </span>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 p-4 rounded opacity-65 cursor-not-allowed">
              <span className="font-bold text-gray-400 dark:text-gray-500 block mb-1">Wizard (recommended for new users)</span>
              <span className="text-gray-400 dark:text-gray-500 block leading-relaxed">
                Choose this method if you need more explanations as you create your record.
              </span>
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Create record</h1>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded text-xs">
              ⚠ {error}
            </div>
          )}

          {/* Quick Create Card */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-md shadow-sm p-6 space-y-6 transition-colors">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Quick create record</h2>
              <button className="text-aws-blue hover:underline font-semibold bg-none border-none cursor-pointer">
                Switch to wizard
              </button>
            </div>

            {/* List of record inputs */}
            {records.map((record, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-800 rounded-md p-5 bg-white dark:bg-[#0f141c] relative space-y-4 shadow-sm transition-colors"
              >
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-xs flex items-center gap-1">
                    ▼ Record {index + 1}
                  </span>
                  {records.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteRecord(index)}
                      className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1 flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name field */}
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      Record name <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-555 cursor-pointer" />
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={record.name}
                        onChange={(e) => updateRecordField(index, "name", e.target.value)}
                        placeholder="e.g. www"
                        className="flex-1 border border-gray-300 dark:border-gray-700 rounded-l px-3 py-1.5 focus:outline-none focus:border-aws-blue text-xs font-mono bg-white dark:bg-[#161b22] text-gray-850 dark:text-gray-100 transition-colors"
                      />
                      <span className="bg-gray-100 dark:bg-[#202734] border border-l-0 border-gray-300 dark:border-gray-700 rounded-r px-3 py-1.5 text-gray-500 dark:text-gray-400 font-mono select-none transition-colors">
                        .{cleanZoneName}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                      Keep blank to create a record for the root domain.
                    </span>
                  </div>

                  {/* Type dropdown */}
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      Record type <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-555 cursor-pointer" />
                    </label>
                    <select
                      value={record.type}
                      onChange={(e) => updateRecordField(index, "type", e.target.value as RecordType)}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 focus:outline-none focus:border-aws-blue text-xs text-gray-800 dark:text-gray-200 bg-white dark:bg-[#161b22] transition-colors"
                    >
                      {RECORD_TYPES_WITH_DESC.map((t) => (
                        <option key={t.value} value={t.value} className="bg-white dark:bg-[#161b22]">
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Alias toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id={`alias-${index}`}
                    disabled
                    className="w-3.5 h-3.5 text-aws-blue rounded border-gray-300 dark:border-gray-700 focus:ring-aws-blue"
                  />
                  <label htmlFor={`alias-${index}`} className="font-semibold text-gray-400 dark:text-gray-500 cursor-not-allowed select-none">
                    Alias
                  </label>
                </div>

                {/* Value field */}
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                    Value <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-555 cursor-pointer" />
                  </label>
                  <textarea
                    rows={4}
                    value={record.value}
                    onChange={(e) => updateRecordField(index, "value", e.target.value)}
                    placeholder={
                      record.type === "A"
                        ? "192.0.2.235"
                        : record.type === "CNAME"
                        ? "target.example.com."
                        : "Enter multiple values on separate lines"
                    }
                    className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-aws-blue text-xs font-mono bg-white dark:bg-[#161b22] text-gray-850 dark:text-gray-100 transition-colors"
                  />
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                    Enter multiple values on separate lines.
                  </span>
                </div>

                {/* TTL and Routing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TTL */}
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      TTL (seconds) <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-555 cursor-pointer" />
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={record.ttl}
                        onChange={(e) => updateRecordField(index, "ttl", e.target.value)}
                        className="w-32 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 focus:outline-none focus:border-aws-blue text-xs bg-white dark:bg-[#161b22] text-gray-800 dark:text-gray-100 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => updateRecordField(index, "ttl", "60")}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        1m
                      </button>
                      <button
                        type="button"
                        onClick={() => updateRecordField(index, "ttl", "3600")}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        1h
                      </button>
                      <button
                        type="button"
                        onClick={() => updateRecordField(index, "ttl", "86400")}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        1d
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                      Recommended values: 60 to 172800 (two days)
                    </span>
                  </div>

                  {/* Routing */}
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      Routing policy <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-555 cursor-pointer" />
                    </label>
                    <select
                      value={record.routing}
                      onChange={(e) => updateRecordField(index, "routing", e.target.value as RoutingPolicy)}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 focus:outline-none focus:border-aws-blue text-xs text-gray-800 dark:text-gray-200 bg-white dark:bg-[#161b22] transition-colors"
                    >
                      <option value="Simple" className="bg-white dark:bg-[#161b22]">Simple routing</option>
                      <option value="Weighted" className="bg-white dark:bg-[#161b22]">Weighted routing</option>
                      <option value="Latency" className="bg-white dark:bg-[#161b22]">Latency routing</option>
                      <option value="Failover" className="bg-white dark:bg-[#161b22]">Failover routing</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Record Trigger */}
            <div className="pt-2">
              <button
                type="button"
                onClick={addRecord}
                className="text-aws-blue dark:text-blue-400 hover:text-[#0b548a] dark:hover:text-blue-300 font-bold text-xs flex items-center gap-1.5 border border-gray-300 dark:border-gray-700 rounded px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm bg-white dark:bg-[#161b22]"
              >
                <Plus className="w-4 h-4" /> Add another record
              </button>
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={() => router.push(`/hosted-zones/${zoneId}`)}
            disabled={loadingSubmit}
          >
            Cancel
          </Button>
          <button
            onClick={handleCreateRecords}
            disabled={loadingSubmit}
            className={`px-5 py-2 rounded text-xs font-bold text-white transition-all shadow-sm ${
              loadingSubmit
                ? "bg-aws-orange/70 cursor-not-allowed"
                : "bg-aws-orange hover:bg-[#c9600d]"
            }`}
          >
            {loadingSubmit ? "Creating..." : "Create records"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreateRecordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading...</div>}>
      <CreateRecordInner />
    </Suspense>
  );
}
