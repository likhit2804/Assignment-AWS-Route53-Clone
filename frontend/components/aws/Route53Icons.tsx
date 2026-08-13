"use client";

import React from "react";

// Official AWS Logo with Smile Curve
export const AwsLogoWithSmile: React.FC<{ className?: string }> = ({ className = "h-5" }) => (
  <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* AWS Text */}
    <text x="5" y="38" fontFamily="sans-serif" fontWeight="900" fontSize="38" fill="#ffffff" letterSpacing="-1">aws</text>
    {/* AWS Orange Smile Arrow */}
    <path d="M 8 46 Q 48 62 88 42" stroke="#ec7211" strokeWidth="5.5" strokeLinecap="round" />
    <path d="M 84 38 L 92 42 L 86 50 Z" fill="#ec7211" />
  </svg>
);

// Product 1: Domain Names Illustration (Route 53 shield connected to Laptop browser window)
export const DomainNamesIllustration: React.FC = () => (
  <svg viewBox="0 0 160 90" className="w-32 h-18 select-none">
    {/* Left Route 53 Shield */}
    <g transform="translate(10, 20)">
      <path d="M 20 4 L 36 10 V 25 C 36 34 20 40 20 40 C 20 40 4 34 4 25 V 10 Z" fill="#ffffff" stroke="#545b64" strokeWidth="2"/>
      <text x="20" y="26" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#16191f">53</text>
    </g>

    {/* Dashed Blue Connection Curve */}
    <path d="M 48 40 C 70 20 85 20 105 38" fill="none" stroke="#0073bb" strokeWidth="2" strokeDasharray="3 3"/>

    {/* Right Laptop Browser Window */}
    <g transform="translate(92, 16)">
      {/* Screen Frame */}
      <rect x="0" y="0" width="50" height="34" rx="3" fill="#ffffff" stroke="#545b64" strokeWidth="2"/>
      <line x1="0" y1="9" x2="50" y2="9" stroke="#545b64" strokeWidth="1.5"/>
      {/* Search Input inside Browser */}
      <rect x="4" y="3.5" width="22" height="3.5" rx="1" fill="#0073bb"/>
      {/* Content illustration lines */}
      <rect x="6" y="14" width="26" height="5" rx="1" fill="#eaedd1"/>
      <rect x="6" y="22" width="18" height="3" rx="1" fill="#d5dbdb"/>
      {/* Laptop Base Keyboard */}
      <path d="M -6 34 L 56 34 L 50 39 L -0 39 Z" fill="#e9ecef" stroke="#545b64" strokeWidth="1.5"/>
      {/* Cursor Arrow */}
      <path d="M 32 18 L 44 30 L 38 31 L 36 36 L 32 35 L 34 30 Z" fill="#0073bb"/>
    </g>
  </svg>
);

// Product 2: Hosted Zones Illustration (3 Route 53 shields linked in cluster)
export const HostedZonesIllustration: React.FC = () => (
  <svg viewBox="0 0 160 90" className="w-32 h-18 select-none">
    {/* Dotted Blue Triangle Connecting Paths */}
    <path d="M 80 18 L 30 60 L 130 60 Z" fill="none" stroke="#0073bb" strokeWidth="2" strokeDasharray="3 3"/>

    {/* Top Secondary Shield */}
    <g transform="translate(66, 2)">
      <path d="M 14 3 L 26 7 V 18 C 26 25 14 30 14 30 C 14 30 2 25 2 18 V 7 Z" fill="#ffffff" stroke="#545b64" strokeWidth="1.8"/>
      <text x="14" y="19" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#16191f">53</text>
    </g>

    {/* Center Prominent Shield */}
    <g transform="translate(60, 36)">
      <path d="M 20 4 L 36 10 V 25 C 36 34 20 40 20 40 C 20 40 4 34 4 25 V 10 Z" fill="#ffffff" stroke="#0073bb" strokeWidth="2.5"/>
      <text x="20" y="26" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0073bb">53</text>
    </g>

    {/* Left Secondary Shield */}
    <g transform="translate(16, 42)">
      <path d="M 14 3 L 26 7 V 18 C 26 25 14 30 14 30 C 14 30 2 25 2 18 V 7 Z" fill="#ffffff" stroke="#545b64" strokeWidth="1.8"/>
      <text x="14" y="19" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#16191f">53</text>
    </g>

    {/* Right Secondary Shield */}
    <g transform="translate(116, 42)">
      <path d="M 14 3 L 26 7 V 18 C 26 25 14 30 14 30 C 14 30 2 25 2 18 V 7 Z" fill="#ffffff" stroke="#545b64" strokeWidth="1.8"/>
      <text x="14" y="19" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#16191f">53</text>
    </g>
  </svg>
);

