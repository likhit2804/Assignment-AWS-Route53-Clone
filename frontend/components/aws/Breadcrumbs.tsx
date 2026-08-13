"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 py-2 px-6 bg-white dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-800 select-none transition-colors">
      <Link href="/hosted-zones" className="hover:text-aws-blue transition-colors">
        Route 53
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          {item.href ? (
            <Link href={item.href} className="hover:text-aws-blue transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
