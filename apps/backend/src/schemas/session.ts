import { z } from "zod";

export const sessionStartSchema = z.object({
  userId: z.string().min(3),
  supplierId: z.string().min(3)
});

export const sessionEndSchema = z.object({
  sessionId: z.string().min(3)
});
