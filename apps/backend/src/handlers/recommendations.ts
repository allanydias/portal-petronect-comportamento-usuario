import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getRepository } from "../repositories";
import { buildSupplierProfile } from "../services/analyticsService";
import { errorResponse, json } from "../utils/http";

export const getBySupplier: APIGatewayProxyHandlerV2 = async (event) => {
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

    return json(200, {
      supplierId,
      mainInterest: profile.mainInterest,
      frequency: profile.frequency,
      recommendation: profile.recommendedAction
    });
  } catch (error) {
    return errorResponse(error);
  }
};
