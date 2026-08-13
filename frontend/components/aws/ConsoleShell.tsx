"use client";

import React, { useState } from "react";
import { Header } from "@/components/aws/Header";
import { Sidebar } from "@/components/aws/Sidebar";
import { Footer } from "@/components/aws/Footer";
import { Menu } from "lucide-react";

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-aws-text bg-[#f2f3f3]">
      {/* AWS Top Navigation Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sub-Header Bar with Blue Circle Hamburger Button */}
      <div className="bg-white border-b border-gray-300 h-10 flex items-center px-3 text-xs text-gray-700 space-x-2 select-none z-30 flex-shrink-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-7 h-7 rounded-full bg-[#0073bb] hover:bg-[#005999] text-white flex items-center justify-center transition-colors shadow-sm"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Main Workspace Area */}
      <div className="flex flex-1 min-h-0">
        {/* Collapsible Left Navigation Sidebar */}
        <Sidebar collapsed={!sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Page View Container with Smooth Transition */}
        <main className="flex-1 bg-white min-w-0 flex flex-col overflow-y-auto min-h-[calc(100vh-6.5rem)] transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>

      {/* AWS Console Sticky Footer */}
      <Footer />
    </div>
  );
}
