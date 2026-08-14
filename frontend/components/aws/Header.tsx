"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Globe, ChevronDown, Bell, HelpCircle, Settings, Terminal, Grid, Menu, User, LogOut, LogIn, Check, Sun, Moon, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AwsLogoWithSmile } from "./Route53Icons";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

interface ServiceItem {
  name: string;
  desc: string;
  href: string;
}

const CATEGORIES = [
  "Recently visited",
  "Favourites",
  "All applications",
  "All services",
  "divider",
  "Analytics",
  "Application Integration",
  "Blockchain",
  "Business Applications",
  "Cloud Financial Management",
  "Compute",
  "Containers",
  "Customer Enablement",
  "Database",
  "Developer Tools",
  "End User Computing",
  "Front-end Web & Mobile",
  "Game Development",
  "Internet of Things",
  "Machine Learning",
  "Management & Governance",
  "Media Services",
  "Migration & Transfer",
  "Networking & Content Delivery",
  "Quantum Technologies",
  "Satellite",
  "Security, Identity, & Compliance",
  "Storage"
];

const SERVICES_BY_CATEGORY: Record<string, ServiceItem[]> = {
  "Recently visited": [
    { name: "Route 53", desc: "Scalable DNS and Domain Name Registration", href: "/hosted-zones" },
    { name: "Console Home", desc: "View resource insights, service shortcuts, and feature updates", href: "/dashboard" },
    { name: "CloudFormation", desc: "Create and Manage Resources with Templates", href: "/coming-soon?section=cloudformation" },
    { name: "DynamoDB", desc: "Managed NoSQL Database", href: "/coming-soon?section=dynamodb" },
    { name: "CloudWatch", desc: "Monitor Resources and Applications", href: "/coming-soon?section=cloudwatch" },
    { name: "Lambda", desc: "Run code without thinking about servers", href: "/coming-soon?section=lambda" },
    { name: "IAM", desc: "Manage access to AWS resources", href: "/coming-soon?section=iam" },
    { name: "AWS Health Dashboard", desc: "Personalized view of AWS service health", href: "/coming-soon?section=health-dashboard" },
    { name: "API Gateway", desc: "Build, Deploy and Manage APIs", href: "/coming-soon?section=api-gateway" },
    { name: "Simple Queue Service", desc: "SQS Managed Message Queues", href: "/coming-soon?section=sqs" },
    { name: "S3", desc: "Scalable Storage in the Cloud", href: "/coming-soon?section=s3" },
    { name: "Activate for Startups", desc: "AWS Activate provides resources to help startups build and grow on AWS", href: "/coming-soon?section=activate" },
    { name: "VPC", desc: "Isolated Cloud Resources", href: "/coming-soon?section=vpc" },
    { name: "AWS Resource Explorer", desc: "Easily search for and discover relevant resources across AWS", href: "/coming-soon?section=resource-explorer" },
    { name: "Billing and Cost Management", desc: "View and pay bills, analyze and govern your costs", href: "/coming-soon?section=billing" }
  ],
  "Networking & Content Delivery": [
    { name: "Route 53", desc: "Scalable DNS and Domain Name Registration", href: "/hosted-zones" },
    { name: "VPC", desc: "Isolated Cloud Resources", href: "/coming-soon?section=vpc" },
    { name: "CloudFront", desc: "Global Content Delivery Network", href: "/coming-soon?section=cloudfront" },
    { name: "API Gateway", desc: "Build, Deploy and Manage APIs", href: "/coming-soon?section=api-gateway" },
    { name: "Direct Connect", desc: "Dedicated Network Connection to AWS", href: "/coming-soon?section=direct-connect" }
  ],
  "Compute": [
    { name: "EC2", desc: "Virtual Servers in the Cloud", href: "/coming-soon?section=ec2" },
    { name: "Lambda", desc: "Run code without thinking about servers", href: "/coming-soon?section=lambda" },
    { name: "Lightsail", desc: "Easy-to-use Virtual Private Servers", href: "/coming-soon?section=lightsail" },
    { name: "Elastic Beanstalk", desc: "Run and Manage Web Apps", href: "/coming-soon?section=beanstalk" }
  ],
  "Database": [
    { name: "DynamoDB", desc: "Managed NoSQL Database", href: "/coming-soon?section=dynamodb" },
    { name: "RDS", desc: "Managed Relational Database Service", href: "/coming-soon?section=rds" },
    { name: "ElastiCache", desc: "In-Memory Database & Cache", href: "/coming-soon?section=elasticache" },
    { name: "Redshift", desc: "Fast, Simple, Cost-Effective Data Warehousing", href: "/coming-soon?section=redshift" }
  ],
  "Storage": [
    { name: "S3", desc: "Scalable Storage in the Cloud", href: "/coming-soon?section=s3" },
    { name: "EFS", desc: "Managed File Storage for EC2", href: "/coming-soon?section=efs" },
    { name: "Glacier", desc: "Archive Storage in the Cloud", href: "/coming-soon?section=glacier" },
    { name: "Storage Gateway", desc: "Hybrid Storage Integration", href: "/coming-soon?section=storage-gateway" }
  ]
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [searchValue, setSearchValue] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Recently visited");
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; account_id: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const u = await api.getMe();
        setUser(u);
      } catch (err) {
        // Not logged in or on landing page
      }
    }
    loadUser();
  }, []);
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

  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load auth and theme states from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem("aws_route53_auth");
    if (storedAuth !== null) {
      setIsLoggedIn(storedAuth === "true");
    }

    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSignOut = async () => {
    try {
      await api.logout();
    } catch {}
    router.push("/signin");
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
            <img src="/logo.png" className="h-6 w-auto object-contain" alt="AWS Console" />
          </Link>

          {/* Services Dropdown Trigger */}
          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors border ${
                servicesDropdownOpen
                  ? "bg-[#16191f] border-gray-600 text-white font-bold"
                  : "bg-[#0f1b2a] border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Services</span>
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

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="p-1 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title={theme === "light" ? "Switch to Dark theme" : "Switch to Light theme"}
          >
            {theme === "light" ? (
              <Moon className="w-3.5 h-3.5 text-gray-300" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-gray-300" />
            )}
          </button>

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
                  {user ? `${user.username} (${user.account_id})` : "likhit2804 (106731597972)"}
                </span>
                <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                  {user ? user.username : "likhit2804"}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Auth / Account Dropdown Modal */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded shadow-xl border border-gray-200 z-50 text-xs p-3">
                <div className="border-b pb-2 mb-2">
                  <p className="font-bold text-gray-900">AWS Account Details</p>
                  <p className="text-gray-500 font-mono text-[11px] mt-0.5">Account ID: {user ? user.account_id : "106731597972"}</p>
                  <p className="text-gray-500 text-[11px]">IAM User: {user ? user.username : "likhit2804"}</p>
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
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <LogOut className="w-3.5 h-3.5 text-red-600" />
                      Sign Out
                    </span>
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1 text-center">
                    Session state: {user ? "Authenticated" : "Not Authenticated"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Services Dropdown Panel */}
      {servicesDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-10 bg-black/40 z-40 transition-opacity"
            onClick={() => setServicesDropdownOpen(false)}
          />

          {/* Panel Container */}
          <div className="fixed top-10 left-0 bottom-0 w-full max-w-4xl bg-[#161d26] text-white flex z-50 shadow-2xl border-r border-gray-800 animate-fadeIn text-xs">
            {/* Left Categories Sidebar */}
            <div className="w-60 bg-[#1c2736] border-r border-gray-800 overflow-y-auto py-3">
              {CATEGORIES.map((cat, idx) => {
                if (cat === "divider") {
                  return <div key={`div-${idx}`} className="border-b border-gray-700/50 my-2 mx-4" />;
                }
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-5 py-2 transition-colors flex items-center justify-between font-medium ${
                      isSelected
                        ? "bg-[#161d26] text-blue-400 font-bold border-l-4 border-aws-blue"
                        : "text-gray-300 hover:text-white hover:bg-[#202e40]"
                    }`}
                  >
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Services View Area */}
            <div className="flex-1 bg-[#161d26] overflow-y-auto p-6 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
                <h2 className="text-sm font-bold text-white tracking-wide">{activeCategory}</h2>
                <button
                  onClick={() => setServicesDropdownOpen(false)}
                  className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Service List Grid */}
              {SERVICES_BY_CATEGORY[activeCategory] ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {SERVICES_BY_CATEGORY[activeCategory].map((svc) => (
                    <Link
                      key={svc.name}
                      href={svc.href}
                      onClick={() => setServicesDropdownOpen(false)}
                      className="p-3 rounded border border-transparent hover:border-gray-800 hover:bg-gray-800/30 group transition-all"
                    >
                      <span className="block text-white font-bold group-hover:text-blue-400 transition-colors">
                        {svc.name}
                      </span>
                      <span className="block text-[11px] text-gray-400 mt-0.5 leading-normal">
                        {svc.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                    <Grid className="w-5 h-5 text-gray-500" />
                  </div>
                  <span className="font-semibold text-gray-300 mb-1">"{activeCategory}" Services</span>
                  <p className="text-[11px] text-center max-w-xs leading-relaxed text-gray-500">
                    No mock services are defined in this category for this assignment console clone.
                  </p>
                  <p className="text-[11px] text-center mt-2">
                    Try selecting <span className="text-blue-400 font-semibold font-mono">Recently visited</span> or <span className="text-blue-400 font-semibold font-mono">Networking & Content Delivery</span>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
