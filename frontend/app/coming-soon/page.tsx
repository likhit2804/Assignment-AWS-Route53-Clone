"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Clock, AlertTriangle, ArrowLeft } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  "health-checks": "Health Checks",
  "traffic-policies": "Traffic Policies",
  "resolver": "Resolver",
  "profiles": "Profiles",
  "global-resolvers": "Global Resolvers",
  "shared-dns-views": "Shared DNS Views",
  "vpcs": "VPCs",
  "inbound-endpoints": "Inbound Endpoints",
  "outbound-endpoints": "Outbound Endpoints",
  "rules": "Rules",
  "query-logging": "Query Logging",
  "outposts": "Outposts",
};

function ComingSoonContent() {
  const params = useSearchParams();
  const section = params.get("section") ?? "";
  const label = SECTION_LABELS[section] || section || "This Feature";

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] bg-white px-6">
      {/* Mock Notice Banner */}
      <div className="w-full max-w-xl mb-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-sm text-xs">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-900 text-xs">Mocked / Non-Functional Section</h4>
            <p className="text-amber-800 mt-0.5 leading-relaxed text-[11px]">
              <strong>{label}</strong> is present as a placeholder per Route 53 assignment specifications. It does not implement real functionality. Fully working features:{" "}
              <strong>Hosted Zones</strong> and <strong>DNS Records</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Clock className="w-10 h-10 text-gray-400" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">{label}</h1>
      <p className="text-sm text-gray-500 text-center max-w-md mb-2">
        This section is part of the AWS Route 53 Console navigation but is not required for the current assignment scope.
      </p>
      <p className="text-xs text-gray-400 text-center max-w-md mb-8">
        Placeholder present as per:{" "}
        <em>Dashboard, Traffic Policies, Health Checks, Resolver, Profiles — A simple "Coming Soon" page is sufficient.</em>
      </p>

      <Link
        href="/hosted-zones"
        className="flex items-center gap-2 bg-[#0073bb] hover:bg-[#005f99] text-white text-xs font-semibold px-5 py-2.5 rounded transition-colors shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Go to Hosted Zones
      </Link>
    </div>
  );
}

export default function ComingSoonPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-10rem)] bg-white">
        <Clock className="w-10 h-10 text-gray-300 animate-pulse" />
      </div>
    }>
      <ComingSoonContent />
    </Suspense>
  );
}