// Product 3: Health Checks Illustration (Heartbeat pulse passing through Route 53 shield)
export const HealthChecksIllustration: React.FC = () => (
  <svg viewBox="0 0 160 90" className="w-32 h-18 select-none">
    {/* Blue Heartbeat Pulse Wave */}
    <path d="M 10 45 L 38 45 L 46 15 L 56 70 L 66 30 L 74 45 L 150 45" fill="none" stroke="#0073bb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

    {/* Center Route 53 Shield */}
    <g transform="translate(60, 22)">
      <path d="M 20 4 L 36 10 V 25 C 36 34 20 40 20 40 C 20 40 4 34 4 25 V 10 Z" fill="#ffffff" stroke="#545b64" strokeWidth="2"/>
      <text x="20" y="26" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#16191f">53</text>
    </g>
  </svg>
);

// Product 4: Traffic Flow Illustration (Route 53 shield branching to multiple endpoint nodes)
export const TrafficFlowIllustration: React.FC = () => (
  <svg viewBox="0 0 160 90" className="w-32 h-18 select-none">
    {/* Left Route 53 Shield */}
    <g transform="translate(10, 22)">
      <path d="M 20 4 L 36 10 V 25 C 36 34 20 40 20 40 C 20 40 4 34 4 25 V 10 Z" fill="#ffffff" stroke="#545b64" strokeWidth="2"/>
      <text x="20" y="26" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#16191f">53</text>
    </g>

    {/* Branching Dashed Lines */}
    <path d="M 48 42 Q 80 18 115 18" fill="none" stroke="#0073bb" strokeWidth="2" strokeDasharray="3 3"/>
    <path d="M 48 42 L 115 42" fill="none" stroke="#0073bb" strokeWidth="2" strokeDasharray="3 3"/>
    <path d="M 48 42 Q 80 66 115 66" fill="none" stroke="#0073bb" strokeWidth="2" strokeDasharray="3 3"/>

    {/* Tree Endpoint Circles */}
    <circle cx="115" cy="18" r="4.5" fill="#ffffff" stroke="#545b64" strokeWidth="2"/>
    <circle cx="115" cy="42" r="4.5" fill="#ffffff" stroke="#545b64" strokeWidth="2"/>
    <circle cx="115" cy="66" r="4.5" fill="#ffffff" stroke="#545b64" strokeWidth="2"/>

    {/* Leaf Endpoints */}
    <circle cx="138" cy="10" r="3" fill="#0073bb"/>
    <circle cx="138" cy="26" r="3" fill="#0073bb"/>
    <circle cx="138" cy="34" r="3" fill="#0073bb"/>
    <circle cx="138" cy="50" r="3" fill="#0073bb"/>
    <circle cx="138" cy="58" r="3" fill="#0073bb"/>
    <circle cx="138" cy="74" r="3" fill="#0073bb"/>
  </svg>
);

// Product 5: Resolver Illustration (Stacked VPC database servers connected through Route 53 to cloud)
export const ResolverIllustration: React.FC = () => (
  <svg viewBox="0 0 160 90" className="w-32 h-18 select-none">
    {/* Left Stacked Database Servers */}
    <g transform="translate(10, 22)">
      <rect x="0" y="0" width="28" height="13" rx="2" fill="#ffffff" stroke="#545b64" strokeWidth="1.5"/>
      <circle cx="6" cy="6.5" r="1.5" fill="#0073bb"/>
      <circle cx="12" cy="6.5" r="1.5" fill="#0073bb"/>

      <rect x="0" y="16" width="28" height="13" rx="2" fill="#ffffff" stroke="#545b64" strokeWidth="1.5"/>
      <circle cx="6" cy="22.5" r="1.5" fill="#0073bb"/>
      <circle cx="12" cy="22.5" r="1.5" fill="#0073bb"/>
    </g>

    {/* Connecting Dashed Line */}
    <path d="M 40 38 L 56 38 M 92 38 L 112 38" stroke="#0073bb" strokeWidth="2" strokeDasharray="3 3"/>

    {/* Center Route 53 Shield */}
    <g transform="translate(56, 18)">
      <path d="M 18 3 L 32 8 V 22 C 32 30 18 35 18 35 C 18 35 4 30 4 22 V 8 Z" fill="#ffffff" stroke="#545b64" strokeWidth="2"/>
      <text x="18" y="23" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#16191f">53</text>
    </g>

    {/* Right Cloud Outline */}
    <g transform="translate(108, 22)">
      <path d="M 10 24 A 9 9 0 0 1 18 10 A 14 14 0 0 1 42 14 A 9 9 0 0 1 46 24 Z" fill="#ffffff" stroke="#545b64" strokeWidth="2"/>
      <path d="M 12 24 L 44 24" stroke="#545b64" strokeWidth="2"/>
    </g>
  </svg>
);
