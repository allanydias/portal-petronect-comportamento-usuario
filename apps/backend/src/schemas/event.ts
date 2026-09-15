import { z } from "zod";
import { EVENT_NAMES } from "../types/domain";

export const eventInputSchema = z.object({
  eventId: z.string().min(3).optional(),
  sessionId: z.string().min(3),
  userId: z.string().min(3),
  supplierId: z.string().min(3),
  eventName: z.enum(EVENT_NAMES),
  page: z.string().max(120).nullable().optional(),
  section: z.string().max(120).nullable().optional(),
  itemId: z.string().max(200).nullable().optional(),
  keyword: z.string().max(200).nullable().optional(),
  timestamp: z.iso.datetime().optional(),
  durationMs: z.number().int().min(0).max(60 * 60 * 1000).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({})
});

export const eventListQuerySchema = z.object({
  supplierId: z.string().min(3).optional(),
  sessionId: z.string().min(3).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100)
});

export type EventInput = z.infer<typeof eventInputSchema>;
