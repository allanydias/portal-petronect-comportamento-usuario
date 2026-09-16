import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";

export function toVercelHandler(lambdaHandler: APIGatewayProxyHandlerV2) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const [path, queryString] = (req.url ?? "/").split("?");

    const event = {
      body: req.body ? JSON.stringify(req.body) : null,
      headers: req.headers as Record<string, string>,
      rawPath: path,
      rawQueryString: queryString ?? "",
      queryStringParameters: (req.query as Record<string, string>) ?? {},
      requestContext: {
        http: { method: req.method ?? "GET" }
      }
    } as unknown as APIGatewayProxyEventV2;

    const result = await lambdaHandler(event, {} as any, (() => {}) as any);

    if (!result || typeof result !== "object" || !("statusCode" in result)) {
      res.status(500).json({ error: "internal_error" });
      return;
    }

    const { statusCode, body, headers } = result as {
      statusCode: number;
      body?: string;
      headers?: Record<string, string>;
    };

    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value);
      }
    }

    res.status(statusCode).send(body ? JSON.parse(body) : undefined);
  };
}