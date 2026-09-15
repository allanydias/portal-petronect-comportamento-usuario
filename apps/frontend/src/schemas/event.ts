import { z } from "zod";

export const eventNameSchema = z.enum([
  "page_view",
  "section_view",
  "first_click",
  "content_click",
  "guide_open",
  "video_start",
  "video_complete",
  "live_signup_click",
  "auction_simulator_click",
  "tool_open",
  "calculator_use",
  "ncm_query",
  "certificate_click",
  "search_keyword",
  "session_start",
  "session_end",
  "heartbeat"
]);

export const trackEventSchema = z.object({
  sessionId: z.string().min(3),
  userId: z.string().min(3),
  supplierId: z.string().min(3),
  eventName: eventNameSchema,
  page: z.string().nullable().optional(),
  section: z.string().nullable().optional(),
  itemId: z.string().nullable().optional(),
  keyword: z.string().nullable().optional(),
  timestamp: z.string().datetime().optional(),
  durationMs: z.number().int().nonnegative().nullable().optional(),
  metadata: z.record(z.unknown()).default({})
});

export type EventName = z.infer<typeof eventNameSchema>;
export type TrackEventInput = z.infer<typeof trackEventSchema>;
