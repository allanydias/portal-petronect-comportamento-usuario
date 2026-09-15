import { z } from "zod";

export const roles = [
  "Comprador",
  "Comercial",
  "Administrativo",
  "Financeiro",
  "Operador de licitação",
  "Gestor"
] as const;

export const loginFormSchema = z.object({
  cnpj: z
    .string()
    .min(1, "Informe o CNPJ.")
    .refine((value) => value.replace(/\D/g, "").length === 14, "O CNPJ deve ter 14 dígitos."),
  role: z.enum(roles)
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
