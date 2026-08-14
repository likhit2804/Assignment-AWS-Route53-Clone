"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/aws/Header";
import { Sidebar } from "@/components/aws/Sidebar";
import { Footer } from "@/components/aws/Footer";
import { Menu } from "lucide-react";
import { api } from "@/lib/api";

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      // Don't guard sign-in and landing routes
      if (pathname === "/signin" || pathname === "/") {
        setCheckingAuth(false);
        return;
      }
      try {
        await api.getMe();
        setCheckingAuth(false);
      } catch (err) {
        // Redirection to sign-in page if not authenticated
        router.push("/signin");
      }
    }
    checkAuth();
  }, [pathname, router]);

  const isSignInPage = pathname === "/signin";

  if (isSignInPage) {
    return <>{children}</>;
  }

  if (checkingAuth && pathname !== "/") {
    return (
      <div className="min-h-screen bg-[#0f141c] flex flex-col items-center justify-center text-xs text-gray-400 font-sans">
        <div className="w-8 h-8 border-2 border-t-aws-blue border-gray-700 rounded-full animate-spin mb-4"></div>
        <span>Verifying AWS identity session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-aws-text dark:text-gray-200 bg-[#f2f3f3] dark:bg-[#0f141c] transition-colors">
      {/* AWS Top Navigation Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sub-Header Bar with Blue Circle Hamburger Button */}
      <div className="bg-white dark:bg-[#0f141c] border-b border-gray-300 dark:border-gray-800 h-10 flex items-center px-3 text-xs text-gray-700 dark:text-gray-300 space-x-2 select-none z-30 flex-shrink-0 transition-colors">
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
        <main className="flex-1 bg-white dark:bg-[#0f141c] min-w-0 flex flex-col overflow-hidden h-[calc(100vh-5rem)] transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>

      {/* AWS Console Sticky Footer */}
      <Footer />
    </div>
  );
}
