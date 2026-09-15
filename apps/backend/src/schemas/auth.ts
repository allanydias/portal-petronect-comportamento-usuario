import { z } from "zod";
import { ROLES } from "../types/domain";
import { normalizeCnpj, isValidCnpj } from "../utils/cnpj";

export const loginSchema = z.object({
  cnpj: z.string()
    .transform(normalizeCnpj)
    .refine((value) => value.length === 14, "CNPJ deve ter 14 dígitos.")
    .refine(isValidCnpj, "CNPJ inválido."),
  role: z.enum(ROLES)
});

export type LoginInput = z.infer<typeof loginSchema>;
