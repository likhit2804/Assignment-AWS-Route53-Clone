"use client";

import React from "react";
import { Info, AlertTriangle } from "lucide-react";

interface MockNoticeBannerProps {
  title?: string;
  description?: string;
  className?: string;
}

export const MockNoticeBanner: React.FC<MockNoticeBannerProps> = ({
  title = "Mocked Feature / Placeholder Section",
  description = "This section is a non-functional mock UI designed for AWS Route 53 assignment compliance. Core Hosted Zones and DNS Record CRUD features are fully active with persistent SQLite WAL storage.",
  className = "",
}) => {
  return (
    <div className={`bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r shadow-sm text-xs select-none ${className}`}>
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-900 leading-tight text-xs">{title}</h4>
          <p className="text-amber-800 mt-0.5 leading-relaxed text-[11px]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
