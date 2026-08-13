"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronDown, ChevronRight } from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onClose }) => {
  const pathname = usePathname();
  const [globalResolverOpen, setGlobalResolverOpen] = useState(true);
  const [vpcResolverOpen, setVpcResolverOpen] = useState(true);

  return (
    <aside
      className={`bg-white border-gray-300 flex flex-col select-none flex-shrink-0 text-xs text-gray-800 transition-all duration-300 ease-in-out overflow-hidden z-20 ${
        collapsed
          ? "w-0 border-r-0 opacity-0 pointer-events-none"
          : "w-56 border-r opacity-100"
      }`}
    >
      {/* Fixed-width inner container (w-56) prevents layout text squishing during sliding width animation */}
      <div className="w-56 flex flex-col h-full min-h-[calc(100vh-6.5rem)]">
        
        {/* Sidebar Header: Route 53 Title (Links to Landing Page) + Left Chevron Collapse Button */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between font-bold text-sm text-gray-900 flex-shrink-0">
          <Link href="/" className="hover:text-[#0073bb] transition-colors" title="Route 53 Overview / Landing Page">
            Route 53
          </Link>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
            title="Collapse navigation"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Main Navigation Items */}
        <div className="flex-1 overflow-y-auto py-2">
          
          {/* Top Section */}
          <div className="space-y-0.5 px-1">
            <Link
              href="/dashboard"
              className={`block px-3 py-1.5 rounded transition-colors ${
                pathname === "/dashboard" ? "font-semibold text-aws-text bg-gray-100" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/hosted-zones"
              className={`block px-3 py-1.5 rounded transition-colors ${
                pathname.startsWith("/hosted-zones") ? "font-semibold text-aws-text bg-gray-100" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Hosted zones
            </Link>

            <Link
              href="/coming-soon?section=health-checks"
              className={`block px-3 py-1.5 rounded transition-colors ${
                pathname.startsWith("/health-checks") ? "font-semibold text-aws-text bg-gray-100" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Health checks
            </Link>

            <Link
              href="/coming-soon?section=profiles"
              className={`block px-3 py-1.5 rounded transition-colors ${
                pathname.startsWith("/profiles") ? "font-semibold text-aws-text bg-gray-100" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Profiles
            </Link>
          </div>

          {/* Accordion 1: Global Resolver */}
          <div className="mt-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => setGlobalResolverOpen(!globalResolverOpen)}
              className="w-full flex items-center justify-start gap-1 px-3 py-1 font-bold text-gray-900 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="transition-transform duration-200 transform">
                {globalResolverOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                )}
              </span>
              <span>Global Resolver</span>
            </button>

            <div
              className={`pl-6 pr-2 py-1 space-y-1 text-gray-600 overflow-hidden transition-all duration-200 ease-in-out ${
                globalResolverOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0 py-0"
              }`}
            >
              <Link href="/coming-soon?section=global-resolvers" className="flex items-center justify-between py-1 hover:text-aws-blue">
                <span>Global resolvers</span>
                <span className="text-[10px] text-aws-blue font-semibold">New</span>
              </Link>
              <Link href="/coming-soon?section=shared-dns-views" className="flex items-center justify-between py-1 hover:text-aws-blue">
                <span>Shared DNS views</span>
                <span className="text-[10px] text-aws-blue font-semibold">New</span>
              </Link>
            </div>
          </div>

          {/* Accordion 2: VPC Resolver */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => setVpcResolverOpen(!vpcResolverOpen)}
              className="w-full flex items-center justify-start gap-1 px-3 py-1 font-bold text-gray-900 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="transition-transform duration-200 transform">
                {vpcResolverOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                )}
              </span>
              <span>VPC Resolver</span>
            </button>

            <div
              className={`pl-6 pr-2 py-1 space-y-1 text-gray-600 overflow-hidden transition-all duration-200 ease-in-out ${
                vpcResolverOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0 py-0"
              }`}
            >
              <Link href="/coming-soon?section=vpcs" className="block py-1 hover:text-aws-blue">VPCs</Link>
              <Link href="/coming-soon?section=inbound-endpoints" className="block py-1 hover:text-aws-blue">Inbound endpoints</Link>
              <Link href="/coming-soon?section=outbound-endpoints" className="block py-1 hover:text-aws-blue">Outbound endpoints</Link>
              <Link href="/coming-soon?section=rules" className="block py-1 hover:text-aws-blue">Rules</Link>
              <Link href="/coming-soon?section=query-logging" className="block py-1 hover:text-aws-blue">Query logging</Link>
              <Link href="/coming-soon?section=outposts" className="block py-1 hover:text-aws-blue">Outposts</Link>
            </div>
          </div>

        </div>
      </div>
    </aside>
  );
};
