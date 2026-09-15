import type { Repository } from "../repositories/repository";
import type { UserRole } from "../types/domain";
import { maskCnpj } from "../utils/cnpj";
import { supplierIdFromCnpj, userIdFromSupplierRole } from "../utils/ids";

export async function identifySupplier(
  repository: Repository,
  cnpj: string,
  role: UserRole
) {
  const supplierId = supplierIdFromCnpj(cnpj);
  const userId = userIdFromSupplierRole(supplierId, role);

  const existing = await repository.getUser(userId);
  if (existing) return existing;

  return repository.saveUser({
    userId,
    supplierId,
    cnpjMasked: maskCnpj(cnpj),
    role,
    createdAt: new Date().toISOString()
  });
}
