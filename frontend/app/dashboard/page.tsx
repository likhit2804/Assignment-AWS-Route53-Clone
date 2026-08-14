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
  const [notifications] = useState([
    {
      resource: "example.com (Hosted Zone)",
      status: "SYNC_COMPLETE - All 35 DNS records successfully initialized",
      update: "Just now"
    },
    {
      resource: "internal.net (Hosted Zone)",
      status: "SYNC_COMPLETE - VPC association vpc-0a8b9c1d2e3f4a5b6 verified",
      update: "5 mins ago"
    },
    {
      resource: "Route 53 Database Seeder",
      status: "SUCCESS - Seeding of 25 zones completed with zero errors",
      update: "10 mins ago"
    },
    {
      resource: "Route 53 Resolver Rule",
      status: "ACTIVE - Forwarding rules for outbound endpoints initialized",
      update: "2 hours ago"
    }
  ]);

  const filteredNotifications = notifications.filter(notif =>
    notif.resource.toLowerCase().includes(searchNotification.toLowerCase()) ||
    notif.status.toLowerCase().includes(searchNotification.toLowerCase())
  );

  const handleDomainCheck = () => {
    if (!domainCheckInput.trim()) return;
    setCheckResult(`Domain "${domainCheckInput.trim()}" is available for registration!`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0f141c] text-gray-900 dark:text-gray-250 font-sans p-6 max-w-7xl w-full mx-auto select-none transition-colors">
      
      {/* Page Header: Title + Info Link */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Route 53 Dashboard</h1>
          <a
            href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html"
            target="_blank"
            rel="noreferrer"
            className="text-[#0073bb] dark:text-blue-400 hover:underline text-xs font-medium flex items-center gap-1"
          >
            <span>Info</span>
          </a>
        </div>
      </div>

      {/* ── 1. Card 1: Main Quick Actions Grid ───────────────────────────── */}
      <div className="bg-white dark:bg-[#16191f] border border-gray-300 dark:border-gray-800 rounded-lg p-6 mb-6 shadow-sm transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          
          {/* Action 1: DNS management */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">DNS management</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 max-w-sm leading-relaxed min-h-[36px]">
              A hosted zone tells Route 53 how to respond to DNS queries for a domain such as example.com.
            </p>
            <button
              onClick={() => router.push("/hosted-zones")}
              className="border border-[#0073bb] dark:border-blue-500 text-[#0073bb] dark:text-blue-400 hover:bg-[#ecf5fc] dark:hover:bg-[#202734] bg-white dark:bg-[#16191f] px-5 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
            >
              Create hosted zone
            </button>
          </div>

          {/* Action 2: Availability monitoring */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Availability monitoring</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 max-w-sm leading-relaxed min-h-[36px]">
              Health checks monitor your applications and web resources, and direct DNS queries to healthy resources.
            </p>
            <button
              onClick={() => router.push("/coming-soon?section=health-checks")}
              className="border border-[#0073bb] dark:border-blue-500 text-[#0073bb] dark:text-blue-400 hover:bg-[#ecf5fc] dark:hover:bg-[#202734] bg-white dark:bg-[#16191f] px-5 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
            >
              Create health check
            </button>
          </div>

          {/* Action 3: Traffic management */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Traffic management</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 max-w-sm leading-relaxed min-h-[36px]">
              A visual tool that lets you easily create policies for multiple endpoints in complex configurations.
            </p>
            <button
              onClick={() => router.push("/coming-soon?section=traffic-policies")}
              className="border border-[#0073bb] dark:border-blue-500 text-[#0073bb] dark:text-blue-400 hover:bg-[#ecf5fc] dark:hover:bg-[#202734] bg-white dark:bg-[#16191f] px-5 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
            >
              Create policy
            </button>
          </div>

          {/* Action 4: Domain registration */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Domain registration</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 max-w-sm leading-relaxed min-h-[36px]">
              A domain is the name, such as example.com, that your users use to access your application.
            </p>
            <a
              href="#register-domain-card"
              className="border border-[#0073bb] dark:border-blue-500 text-[#0073bb] dark:text-blue-400 hover:bg-[#ecf5fc] dark:hover:bg-[#202734] bg-white dark:bg-[#16191f] px-5 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm inline-block text-center"
            >
              Register domain
            </a>
          </div>

        </div>
      </div>

      {/* ── 2. Card 2: Register domain Section ─────────────────────────────── */}
      <div
        id="register-domain-card"
        className="bg-white dark:bg-[#16191f] border border-gray-300 dark:border-gray-800 rounded-lg p-6 mb-6 shadow-sm transition-colors"
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Register domain</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
          Find and register an available domain, or{" "}
          <a href="#" className="text-[#0073bb] dark:text-blue-400 hover:underline">
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
            className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#0073bb] focus:border-[#0073bb] focus:outline-none placeholder-italic bg-white dark:bg-[#0f141c] text-gray-855 dark:text-gray-100 transition-colors"
          />
        </div>

        {/* Help text */}
        <p className="text-[11px] text-gray-555 dark:text-gray-400 max-w-3xl mb-4 leading-relaxed">
          Each label (each part between dots) can be up to 63 characters long and must start with a-z or 0-9. Maximum length: 255 characters, including dots. Valid characters: a-z, 0-9, and - (hyphen)
        </p>

        {/* Action Button */}
        <button
          onClick={handleDomainCheck}
          className="border border-[#0073bb] dark:border-blue-500 text-[#0073bb] dark:text-blue-400 hover:bg-[#ecf5fc] dark:hover:bg-[#202734] bg-white dark:bg-[#16191f] px-6 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
        >
          Check
        </button>

        {checkResult && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-955/15 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-300 rounded text-xs max-w-3xl">
            {checkResult}
          </div>
        )}
      </div>

      {/* ── 3. Card 3: Notifications Table Section ─────────────────────────── */}
      <div
        className="bg-white dark:bg-[#16191f] border border-gray-300 dark:border-gray-800 rounded-lg p-6 mb-6 shadow-sm transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
          <button className="p-1 rounded text-gray-555 hover:text-gray-900 hover:bg-gray-100 transition-colors" title="Refresh notifications">
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
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f141c] text-gray-800 dark:text-gray-100 rounded pl-9 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-[#0073bb] focus:outline-none placeholder-italic transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-555 dark:text-gray-400">
            <button disabled className="p-1 text-gray-300 dark:text-gray-600 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>1</span>
            <button disabled className="p-1 text-gray-300 dark:text-gray-600 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="border border-gray-200 dark:border-gray-800 rounded overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50 dark:bg-[#16191f] border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold transition-colors">
              <tr>
                <th className="px-4 py-2.5 border-r border-gray-200 dark:border-gray-800 w-1/3">Resource</th>
                <th className="px-4 py-2.5 border-r border-gray-200 dark:border-gray-800 w-1/3">Status</th>
                <th className="px-4 py-2.5 w-1/3">Last update</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-xs bg-white dark:bg-[#16191f] transition-colors"
                  >
                    No notifications to display
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((notif, index) => (
                  <tr key={index} className="border-b border-gray-150 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-[#1c222c] transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-800">{notif.resource}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-800">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        notif.status.includes("SUCCESS") || notif.status.includes("SYNC_COMPLETE") || notif.status.includes("ACTIVE")
                          ? "bg-green-50 dark:bg-green-955/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900"
                          : "bg-blue-50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900"
                      }`}>
                        {notif.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{notif.update}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Card 4: More resources Section ──────────────────────────────── */}
      <div
        className="bg-white dark:bg-[#16191f] border border-gray-300 dark:border-gray-800 rounded-lg p-6 mb-6 shadow-sm transition-colors"
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
          <span>More resources</span>
          <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </h2>

        <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs font-medium">
          <div className="py-2.5 first:pt-0">
            <a href="https://docs.aws.amazon.com/route53/" target="_blank" rel="noreferrer" className="text-[#0073bb] dark:text-blue-400 hover:underline">
              Documentation
            </a>
          </div>
          <div className="py-2.5">
            <a href="https://docs.aws.amazon.com/Route53/latest/APIReference/Welcome.html" target="_blank" rel="noreferrer" className="text-[#0073bb] dark:text-blue-400 hover:underline">
              API reference
            </a>
          </div>
          <div className="py-2.5">
            <a href="https://aws.amazon.com/route53/faqs/" target="_blank" rel="noreferrer" className="text-[#0073bb] dark:text-blue-400 hover:underline">
              FAQs
            </a>
          </div>
          <div className="py-2.5">
            <a href="https://repost.aws/tags/TA4_i_g3S9SLm27z0M7L91wA/amazon-route-53" target="_blank" rel="noreferrer" className="text-[#0073bb] dark:text-blue-400 hover:underline">
              Forum - DNS and health checks
            </a>
          </div>
          <div className="py-2.5">
            <a href="https://repost.aws/tags/TA4_i_g3S9SLm27z0M7L91wA/amazon-route-53" target="_blank" rel="noreferrer" className="text-[#0073bb] dark:text-blue-400 hover:underline">
              Forum - Domain name registration
            </a>
          </div>
          <div className="py-2.5 last:pb-0">
            <a href="https://console.aws.amazon.com/support/home#/case/create?issueType=service-limit-increase" target="_blank" rel="noreferrer" className="text-[#0073bb] dark:text-blue-400 hover:underline">
              Request a limit increase
            </a>
          </div>
        </div>
      </div>

      {/* ── 5. Card 5: Service health Section ──────────────────────────────── */}
      <div
        className="bg-white dark:bg-[#16191f] border border-gray-300 dark:border-gray-800 rounded-lg p-6 mb-6 shadow-sm transition-colors"
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Service health</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          To view the current status of Route 53, see the{" "}
          <a
            href="https://health.aws.amazon.com/health/status"
            target="_blank"
            rel="noreferrer"
            className="text-[#0073bb] dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>AWS Service Health Dashboard</span>
            <ExternalLink className="w-3 h-3 text-[#0073bb] dark:text-blue-400" />
          </a>
          .
        </p>
      </div>
    </div>
  );
}
