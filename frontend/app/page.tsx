"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Server, Activity, Network, Shield, ExternalLink, ArrowRight, CheckCircle2, Play, Globe, Laptop, HeartPulse, GitMerge, Database, ShieldCheck, Zap, Layers, RefreshCw } from "lucide-react";

export default function Route53LandingPage() {
  const router = useRouter();

  return (
    <div className="flex-1 bg-white text-gray-900 font-sans pb-16 select-none">
      
      {/* ── 1. Hero Dark Banner (Exact match to AWS Overview Page) ──────────────── */}
      <div className="bg-[#16191f] text-white p-6 md:p-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-8">
          
          {/* Left Hero Text Column */}
          <div className="max-w-2xl space-y-3">
            <p className="text-gray-400 text-xs font-medium tracking-wide">Network & Content Delivery</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Amazon Route 53
            </h1>
            <p className="text-xl md:text-2xl font-normal text-gray-200">
              A reliable way to route users to internet applications
            </p>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed pt-1">
              Amazon Route 53 is a highly available and scalable cloud Domain Name System (DNS) web service.
            </p>
          </div>

          {/* Right Hero Cards Column */}
          <div className="w-full lg:w-80 space-y-4 flex-shrink-0">
            
            {/* Card 1: Get Started */}
            <div className="bg-white text-gray-900 rounded-xl p-5 shadow-lg border border-gray-200">
              <h2 className="text-base font-bold text-gray-900 mb-2">Get started with Route 53</h2>
              <p className="text-xs text-gray-600 mb-5 leading-normal">
                Get started by registering a domain, configuring DNS, or using another Route 53 feature.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-[#ff9900] hover:bg-[#e68a00] text-gray-900 font-bold px-5 py-2 rounded-full text-xs transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Go to Dashboard
              </button>
            </div>

            {/* Card 2: Pricing */}
            <div className="bg-white text-gray-900 rounded-xl p-4 shadow-lg border border-gray-200">
              <h2 className="text-base font-bold text-gray-900 mb-1">Pricing (US)</h2>
              <a
                href="https://aws.amazon.com/route53/pricing/"
                target="_blank"
                rel="noreferrer"
                className="text-[#0073bb] hover:underline text-xs font-medium inline-flex items-center gap-1"
              >
                <span>View pricing</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* ── 2. How It Works Section ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How it works</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Video / Diagram Card (Left 2 cols) */}
          <div className="lg:col-span-2 border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
            <div className="relative aspect-video bg-[#16191f] rounded-xl overflow-hidden flex flex-col items-center justify-center border border-gray-800 group cursor-pointer shadow-inner">
              {/* Background Diagram Visual */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0f1b2a] via-[#1a2332] to-[#16191f] opacity-90 flex items-center justify-center p-8">
                <div className="relative w-full max-w-sm flex items-center justify-between">
                  <div className="p-3 bg-gray-800 rounded-xl border border-gray-700 text-blue-400">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div className="h-0.5 border-b border-dashed border-gray-500 flex-1 mx-2"></div>
                  <div className="p-4 bg-amber-500/20 rounded-2xl border-2 border-amber-500 text-amber-500 shadow-lg flex flex-col items-center">
                    <Shield className="w-8 h-8" />
                    <span className="text-[10px] font-bold mt-1 text-white">53</span>
                  </div>
                  <div className="h-0.5 border-b border-dashed border-gray-500 flex-1 mx-2"></div>
                  <div className="p-3 bg-gray-800 rounded-xl border border-gray-700 text-green-400">
                    <Globe className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* YouTube Play Overlay Button */}
              <div className="relative z-10 flex flex-col items-center space-y-3">
                <div className="w-16 h-12 bg-red-600 group-hover:bg-red-700 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all group-hover:scale-105">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
                <div className="bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full text-white text-xs font-medium flex items-center gap-2">
                  <span>Watch overview on YouTube</span>
                  <ExternalLink className="w-3 h-3 text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          {/* More Resources Card (Right 1 col) */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
            <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-1.5">
              <span>More resources</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            </h3>
            <ul className="space-y-3 text-xs">
              <li>
                <a href="https://docs.aws.amazon.com/route53/" target="_blank" rel="noreferrer" className="text-[#0073bb] hover:underline font-medium block">
                  Documentation
                </a>
              </li>
              <li className="border-t border-gray-100 pt-2.5">
                <a href="https://docs.aws.amazon.com/Route53/latest/APIReference/Welcome.html" target="_blank" rel="noreferrer" className="text-[#0073bb] hover:underline font-medium block">
                  API reference
                </a>
              </li>
              <li className="border-t border-gray-100 pt-2.5">
                <a href="https://aws.amazon.com/route53/faqs/" target="_blank" rel="noreferrer" className="text-[#0073bb] hover:underline font-medium block">
                  FAQs
                </a>
              </li>
              <li className="border-t border-gray-100 pt-2.5">
                <a href="https://repost.aws/tags/TA4_i_g3S9SLm27z0M7L91wA/amazon-route-53" target="_blank" rel="noreferrer" className="text-[#0073bb] hover:underline font-medium block">
                  Forum - DNS and health checks
                </a>
              </li>
              <li className="border-t border-gray-100 pt-2.5">
                <a href="https://repost.aws/tags/TA4_i_g3S9SLm27z0M7L91wA/amazon-route-53" target="_blank" rel="noreferrer" className="text-[#0073bb] hover:underline font-medium block">
                  Forum - Domain name registration
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── 3. Products Section ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Products</h2>

        <div className="border border-gray-200 rounded-2xl bg-white p-6 shadow-sm divide-y divide-gray-100">
          
          {/* Product 1: Domain names */}
          <div className="py-5 first:pt-0 flex items-start gap-6">
            <div className="w-32 h-20 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 text-[#0073bb]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-xs">53</div>
                <Laptop className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">Domain names</h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                A domain is the name, such as example.com, that your users use to access your application.
              </p>
            </div>
          </div>

          {/* Product 2: Hosted zones */}
          <div className="py-5 flex items-start gap-6">
            <div className="w-32 h-20 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 text-[#0073bb]">
              <div className="flex items-center space-x-1">
                <Shield className="w-5 h-5 text-gray-400" />
                <Shield className="w-7 h-7 text-[#0073bb] font-bold" />
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">Hosted zones</h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                Specify how you want Route 53 to respond to DNS queries for a domain such as example.com.
              </p>
              <Link href="/hosted-zones" className="text-xs font-semibold text-[#0073bb] hover:underline mt-2 inline-flex items-center gap-1">
                <span>Manage hosted zones</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Product 3: Health checks */}
          <div className="py-5 flex items-start gap-6">
            <div className="w-32 h-20 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-500">
              <HeartPulse className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">Health checks</h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                Monitor your applications and web resources, and direct DNS queries to healthy resources.
              </p>
            </div>
          </div>

          {/* Product 4: Traffic flow */}
          <div className="py-5 flex items-start gap-6">
            <div className="w-32 h-20 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 text-green-600">
              <GitMerge className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">Traffic flow</h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                Use a visual tool to create policies for multiple endpoints in complex configurations.
              </p>
            </div>
          </div>

          {/* Product 5: Resolver */}
          <div className="py-5 last:pb-0 flex items-start gap-6">
            <div className="w-32 h-20 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 text-purple-600">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">Resolver</h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                Route DNS queries between your VPCs and your network.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── 4. Benefits and Features Section ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits and features</h2>

        <div className="border border-gray-200 rounded-2xl bg-white p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-1.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0073bb]" />
              <span>Highly available and reliable</span>
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Amazon Route 53 is built using AWS's highly available and reliable infrastructure. Our distributed DNS servers ensure that you can consistently route your end users to your application.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-1.5 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0073bb]" />
              <span>Designed for use with other AWS services</span>
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              You can use Amazon Route 53 to map domain names to your Amazon EC2 instances, Amazon S3 buckets, Amazon CloudFront distributions, and other AWS resources.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-1.5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#0073bb]" />
              <span>Simple</span>
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              You can quickly sign up, and Amazon Route 53 can start to answer your DNS queries within minutes.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-1.5 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#0073bb]" />
              <span>Flexible</span>
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Amazon Route 53 routes traffic based on multiple criteria, such as endpoint health, geographic location, and latency.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
