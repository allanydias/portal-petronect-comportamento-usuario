import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getRepository } from "../repositories";
import {
  buildSupplierProfile,
  dashboard as buildDashboard,
  listSupplierProfiles
} from "../services/analyticsService";
import { errorResponse, json } from "../utils/http";

export const dashboard: APIGatewayProxyHandlerV2 = async () => {
  try {
    const repository = getRepository();
    await repository.initialize();
    return json(200, await buildDashboard(repository));
  } catch (error) {
    return errorResponse(error);
  }
};

export const suppliers: APIGatewayProxyHandlerV2 = async () => {
  try {
    const repository = getRepository();
    await repository.initialize();
    return json(200, { suppliers: await listSupplierProfiles(repository) });
  } catch (error) {
    return errorResponse(error);
  }
};

export const supplierDetail: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const supplierId = event.pathParameters?.supplierId;
    if (!supplierId) {
      return json(400, { error: "missing_supplier_id", message: "supplierId obrigatório." });
    }

    const repository = getRepository();
    await repository.initialize();

    const profile = await buildSupplierProfile(repository, supplierId);
    if (!profile) {
      return json(404, { error: "supplier_not_found", message: "Fornecedor não encontrado." });
    }

    const recentJourney = (await repository.listEventsBySupplier(supplierId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 30);

    return json(200, {
      profile,
      recentJourney
    });
  } catch (error) {
    return errorResponse(error);
  }
};
