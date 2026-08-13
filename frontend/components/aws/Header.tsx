"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Globe, ChevronDown, Bell, HelpCircle, Settings, Terminal, Grid, Menu, User, LogOut, LogIn, Check } from "lucide-react";
import Link from "next/link";
import { AwsLogoWithSmile } from "./Route53Icons";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [searchValue, setSearchValue] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Alt+S, Shift+Alt+S, Ctrl+K, or '/' to focus search bar
  useEffect(() => {
    const doFocus = () => {
      const el = searchInputRef.current || (document.getElementById("global-aws-search-input") as HTMLInputElement | null);
      if (el) {
        el.focus();
        try {
          el.select();
        } catch {}
      }
    };

    const focusSearch = () => {
      doFocus();
      setTimeout(doFocus, 10);
      setTimeout(doFocus, 50);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toUpperCase();
      const isInput = activeTag === "INPUT" || activeTag === "TEXTAREA" || (document.activeElement as HTMLElement)?.isContentEditable;

      // Match Ctrl+K / Cmd+K
      const isCtrlK = (e.ctrlKey || e.metaKey) && (e.key?.toLowerCase() === "k" || e.code === "KeyK" || e.keyCode === 75);

      // Match Alt+S / Alt+Shift+S / Option+S
      const isAltS = (e.altKey || e.metaKey) && (e.key?.toLowerCase() === "s" || e.code === "KeyS" || e.keyCode === 83);

      // Match slash '/' when not in input
      const isSlash = (e.key === "/" || e.code === "Slash" || e.keyCode === 191) && !isInput;

      if (isCtrlK || isAltS || isSlash) {
        e.preventDefault();
        e.stopPropagation();
        focusSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  // Load auth state from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem("aws_route53_auth");
    if (storedAuth !== null) {
      setIsLoggedIn(storedAuth === "true");
    }
  }, []);

  const toggleAuth = () => {
    const nextState = !isLoggedIn;
    setIsLoggedIn(nextState);
    localStorage.setItem("aws_route53_auth", String(nextState));
  };

  return (
    <>
      <header className="bg-[#0f1b2a] text-white h-10 flex items-center justify-between px-3 text-xs select-none border-b border-gray-800 sticky top-0 z-50">
        {/* Left Section: AWS Brand Logo, Hex Switcher, Grid, Mobile Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-gray-300 hover:text-white p-1 rounded hover:bg-gray-800"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* AWS Smile Logo */}
          <Link href="/" className="flex items-center space-x-1.5 group pr-1 hover:opacity-90 transition-opacity">
            <AwsLogoWithSmile className="h-6 w-auto" />
          </Link>

          {/* Hexagon App Switcher & Grid Menu */}
          <div className="hidden sm:flex items-center space-x-2 text-gray-400">
            <button className="p-1 hover:text-white hover:bg-gray-800 rounded" title="AWS Services">
              <div className="w-4 h-4 rounded bg-purple-600 flex items-center justify-center text-[9px] font-bold text-white">
                ⬡
              </div>
            </button>
            <button className="p-1 hover:text-white hover:bg-gray-800 rounded" title="Service Menu">
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Section: Global AWS Search Bar [Alt+S] */}
        <div className="flex items-center flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400" />
            <input
              id="global-aws-search-input"
              ref={searchInputRef}
              type="text"
              accessKey="s"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search [Alt+S]"
              className="w-full bg-[#16191f] text-gray-200 pl-8 pr-12 py-1 rounded border border-gray-700 text-xs focus:outline-none focus:border-aws-orange focus:bg-[#000] placeholder-gray-400 transition-all"
            />
            <span
              onClick={() => searchInputRef.current?.focus()}
              className="absolute right-2.5 top-1.5 text-[10px] text-gray-400 font-mono bg-gray-800 px-1 py-0.2 rounded cursor-pointer hover:text-white transition-colors"
              title="Click or press Alt+S, Shift+Alt+S, Ctrl+K, or / to search"
            >
              [Alt+S] / [Ctrl+K]
            </span>
          </div>
        </div>

        {/* Right Section: CloudShell, Notifications, Help, Settings, Region & Account */}
        <div className="flex items-center space-x-2 text-gray-300">
          {/* CloudShell Launcher */}
          <button className="hidden lg:flex items-center space-x-1 p-1 hover:text-white hover:bg-gray-800 rounded transition-colors text-xs font-mono" title="AWS CloudShell">
            <Terminal className="w-3.5 h-3.5 text-gray-300" />
          </button>

          {/* Notifications Bell with Counter */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-1 hover:text-white hover:bg-gray-800 rounded transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5 text-gray-300" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                1
              </span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-gray-800 rounded shadow-lg border border-gray-200 z-50 text-xs p-3">
                <div className="font-semibold border-b pb-1 mb-2 flex justify-between items-center text-gray-900">
                  <span>AWS Notifications</span>
                  <span className="text-[10px] text-aws-blue cursor-pointer">View all</span>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-900 text-[11px]">
                  <p className="font-semibold">Route 53 Global Status</p>
                  <p className="mt-0.5 text-gray-600">All DNS Hosted Zones operating normally across regions.</p>
                </div>
              </div>
            )}
          </div>

          {/* Help & Settings */}
          <button className="p-1 hover:text-white hover:bg-gray-800 rounded transition-colors" title="Documentation & Support">
            <HelpCircle className="w-3.5 h-3.5 text-gray-300" />
          </button>
          <button className="p-1 hover:text-white hover:bg-gray-800 rounded transition-colors" title="Console Settings">
            <Settings className="w-3.5 h-3.5 text-gray-300" />
          </button>

          <span className="text-gray-600">|</span>

          {/* Global Region Selector */}
          <div className="flex items-center space-x-1 hover:text-white cursor-pointer px-1.5 py-0.5 rounded hover:bg-gray-800 transition-colors">
            <span className="font-medium text-xs">Global</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>

          <span className="text-gray-600">|</span>

          {/* User Account Dropdown (likhit2804) */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-1.5 hover:text-white cursor-pointer px-1.5 py-0.5 rounded hover:bg-gray-800 transition-colors text-left"
            >
              <div className="flex flex-col items-end leading-none">
                <span className="font-semibold text-xs text-gray-100 flex items-center gap-1">
                  likhit2804 (106731597972)
                </span>
                <span className="text-[10px] text-gray-400 font-mono mt-0.5">likhit2804</span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Auth / Account Dropdown Modal */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded shadow-xl border border-gray-200 z-50 text-xs p-3">
                <div className="border-b pb-2 mb-2">
                  <p className="font-bold text-gray-900">AWS Account Details</p>
                  <p className="text-gray-500 font-mono text-[11px] mt-0.5">Account ID: 106731597972</p>
                  <p className="text-gray-500 text-[11px]">IAM User: likhit2804</p>
                </div>

                <div className="space-y-1 py-1">
                  <div className="flex items-center justify-between text-gray-700 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">
                    <span>Account Settings</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">
                    <span>Billing Dashboard</span>
                  </div>
                </div>

                <div className="border-t pt-2 mt-2">
                  <button
                    onClick={toggleAuth}
                    className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      {isLoggedIn ? <LogOut className="w-3.5 h-3.5 text-red-600" /> : <LogIn className="w-3.5 h-3.5 text-green-600" />}
                      {isLoggedIn ? "Sign Out (Mock Auth)" : "Sign In (Mock Auth)"}
                    </span>
                    {isLoggedIn && <Check className="w-3.5 h-3.5 text-green-600" />}
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1 text-center">
                    Session state: {isLoggedIn ? "Authenticated" : "Logged Out"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
