import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { ZodError } from "zod";

const corsHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "Content-Type,Authorization",
  "access-control-allow-methods": "GET,POST,OPTIONS"
};

export function json(
  statusCode: number,
  body: unknown
): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
  };
}

export function parseJsonBody(event: APIGatewayProxyEventV2): unknown {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    throw new SyntaxError("invalid_json");
  }
}

export function errorResponse(error: unknown): APIGatewayProxyStructuredResultV2 {
  if (error instanceof ZodError) {
    return json(400, {
      error: "validation_error",
      message: "Dados inválidos.",
      issues: error.issues
    });
  }

  if (error instanceof SyntaxError) {
    return json(400, {
      error: "invalid_json",
      message: "JSON inválido."
    });
  }

  console.error(error);
  return json(500, {
    error: "internal_error",
    message: "Erro interno do servidor."
  });
}
