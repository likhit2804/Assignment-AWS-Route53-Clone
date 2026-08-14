"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function SignInPage() {
  const router = useRouter();
  const [accountId, setAccountId] = useState("106731597972");
  const [username, setUsername] = useState("likhit2804");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(false);

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      await api.login(username.trim(), password);
      // Success, route to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f141c] text-gray-800 flex flex-col justify-between py-10 px-4 select-none font-sans">
      {/* Centered Sign-In Panel */}
      <div className="flex-1 flex flex-col justify-center items-center">
        {/* AWS Logo Header */}
        <div className="mb-6 flex flex-col items-center">
          <svg className="w-16 h-10 text-white fill-current" viewBox="0 0 100 62">
            <path d="M46.7 15.6c-.6 0-1.1.2-1.5.7l-9.1 11.2c-.4.5-.5 1.1-.3 1.7.2.6.7 1 1.3 1h6.2v10.6c0 1.2 1 2.2 2.2 2.2h6.7c1.2 0 2.2-1 2.2-2.2V30.2h6.2c.6 0 1.1-.4 1.3-1 .2-.6.1-1.2-.3-1.7l-9.1-11.2c-.4-.5-1-.7-1.5-.7z" fill="#ff9900"/>
            <text x="3" y="55" fill="#ffffff" fontSize="20" fontWeight="bold" fontFamily="sans-serif">aWS</text>
          </svg>
          <span className="text-white text-xs font-semibold tracking-wide uppercase mt-1">Route 53 Console</span>
        </div>

        {/* AWS Main Sign-In Card */}
        <div className="bg-white rounded-lg border border-gray-300 w-full max-w-sm p-8 shadow-2xl flex flex-col">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Sign in</h1>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-xs rounded p-3 flex items-start gap-2 animate-fadeIn">
              <span className="text-sm font-bold leading-none">⚠️</span>
              <div className="flex-1">
                <span className="font-bold block">Error</span>
                <span className="text-[11px] leading-relaxed block mt-0.5">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* User Type Radio Buttons */}
            <div className="space-y-2 mb-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="iam"
                  name="userType"
                  defaultChecked
                  className="w-3.5 h-3.5 text-[#0073bb] border-gray-300 focus:ring-[#0073bb]"
                />
                <label htmlFor="iam" className="text-xs font-bold text-gray-800 cursor-pointer">
                  IAM user
                </label>
              </div>
              <div className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                <input
                  type="radio"
                  id="root"
                  name="userType"
                  disabled
                  className="w-3.5 h-3.5 text-gray-400 border-gray-300"
                />
                <label htmlFor="root" className="text-xs font-bold text-gray-500">
                  Root user
                </label>
              </div>
            </div>

            {/* Account ID */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Account ID (12-digit) or account alias
              </label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="1234-5678-9012"
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue font-mono"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                IAM user name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue font-mono"
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">
                  Password
                </label>
                <span className="text-xs text-[#0073bb] hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff9900] hover:bg-[#e68a00] active:bg-[#c97900] text-gray-900 font-bold py-2 rounded text-xs transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          {/* Quick Help Hints */}
          <div className="mt-6 pt-4 border-t border-gray-150 text-[11px] text-gray-600 bg-gray-50 p-3 rounded">
            <span className="font-bold block text-gray-700 mb-1">💡 Demo Credentials</span>
            <div className="space-y-1 font-mono">
              <div>Username: <span className="font-bold text-gray-800">likhit2804</span></div>
              <div>Password: <span className="font-bold text-gray-800">password</span></div>
              <div className="border-t border-dashed my-1.5"></div>
              <div>Username: <span className="font-bold text-gray-800">admin</span></div>
              <div>Password: <span className="font-bold text-gray-800">admin123</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign-In Footer */}
      <div className="text-center text-[10px] text-gray-500 space-y-1">
        <div className="space-x-4">
          <span className="hover:underline cursor-pointer">Terms of Use</span>
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span>© 2026, Amazon Web Services, Inc. or its affiliates.</span>
        </div>
      </div>
    </div>
  );
}
