import { z } from "zod";
import { supplierProfileSchema } from "@/schemas/dashboard";

export const loginResponseSchema = z.object({
  userId: z.string(),
  supplierId: z.string(),
  cnpjMasked: z.string(),
  role: z.string()
});

export const sessionSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  supplierId: z.string(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  durationMs: z.number().optional()
});

const behaviorEventSchema = z.object({
  eventId: z.string(),
  sessionId: z.string(),
  userId: z.string(),
  supplierId: z.string(),
  eventName: z.string(),
  page: z.string().nullable().optional(),
  section: z.string().nullable().optional(),
  itemId: z.string().nullable().optional(),
  keyword: z.string().nullable().optional(),
  timestamp: z.string(),
  durationMs: z.number().nullable().optional(),
  metadata: z.record(z.unknown())
});

export const eventResponseSchema = z.object({
  accepted: z.boolean(),
  duplicate: z.boolean().optional(),
  reason: z.string().optional(),
  event: behaviorEventSchema.optional(),
  profile: supplierProfileSchema.nullable().optional()
});

export const dashboardResponseSchema = z.object({
  metrics: z.object({
    suppliersMonitored: z.number(),
    activeUsers: z.number(),
    sessions: z.number(),
    eventsCaptured: z.number(),
    avgSessionDurationMs: z.number(),
    reengagementOpportunities: z.number()
  }),
  suppliers: z.array(supplierProfileSchema)
});

export const supplierDetailResponseSchema = z.object({
  profile: supplierProfileSchema,
  recentJourney: z.array(behaviorEventSchema)
});
