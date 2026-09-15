import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { loginSchema } from "../schemas/auth";
import { identifySupplier } from "../services/authService";
import { getRepository } from "../repositories";
import { errorResponse, json, parseJsonBody } from "../utils/http";

export const login: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const input = loginSchema.parse(parseJsonBody(event));
    const repository = getRepository();
    await repository.initialize();

    const user = await identifySupplier(repository, input.cnpj, input.role);

    return json(200, {
      userId: user.userId,
      supplierId: user.supplierId,
      cnpjMasked: user.cnpjMasked,
      role: user.role
    });
  } catch (error) {
    return errorResponse(error);
  }
};
