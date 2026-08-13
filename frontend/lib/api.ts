import { HostedZone, DNSRecord, UserSession, RecordType, RoutingPolicy, ZoneType } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    credentials: "include", // Propagate session cookies
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.detail) {
        errorMsg = typeof errData.detail === "string" ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // Hosted Zones API
  getHostedZones: async (params?: { search?: string; zone_type?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.zone_type) query.set("zone_type", params.zone_type);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    return fetcher<{ hosted_zones: HostedZone[]; total: number; page: number; pages: number }>(`/hosted-zones?${query.toString()}`);
  },

  getHostedZone: async (id: string) => {
    return fetcher<HostedZone>(`/hosted-zones/${id}`);
  },

  createHostedZone: async (data: { name: string; description?: string; zone_type: ZoneType; vpcs?: string[] }) => {
    return fetcher<HostedZone>("/hosted-zones", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateHostedZone: async (id: string, data: { description?: string }) => {
    return fetcher<HostedZone>(`/hosted-zones/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteHostedZone: async (id: string) => {
    return fetcher<void>(`/hosted-zones/${id}`, {
      method: "DELETE",
    });
  },

  // DNS Records API
  getRecords: async (zoneId: string, params?: { search?: string; record_type?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.record_type) query.set("record_type", params.record_type);
    if (params?.page) query.set("page", params.page.toString());
    return fetcher<{ records: DNSRecord[]; total: number }>(`/hosted-zones/${zoneId}/records?${query.toString()}`);
  },

  createRecord: async (zoneId: string, data: { name: string; type: RecordType; ttl: number; records: string[]; routing_policy: RoutingPolicy }) => {
    return fetcher<DNSRecord>(`/hosted-zones/${zoneId}/records`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateRecord: async (zoneId: string, recordId: string, data: { ttl?: number; records?: string[]; routing_policy?: RoutingPolicy }) => {
    return fetcher<DNSRecord>(`/hosted-zones/${zoneId}/records/${recordId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteRecord: async (zoneId: string, recordId: string) => {
    return fetcher<void>(`/hosted-zones/${zoneId}/records/${recordId}`, {
      method: "DELETE",
    });
  },

  // BIND Import/Export API
  importBindZone: async (zoneId: string, zoneText: string) => {
    return fetcher<{ message: string; imported_count: number; records: DNSRecord[] }>(`/hosted-zones/${zoneId}/import-bind`, {
      method: "POST",
      body: JSON.stringify({ zone_text: zoneText }),
    });
  },

  exportBindUrl: (zoneId: string) => `${API_BASE_URL}/hosted-zones/${zoneId}/export-bind`,
  exportJsonUrl: (zoneId: string) => `${API_BASE_URL}/hosted-zones/${zoneId}/export-json`,

  // Auth API
  getMe: async () => fetcher<UserSession>("/auth/me"),
  login: async (username: string, password: string) =>
    fetcher<{ message: string; user: UserSession }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: async () => fetcher<{ message: string }>("/auth/logout", { method: "POST" }),
};
