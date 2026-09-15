import { createHmac, randomUUID } from "crypto";

function salt(): string {
  return process.env.SUPPLIER_HASH_SALT || "petronect-demo-local-salt";
}

export function supplierIdFromCnpj(cnpj: string): string {
  const hash = createHmac("sha256", salt()).update(cnpj).digest("hex").slice(0, 20);
  return `sup_${hash}`;
}

export function userIdFromSupplierRole(supplierId: string, role: string): string {
  const hash = createHmac("sha256", salt())
    .update(`${supplierId}:${role}`)
    .digest("hex")
    .slice(0, 20);
  return `usr_${hash}`;
}

export function newSessionId(): string {
  return `sess_${randomUUID()}`;
}

export function newEventId(): string {
  return `evt_${randomUUID()}`;
}
