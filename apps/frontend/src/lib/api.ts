import { z } from "zod";
import {
  dashboardResponseSchema,
  loginResponseSchema,
  sessionSchema,
  supplierDetailResponseSchema,
  eventResponseSchema
} from "@/schemas/api";
import type { TrackEventInput } from "@/schemas/event";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      typeof payload?.message === "string" ? payload.message : "Falha ao comunicar com a API.",
      payload
    );
  }

  return schema.parse(payload);
}

export const api = {
  health: () =>
    request(
      "/health",
      z.object({
        ok: z.boolean(),
        service: z.string(),
        dataMode: z.string().optional(),
        timestamp: z.string()
      })
    ),

  login: (input: { cnpj: string; role: string }) =>
    request("/auth/login", loginResponseSchema, {
      method: "POST",
      body: JSON.stringify(input)
    }),

  startSession: (input: { userId: string; supplierId: string }) =>
    request("/session/start", sessionSchema, {
      method: "POST",
      body: JSON.stringify(input)
    }),

  endSession: (sessionId: string) =>
    request("/session/end", sessionSchema, {
      method: "POST",
      body: JSON.stringify({ sessionId })
    }),

  trackEvent: (input: TrackEventInput) =>
    request("/events", eventResponseSchema, {
      method: "POST",
      body: JSON.stringify(input)
    }),

  getDashboard: () =>
    request("/analytics/dashboard", dashboardResponseSchema),

  getSupplier: (supplierId: string) =>
    request(
      `/analytics/suppliers/${encodeURIComponent(supplierId)}`,
      supplierDetailResponseSchema
    ),

  getRecommendation: (supplierId: string) =>
    request(
      `/recommendations/${encodeURIComponent(supplierId)}`,
      z.object({
        supplierId: z.string(),
        mainInterest: z.string(),
        frequency: z.string(),
        recommendation: z.string()
      })
    )
};

export { API_URL };
