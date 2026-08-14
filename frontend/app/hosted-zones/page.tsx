"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, Search, RefreshCw, Download, Upload, ExternalLink, Globe, Lock, ChevronRight, ChevronLeft, CheckCircle2, X } from "lucide-react";
import { api } from "@/lib/api";
import { HostedZone, ZoneType } from "@/types";
import { Breadcrumbs } from "@/components/aws/Breadcrumbs";
import { Badge, Button } from "@/components/aws/ui";

// ── Create Zone Modal ──────────────────────────────────────────────────
function CreateZoneModal({ onClose, onCreated }: { onClose: () => void; onCreated: (zone: HostedZone) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [zoneType, setZoneType] = useState<ZoneType>("Public");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Domain name is required."); return; }
    setLoading(true);
    try {
      const zone = await api.createHostedZone({ name: name.trim(), description, zone_type: zoneType });
      onCreated(zone);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create hosted zone.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-200">
        {/* Modal Header */}
        <div className="bg-aws-nav text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="font-bold text-sm">Create hosted zone</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              ⚠ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Domain name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="example.com"
              className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
              autoFocus
            />
            <p className="text-[11px] text-gray-500 mt-1">Enter the domain name (e.g., example.com). A trailing dot will be appended automatically.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Type</label>
            <div className="space-y-2">
              {(["Public", "Private"] as ZoneType[]).map((type) => (
                <label key={type} className="flex items-start space-x-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    value={type}
                    checked={zoneType === type}
                    onChange={() => setZoneType(type)}
                    className="mt-0.5 accent-aws-blue"
                  />
                  <span>
                    <span className="text-xs font-medium text-gray-800 flex items-center gap-1.5">
                      {type === "Public" ? <Globe className="w-3.5 h-3.5 text-aws-blue" /> : <Lock className="w-3.5 h-3.5 text-gray-500" />}
                      {type} hosted zone
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      {type === "Public" ? "Routes traffic on the Internet." : "Routes traffic within an Amazon VPC."}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>Create hosted zone</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Zone Modal ────────────────────────────────────────────────────
function EditZoneModal({
  zone,
  onClose,
  onUpdated,
}: {
  zone: HostedZone;
  onClose: () => void;
  onUpdated: (zone: HostedZone) => void;
}) {
  const [description, setDescription] = useState(zone.description || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const updated = await api.updateHostedZone(zone.id, { description });
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update hosted zone.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-200">
        <div className="bg-aws-nav text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="font-bold text-sm">Edit hosted zone {zone.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              ⚠ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Domain Name</label>
            <input
              type="text"
              disabled
              value={zone.name}
              className="w-full border border-gray-200 rounded px-3 py-2 text-xs bg-gray-100 text-gray-500 font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Hosted Zone ID</label>
            <input
              type="text"
              disabled
              value={zone.id}
              className="w-full border border-gray-200 rounded px-3 py-2 text-xs bg-gray-100 text-gray-500 font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Zone Modal (AWS Console Style) ────────────────────────────────
function DeleteZoneModal({
  zones,
  onClose,
  onConfirm,
  loading,
}: {
  zones: HostedZone[];
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const [confirmInput, setConfirmInput] = useState("");
  const zoneName = zones.length === 1 ? zones[0].name : `${zones.length} hosted zones`;
  const isConfirmed = confirmInput.trim().toLowerCase() === "delete";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-base text-gray-900">
            Delete hosted zone {zoneName}?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs text-gray-700">
          <p>
            Delete the hosted zone permanently? This action cannot be undone. Your domain might become unavailable on the internet.
          </p>

          <div className="pt-2 border-t border-gray-100">
            <label className="block font-semibold text-gray-800 mb-1.5">
              To confirm that you want to delete the hosted zone, enter <span className="font-bold italic text-gray-900">delete</span> in the field.
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="delete"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue font-mono"
              autoFocus
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={!isConfirmed || loading}
            loading={loading}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Row for Zones Table ──────────────────────────────────────
function SkeletonZoneRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="px-4 py-3"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
      <td className="px-3 py-3"><div className="h-3 bg-gray-200 rounded w-36" /></td>
      <td className="px-3 py-3"><div className="h-5 bg-gray-200 rounded w-14" /></td>
      <td className="px-3 py-3"><div className="h-3 bg-gray-200 rounded w-8" /></td>
      <td className="px-3 py-3"><div className="h-3 bg-gray-200 rounded w-40" /></td>
      <td className="px-3 py-3"><div className="h-3 bg-gray-200 rounded w-24" /></td>
      <td className="px-3 py-3"><div className="h-3 bg-gray-200 rounded w-6 ml-auto" /></td>
    </tr>
  );
}

// ── Hosted Zones Table Page ────────────────────────────────────────────
function HostedZonesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [showEditZone, setShowEditZone] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [createdBannerZone, setCreatedBannerZone] = useState<string | null>(null);
  const [deletedBannerZone, setDeletedBannerZone] = useState<string | null>(searchParams.get("deleted"));

  const fetchZones = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getHostedZones({ search, zone_type: filterType || undefined, page, limit: 10 });
      setZones(data.hosted_zones);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err: any) {
      setError(err.message || "Failed to load hosted zones.");
    } finally {
      setLoading(false);
    }
  }, [search, filterType, page]);

  useEffect(() => { fetchZones(); }, [fetchZones]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === zones.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(zones.map((z) => z.id)));
    }
  };

  const handleDeleteClick = () => {
    if (selectedIds.size === 0) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map((id) => api.deleteHostedZone(id)));
      setSelectedIds(new Set());
      setShowDeleteModal(false);
      fetchZones();
    } catch (err: any) {
      setError(err.message || "Failed to delete zone(s).");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Breadcrumbs items={[{ label: "Hosted zones" }]} />

      {/* ── Green Success Banner ── */}
      {deletedBannerZone && (
        <div
          role="alert"
          className="flex items-start gap-3 bg-[#1d6535] text-white px-5 py-3 text-sm"
          style={{ animation: "slideDown 0.3s ease" }}
        >
          <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-300" />
          <div className="flex-1">
            <span className="font-semibold">Successfully deleted hosted zone: {deletedBannerZone}</span>
          </div>
          <button
            onClick={() => setDeletedBannerZone(null)}
            className="text-green-200 hover:text-white ml-2 mt-0.5 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {createdBannerZone && (
        <div
          role="alert"
          className="flex items-start gap-3 bg-[#1d6535] text-white px-5 py-3 text-sm"
          style={{ animation: "slideDown 0.3s ease" }}
        >
          <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-300" />
          <div className="flex-1">
            <span className="font-semibold">{createdBannerZone} was successfully created.</span>
            <span className="block text-green-100 text-xs mt-0.5">
              Now you can create records in the hosted zone to specify how you want Route 53 to route traffic for your domain.
            </span>
          </div>
          <button
            onClick={() => setCreatedBannerZone(null)}
            className="text-green-200 hover:text-white ml-2 mt-0.5 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f141c] transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Hosted zones <span className="text-gray-500 dark:text-gray-400 font-normal">({total})</span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Automatic mode is the current search behavior optimized for best filter results.
            </p>
          </div>

          {/* Action Buttons in Single Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchZones}
              disabled={loading}
              title="Refresh"
              className="p-1.5 text-aws-blue hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <Button
              variant="secondary"
              size="sm"
              disabled={selectedIds.size !== 1}
              onClick={() => {
                const id = Array.from(selectedIds)[0];
                if (id) router.push(`/hosted-zones/${id}`);
              }}
            >
              View details
            </Button>

            <Button
              variant="secondary"
              size="sm"
              disabled={selectedIds.size !== 1}
              onClick={() => setShowEditZone(true)}
            >
              Edit
            </Button>

            <Button
              variant={selectedIds.size > 0 ? "danger" : "secondary"}
              size="sm"
              disabled={selectedIds.size === 0}
              onClick={handleDeleteClick}
              loading={deleting}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
            </Button>

            <Button variant="primary" onClick={() => router.push("/hosted-zones/create")} size="sm">
              <Plus className="w-3.5 h-3.5" />
              Create hosted zone
            </Button>
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="px-6 py-2.5 bg-gray-50 dark:bg-[#0f141c]/40 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 flex-wrap transition-colors">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-48">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Filter records by property or value"
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f141c] text-gray-800 dark:text-gray-100 rounded focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue transition-colors"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">Search</Button>
        </form>

        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f141c] text-gray-700 dark:text-gray-250 rounded px-2.5 py-1.5 focus:outline-none focus:border-aws-blue transition-colors"
        >
          <option value="">All types</option>
          <option value="Public" className="bg-white dark:bg-[#0f141c]">Public</option>
          <option value="Private" className="bg-white dark:bg-[#0f141c]">Private</option>
        </select>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mt-3 text-xs text-red-700 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded px-3 py-2">
          ⚠ {error}
        </div>
      )}

      {/* Main Table + Details Side Panel */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0f141c] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 transition-colors">
                <th className="w-10 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={zones.length > 0 && selectedIds.size === zones.length}
                    onChange={toggleAll}
                    className="accent-aws-blue cursor-pointer"
                  />
                </th>
                <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300">Domain name</th>
                <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300">Type</th>
                <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300">Record count</th>
                <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300">Hosted zone ID</th>
                <th className="text-left px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300">Description</th>
                <th className="w-24 px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <>
                  <SkeletonZoneRow />
                  <SkeletonZoneRow />
                  <SkeletonZoneRow />
                  <SkeletonZoneRow />
                  <SkeletonZoneRow />
                </>
              )}
              {!loading && zones.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <Globe className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="font-semibold text-gray-500 text-sm">No hosted zones found</p>
                    <p className="text-xs mt-1">Create a hosted zone to start managing DNS records.</p>
                    <Button variant="primary" className="mt-4" onClick={() => setShowCreate(true)}>
                      <Plus className="w-3.5 h-3.5" />
                      Create hosted zone
                    </Button>
                  </td>
                </tr>
              )}
              {!loading && zones.map((zone) => (
                <tr
                  key={zone.id}
                  className={`border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer ${
                    selectedIds.has(zone.id) ? "bg-aws-rowActive dark:bg-[#202734]" : "hover:bg-aws-rowHover dark:hover:bg-[#202734]/50"
                  }`}
                  onClick={() => router.push(`/hosted-zones/${zone.id}`)}
                >
                  <td
                    className="px-4 py-2.5 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(zone.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(zone.id)}
                      onChange={(e) => e.stopPropagation()}
                      className="accent-aws-blue cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      className="text-aws-blue dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
                      onClick={(e) => { e.stopPropagation(); router.push(`/hosted-zones/${zone.id}`); }}
                    >
                      {zone.name}
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant={zone.zone_type === "Public" ? "blue" : "gray"}>
                      {zone.zone_type === "Public" ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                      {zone.zone_type}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300 font-mono">{zone.record_count}</td>
                  <td className="px-3 py-2.5 font-mono text-gray-500 dark:text-gray-400 text-[11px]">{zone.id}</td>
                  <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 max-w-xs truncate">{zone.description || "—"}</td>
                  <td className="px-3 py-2.5 text-right">
                    <a
                      href={api.exportBindUrl(zone.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Export BIND zone file"
                      className="text-gray-400 hover:text-aws-blue transition-colors inline-flex p-1 rounded hover:bg-blue-50 dark:hover:bg-gray-800"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hosted Zone Details Right Side Drawer */}
        {selectedIds.size === 1 && (() => {
          const selectedZone = zones.find((z) => selectedIds.has(z.id));
          if (!selectedZone) return null;
          return (
            <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f141c] p-5 overflow-auto text-xs space-y-5 flex-shrink-0 animate-fadeIn transition-colors">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Hosted zone details</h3>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                  title="Close details"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-500 dark:text-gray-400 font-medium block mb-0.5">Hosted zone name</label>
                  <span className="text-gray-900 dark:text-white font-semibold text-sm">{selectedZone.name}</span>
                </div>

                <div>
                  <label className="text-gray-500 dark:text-gray-400 font-medium block mb-0.5">Hosted zone ID</label>
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-[11px] bg-gray-50 dark:bg-[#0f141c] px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-800 block truncate">
                    {selectedZone.id}
                  </span>
                </div>

                <div>
                  <label className="text-gray-500 dark:text-gray-400 font-medium block mb-0.5">Description</label>
                  <span className="text-gray-700 dark:text-gray-300">{selectedZone.description || "—"}</span>
                </div>

                <div>
                  <label className="text-gray-500 dark:text-gray-400 font-medium block mb-0.5">Type</label>
                  <span className="text-gray-700 dark:text-gray-300">{selectedZone.zone_type} hosted zone</span>
                </div>

                <div>
                  <label className="text-gray-500 dark:text-gray-400 font-medium block mb-0.5">Record count</label>
                  <span className="text-gray-900 dark:text-white font-mono font-semibold">{selectedZone.record_count}</span>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <label className="text-gray-500 dark:text-gray-400 font-medium block mb-1.5">Name servers</label>
                  <ul className="space-y-1 font-mono text-[11px] text-gray-700 dark:text-gray-300 list-disc list-inside bg-gray-50 dark:bg-[#0f141c] p-2.5 rounded border border-gray-200 dark:border-gray-800">
                    <li>ns-1.awsdns-01.com.</li>
                    <li>ns-2.awsdns-01.net.</li>
                    <li>ns-3.awsdns-01.org.</li>
                    <li>ns-4.awsdns-01.co.uk.</li>
                  </ul>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Pagination Footer */}
      {pages > 1 && (
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-2.5 bg-white dark:bg-[#0f141c] flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 transition-colors">
          <span>Showing page {page} of {pages} ({total} total)</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateZoneModal
          onClose={() => setShowCreate(false)}
          onCreated={(zone) => {
            setZones((prev) => [zone, ...prev]);
            setTotal((t) => t + 1);
            setCreatedBannerZone(zone.name);
          }}
        />
      )}

      {showEditZone && selectedIds.size === 1 && (() => {
        const zoneToEdit = zones.find((z) => selectedIds.has(z.id));
        if (!zoneToEdit) return null;
        return (
          <EditZoneModal
            zone={zoneToEdit}
            onClose={() => setShowEditZone(false)}
            onUpdated={(updated) => {
              setZones((prev) => prev.map((z) => (z.id === updated.id ? updated : z)));
            }}
          />
        );
      })()}

      {showDeleteModal && (
        <DeleteZoneModal
          zones={zones.filter((z) => selectedIds.has(z.id))}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}
    </div>
  );
}

export default function HostedZonesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-32 text-gray-400 text-sm">Loading...</div>}>
      <HostedZonesInner />
    </Suspense>
  );
}
