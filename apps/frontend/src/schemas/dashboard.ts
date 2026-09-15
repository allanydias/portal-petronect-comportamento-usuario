import { z } from "zod";

export const interestItemSchema = z.object({
  topic: z.string(),
  score: z.number(),
  percentage: z.number()
});

export const supplierProfileSchema = z.object({
  supplierId: z.string(),
  cnpjMasked: z.string(),
  role: z.string(),
  mainInterest: z.string(),
  interestScore: z.number(),
  interestRanking: z.array(interestItemSchema),
  frequency: z.string(),
  sessionsLast7Days: z.number(),
  sessionsLast30Days: z.number(),
  totalSessions: z.number(),
  totalEvents: z.number(),
  totalDurationMs: z.number(),
  sectionAccess: z.record(z.number()),
  timeBySectionMs: z.record(z.number()),
  mostAccessedTool: z.string().nullable(),
  mostAccessedTraining: z.string().nullable(),
  lastAccess: z.string().nullable(),
  lastPage: z.string().nullable(),
  lastSection: z.string().nullable(),
  lastContent: z.string().nullable(),
  lastAction: z.string().nullable(),
  searchedKeywords: z.array(z.string()),
  recommendedAction: z.string()
});

export type SupplierProfile = z.infer<typeof supplierProfileSchema>;
