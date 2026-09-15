import express from "express";
import cors from "cors";
import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { handler as healthHandler } from "./handlers/health";
import { login } from "./handlers/auth";
import { start as startSession, end as endSession } from "./handlers/sessions";
import { create as createEvent, list as listEvents } from "./handlers/events";
import { dashboard, suppliers, supplierDetail } from "./handlers/analytics";
import { getBySupplier } from "./handlers/recommendations";
import { getRepository } from "./repositories";

process.env.DATA_MODE = process.env.DATA_MODE || "local";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "256kb" }));

type LambdaHandler = (
  event: APIGatewayProxyEventV2
) => Promise<APIGatewayProxyStructuredResultV2 | void>;

function adapt(handler: LambdaHandler) {
  return async (req: express.Request, res: express.Response) => {
    const event = {
      version: "2.0",
      routeKey: `${req.method} ${req.path}`,
      rawPath: req.path,
      rawQueryString: new URLSearchParams(req.query as Record<string, string>).toString(),
      headers: Object.fromEntries(
        Object.entries(req.headers).map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value ?? ""])
      ),
      queryStringParameters: Object.keys(req.query).length
        ? Object.fromEntries(
            Object.entries(req.query).map(([key, value]) => [key, String(value)])
          )
        : undefined,
      pathParameters: Object.fromEntries(
        Object.entries(req.params).map(([key, value]) => [key, String(value)])
      ),
      requestContext: {} as APIGatewayProxyEventV2["requestContext"],
      body: req.body && Object.keys(req.body).length ? JSON.stringify(req.body) : undefined,
      isBase64Encoded: false
    } satisfies APIGatewayProxyEventV2;

    try {
      const result = await handler(event);
      if (!result) return res.status(204).end();

      if (result.headers) {
        for (const [key, value] of Object.entries(result.headers)) {
          if (value !== undefined && value !== null) res.setHeader(key, String(value));
        }
      }

      const payload = result.body ? JSON.parse(result.body) : undefined;
      return res.status(result.statusCode ?? 200).json(payload);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "local_adapter_error" });
    }
  };
}

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "petronect-behavior-backend",
    message: "API local em execução.",
    endpoints: {
      health: "/health",
      dashboard: "/analytics/dashboard",
      suppliers: "/analytics/suppliers",
      login: "POST /auth/login"
    }
  });
});

app.get("/health", adapt(healthHandler as LambdaHandler));
app.post("/auth/login", adapt(login as LambdaHandler));
app.post("/session/start", adapt(startSession as LambdaHandler));
app.post("/session/end", adapt(endSession as LambdaHandler));
app.post("/events", adapt(createEvent as LambdaHandler));
app.get("/events", adapt(listEvents as LambdaHandler));
app.get("/analytics/dashboard", adapt(dashboard as LambdaHandler));
app.get("/analytics/suppliers", adapt(suppliers as LambdaHandler));
app.get("/analytics/suppliers/:supplierId", adapt(supplierDetail as LambdaHandler));
app.get("/recommendations/:supplierId", adapt(getBySupplier as LambdaHandler));

app.post("/admin/reset", async (_req, res) => {
  const repository = getRepository();
  if (!repository.reset) {
    return res.status(400).json({ error: "reset_only_available_locally" });
  }
  await repository.reset();
  return res.json({ ok: true });
});

const port = Number(process.env.PORT || 3001);

getRepository()
  .initialize()
  .then(() => {
    app.listen(port, () => {
      console.log("");
      console.log("Petronect Behavior Backend");
      console.log(`API local: http://localhost:${port}`);
      console.log(`Health:    http://localhost:${port}/health`);
      console.log(`Dashboard: http://localhost:${port}/analytics/dashboard`);
      console.log("");
    });
  })
  .catch((error) => {
    console.error("Falha ao iniciar backend:", error);
    process.exit(1);
  });
