"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info, Plus, Trash2, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { ZoneType } from "@/types";

interface Tag {
  key: string;
  value: string;
}

export default function CreateHostedZonePage() {
  const router = useRouter();
  const [domainName, setDomainName] = useState("");
  const [description, setDescription] = useState("");
  const [zoneType, setZoneType] = useState<ZoneType>("Public");
  const [vpcId, setVpcId] = useState("");
  const [vpcRegion, setVpcRegion] = useState("us-east-1");
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTag = () => {
    if (tags.length < 50) {
      setTags([...tags, { key: "", value: "" }]);
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleTagChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...tags];
    updated[index][field] = val;
    setTags(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!domainName.trim()) {
      setError("Domain name is required.");
      return;
    }

    setLoading(true);
    try {
      const vpcs = zoneType === "Private" && vpcId ? [`${vpcRegion}:${vpcId}`] : undefined;
      const zone = await api.createHostedZone({
        name: domainName.trim(),
        description: description.trim(),
        zone_type: zoneType,
        vpcs,
      });

      router.push(`/hosted-zones/${zone.id}?created=1`);
    } catch (err: any) {
      setError(err.message || "Failed to create hosted zone.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-white text-gray-900 font-sans p-6 max-w-6xl w-full mx-auto select-none pb-24">
      
      {/* Page Title + Info Link */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create hosted zone</h1>
          <a
            href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html"
            target="_blank"
            rel="noreferrer"
            className="text-[#0073bb] hover:underline text-xs font-medium flex items-center gap-1"
          >
            <span>Info</span>
          </a>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-xs rounded-r shadow-sm">
          <div className="font-bold">Error</div>
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ── Container Card 1: Hosted zone configuration ────────────────── */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Hosted zone configuration</h2>
          <p className="text-xs text-gray-600 mb-6">
            A hosted zone is a container that holds information about how you want to route traffic for a domain, such as example.com, and its subdomains.
          </p>

          <div className="space-y-6 max-w-4xl">
            
            {/* Field 1: Domain name */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <label className="text-xs font-bold text-gray-900">Domain name</label>
                <span className="text-[#0073bb] text-xs hover:underline cursor-pointer">Info</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                This is the name of the domain that you want to route traffic for.
              </p>
              <input
                type="text"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder="example.com"
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-[#0073bb] focus:border-[#0073bb] focus:outline-none placeholder-italic text-gray-800"
                autoFocus
              />
              <p className="text-[11px] text-gray-500 mt-1.5 font-mono">
                Valid characters: a-z, 0-9, ! &quot; # $ % &amp; &apos; ( ) * + , - . / : ; &lt; = &gt; ? @ [ \ ] ^ _ ` &#123; | &#125; ~.
              </p>
            </div>

            {/* Field 2: Description - optional */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <label className="text-xs font-bold text-gray-900">Description - optional</label>
                <span className="text-[#0073bb] text-xs hover:underline cursor-pointer">Info</span>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                This value lets you distinguish hosted zones that have the same name.
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 255))}
                placeholder="The hosted zone is used for..."
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-[#0073bb] focus:border-[#0073bb] focus:outline-none placeholder-italic text-gray-800 resize-y"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                The description can have up to 255 characters. {description.length}/255
              </p>
            </div>

            {/* Field 3: Type */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <label className="text-xs font-bold text-gray-900">Type</label>
                <span className="text-[#0073bb] text-xs hover:underline cursor-pointer">Info</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                The type indicates whether you want to route traffic on the internet or in an Amazon VPC.
              </p>

              {/* Radio Option Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Public Hosted Zone Option */}
                <div
                  onClick={() => setZoneType("Public")}
                  className={`p-4 rounded-lg cursor-pointer transition-all flex items-start gap-3 ${
                    zoneType === "Public"
                      ? "border-2 border-[#0073bb] bg-[#f2f8fd]"
                      : "border border-gray-300 hover:border-gray-400 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="zoneType"
                    checked={zoneType === "Public"}
                    onChange={() => setZoneType("Public")}
                    className="mt-0.5 accent-[#0073bb] cursor-pointer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Public hosted zone</h4>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      A public hosted zone determines how traffic is routed on the internet.
                    </p>
                  </div>
                </div>

                {/* Private Hosted Zone Option */}
                <div
                  onClick={() => setZoneType("Private")}
                  className={`p-4 rounded-lg cursor-pointer transition-all flex items-start gap-3 ${
                    zoneType === "Private"
                      ? "border-2 border-[#0073bb] bg-[#f2f8fd]"
                      : "border border-gray-300 hover:border-gray-400 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="zoneType"
                    checked={zoneType === "Private"}
                    onChange={() => setZoneType("Private")}
                    className="mt-0.5 accent-[#0073bb] cursor-pointer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Private hosted zone</h4>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      A private hosted zone determines how traffic is routed within an Amazon VPC.
                    </p>
                  </div>
                </div>

              </div>

              {/* VPC Section for Private Hosted Zone */}
              {zoneType === "Private" && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                  <h4 className="text-xs font-bold text-gray-900">VPC details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">VPC Region</label>
                      <select
                        value={vpcRegion}
                        onChange={(e) => setVpcRegion(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs bg-white focus:ring-1 focus:ring-[#0073bb] focus:outline-none"
                      >
                        <option value="us-east-1">us-east-1 (US East N. Virginia)</option>
                        <option value="us-west-2">us-west-2 (US West Oregon)</option>
                        <option value="eu-west-1">eu-west-1 (EU Ireland)</option>
                        <option value="ap-southeast-1">ap-southeast-1 (Asia Pacific Singapore)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">VPC ID</label>
                      <input
                        type="text"
                        value={vpcId}
                        onChange={(e) => setVpcId(e.target.value)}
                        placeholder="vpc-0a1b2c3d4e5f6g7h8"
                        className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#0073bb] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

        {/* ── Container Card 2: Tags ───────────────────────────────────────── */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <h2 className="text-lg font-bold text-gray-900">Tags</h2>
            <span className="text-[#0073bb] text-xs hover:underline cursor-pointer">Info</span>
          </div>
          <p className="text-xs text-gray-600 mb-4">
            Apply tags to hosted zones to help organize and identify them.
          </p>

          {tags.length === 0 ? (
            <p className="text-xs text-gray-500 mb-4">No tags associated with the resource.</p>
          ) : (
            <div className="space-y-3 max-w-2xl mb-4">
              <div className="grid grid-cols-12 gap-3 text-xs font-bold text-gray-700 px-1">
                <div className="col-span-5">Key</div>
                <div className="col-span-6">Value</div>
                <div className="col-span-1"></div>
              </div>
              {tags.map((tag, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Tag key"
                    value={tag.key}
                    onChange={(e) => handleTagChange(i, "key", e.target.value)}
                    className="col-span-5 border border-gray-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#0073bb] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Tag value"
                    value={tag.value}
                    onChange={(e) => handleTagChange(i, "value", e.target.value)}
                    className="col-span-6 border border-gray-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#0073bb] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(i)}
                    className="col-span-1 text-gray-400 hover:text-red-600 p-1 flex justify-center"
                    title="Remove tag"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddTag}
            className="border border-[#0073bb] text-[#0073bb] hover:bg-[#ecf5fc] bg-white px-4 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add tag</span>
          </button>
          <p className="text-[11px] text-gray-500 mt-2">You can add up to 50 more tags.</p>
        </div>

        {/* ── Bottom Action Bar ────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <Link
            href="/hosted-zones"
            className="text-xs font-semibold text-[#0073bb] hover:underline px-4 py-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#ff9900] hover:bg-[#e68a00] text-gray-900 font-bold text-xs px-6 py-2 rounded-full transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create hosted zone"}
          </button>
        </div>

      </form>

    </div>
  );
}
