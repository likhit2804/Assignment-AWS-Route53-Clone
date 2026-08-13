"use client";

import React from "react";
import { Terminal, MessageSquare, Smartphone, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0f1b2a] text-gray-300 h-8 flex items-center justify-between px-3 text-[11px] select-none border-t border-gray-800 sticky bottom-0 z-40">
      {/* Left Footer Shortcuts */}
      <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-1 hover:text-white transition-colors" title="Launch AWS CloudShell">
          <Terminal className="w-3.5 h-3.5 text-gray-400" />
          <span>CloudShell</span>
        </button>

        <span className="text-gray-700">|</span>

        <button className="flex items-center space-x-1 hover:text-white transition-colors">
          <Terminal className="w-3.5 h-3.5 text-gray-400" />
          <span>Agent Toolkit for AWS</span>
        </button>

        <span className="text-gray-700">|</span>

        <button className="flex items-center space-x-1 hover:text-white transition-colors">
          <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
          <span>Feedback</span>
        </button>

        <span className="text-gray-700">|</span>

        <button className="flex items-center space-x-1 hover:text-white transition-colors">
          <Smartphone className="w-3.5 h-3.5 text-gray-400" />
          <span>Console mobile app</span>
        </button>
      </div>

      {/* Right Legal & Copyright Notice */}
      <div className="flex items-center space-x-3 text-gray-400">
        <span>© 2026, Amazon Web Services, Inc. or its affiliates.</span>
        <a href="#" className="hover:text-white transition-colors">Privacy</a>
        <a href="#" className="hover:text-white transition-colors">Terms</a>
        <a href="#" className="hover:text-white transition-colors">Cookie preferences</a>
      </div>
    </footer>
  );
};
