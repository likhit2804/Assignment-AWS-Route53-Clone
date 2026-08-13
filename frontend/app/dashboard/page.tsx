"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, RotateCw, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function Route53DashboardPage() {
  const router = useRouter();
  const [domainCheckInput, setDomainCheckInput] = useState("");
  const [searchNotification, setSearchNotification] = useState("");
  const [checkResult, setCheckResult] = useState<string | null>(null);

  const handleDomainCheck = () => {
    if (!domainCheckInput.trim()) return;
    setCheckResult(`Domain "${domainCheckInput.trim()}" is available for registration!`);
  };

  return (
    <div className="flex-1 bg-white text-gray-900 font-sans p-6 max-w-7xl w-full mx-auto select-none">
      
      {/* Page Header: Title + Info Link */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Route 53 Dashboard</h1>
          <a
            href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html"
            target="_blank"
            rel="noreferrer"
            className="text-[#0073bb] hover:underline text-xs font-medium flex items-center gap-1"
          >
            <span>Info</span>
          </a>
        </div>
      </div>

      {/* ── 1. Card 1: Main Quick Actions Grid ───────────────────────────── */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          
          {/* Action 1: DNS management */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-base font-bold text-gray-900 mb-2">DNS management</h3>
            <p className="text-xs text-gray-600 mb-4 max-w-sm leading-relaxed min-h-[36px]">
              A hosted zone tells Route 53 how to respond to DNS queries for a domain such as example.com.
            </p>
            <button
              onClick={() => router.push("/hosted-zones")}
              className="border border-[#0073bb] text-[#0073bb] hover:bg-[#ecf5fc] bg-white px-5 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
            >
              Create hosted zone
            </button>
          </div>

          {/* Action 2: Availability monitoring */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-base font-bold text-gray-900 mb-2">Availability monitoring</h3>
            <p className="text-xs text-gray-600 mb-4 max-w-sm leading-relaxed min-h-[36px]">
              Health checks monitor your applications and web resources, and direct DNS queries to healthy resources.
            </p>
            <button
              onClick={() => router.push("/coming-soon?section=health-checks")}
              className="border border-[#0073bb] text-[#0073bb] hover:bg-[#ecf5fc] bg-white px-5 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
            >
              Create health check
            </button>
          </div>

          {/* Action 3: Traffic management */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-base font-bold text-gray-900 mb-2">Traffic management</h3>
            <p className="text-xs text-gray-600 mb-4 max-w-sm leading-relaxed min-h-[36px]">
              A visual tool that lets you easily create policies for multiple endpoints in complex configurations.
            </p>
            <button
              onClick={() => router.push("/coming-soon?section=traffic-policies")}
              className="border border-[#0073bb] text-[#0073bb] hover:bg-[#ecf5fc] bg-white px-5 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
            >
              Create policy
            </button>
          </div>

          {/* Action 4: Domain registration */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-base font-bold text-gray-900 mb-2">Domain registration</h3>
            <p className="text-xs text-gray-600 mb-4 max-w-sm leading-relaxed min-h-[36px]">
              A domain is the name, such as example.com, that your users use to access your application.
            </p>
            <a
              href="#register-domain-card"
              className="border border-[#0073bb] text-[#0073bb] hover:bg-[#ecf5fc] bg-white px-5 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm inline-block"
            >
              Register domain
            </a>
          </div>

        </div>
      </div>

      {/* ── 2. Card 2: Register domain Section ─────────────────────────────── */}
      <div id="register-domain-card" className="bg-white border border-gray-300 rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Register domain</h2>
        <p className="text-xs text-gray-600 mb-4">
          Find and register an available domain, or{" "}
          <a href="#" className="text-[#0073bb] hover:underline">
            transfer your existing domains
          </a>{" "}
          to Route 53.
        </p>

        {/* Input Box */}
        <div className="mb-2 max-w-3xl">
          <input
            type="text"
            placeholder="Enter a domain name"
            value={domainCheckInput}
            onChange={(e) => setDomainCheckInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDomainCheck()}
            className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#0073bb] focus:border-[#0073bb] focus:outline-none placeholder-italic text-gray-800"
          />
        </div>

        {/* Help text */}
        <p className="text-[11px] text-gray-500 max-w-3xl mb-4 leading-relaxed">
          Each label (each part between dots) can be up to 63 characters long and must start with a-z or 0-9. Maximum length: 255 characters, including dots. Valid characters: a-z, 0-9, and - (hyphen)
        </p>

        {/* Action Button */}
        <button
          onClick={handleDomainCheck}
          className="border border-[#0073bb] text-[#0073bb] hover:bg-[#ecf5fc] bg-white px-6 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
        >
          Check
        </button>

        {checkResult && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 text-green-800 rounded text-xs max-w-3xl">
            {checkResult}
          </div>
        )}
      </div>

      {/* ── 3. Card 3: Notifications Table Section ─────────────────────────── */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          <button className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors" title="Refresh notifications">
            <RotateCw className="w-4 h-4 text-[#0073bb]" />
          </button>
        </div>

        {/* Search & Pagination Bar */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Find notifications"
              value={searchNotification}
              onChange={(e) => setSearchNotification(e.target.value)}
              className="w-full border border-gray-300 rounded pl-9 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-[#0073bb] focus:outline-none text-gray-800 placeholder-italic"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <button disabled className="p-1 text-gray-300 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>1</span>
            <button disabled className="p-1 text-gray-300 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-2.5 border-r border-gray-200 w-1/3">Resource</th>
                <th className="px-4 py-2.5 border-r border-gray-200 w-1/3">Status</th>
                <th className="px-4 py-2.5 w-1/3">Last update</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500 text-xs">
                  No notifications to display
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Card 4: More resources Section ──────────────────────────────── */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          <span>More resources</span>
          <ExternalLink className="w-4 h-4 text-gray-600" />
        </h2>

        <div className="divide-y divide-gray-100 text-xs font-medium">
          <div className="py-2.5 first:pt-0">
            <a href="https://docs.aws.amazon.com/route53/" target="_blank" rel="noreferrer" className="text-[#0073bb] hover:underline">
              Documentation
            </a>
          </div>
          <div className="py-2.5">
            <a href="https://docs.aws.amazon.com/Route53/latest/APIReference/Welcome.html" target="_blank" rel="noreferrer" className="text-[#0073bb] hover:underline">
              API reference
            </a>
          </div>
          <div className="py-2.5">
            <a href="https://aws.amazon.com/route53/faqs/" target="_blank" rel="noreferrer" className="text-[#0073bb] hover:underline">
              FAQs
            </a>
          </div>
          <div className="py-2.5">
            <a href="https://repost.aws/tags/TA4_i_g3S9SLm27z0M7L91wA/amazon-route-53" target="_blank" rel="noreferrer" className="text-[#0073bb] hover:underline">
              Forum - DNS and health checks
            </a>
          </div>
          <div className="py-2.5">
            <a href="https://repost.aws/tags/TA4_i_g3S9SLm27z0M7L91wA/amazon-route-53" target="_blank" rel="noreferrer" className="text-[#0073bb] hover:underline">
              Forum - Domain name registration
            </a>
          </div>
          <div className="py-2.5 last:pb-0">
            <a href="https://console.aws.amazon.com/support/home#/case/create?issueType=service-limit-increase" target="_blank" rel="noreferrer" className="text-[#0073bb] hover:underline">
              Request a limit increase
            </a>
          </div>
        </div>
      </div>

      {/* ── 5. Card 5: Service health Section ──────────────────────────────── */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Service health</h2>
        <p className="text-xs text-gray-600">
          To view the current status of Route 53, see the{" "}
          <a
            href="https://health.aws.amazon.com/health/status"
            target="_blank"
            rel="noreferrer"
            className="text-[#0073bb] hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>AWS Service Health Dashboard</span>
            <ExternalLink className="w-3 h-3 text-[#0073bb]" />
          </a>
          .
        </p>
      </div>

    </div>
  );
}
