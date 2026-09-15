import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { json } from "../utils/http";

export const handler: APIGatewayProxyHandlerV2 = async () => {
  return json(200, {
    ok: true,
    service: "petronect-behavior-backend",
    dataMode: process.env.DATA_MODE || "local",
    timestamp: new Date().toISOString()
  });
};
