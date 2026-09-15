import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getRepository } from "../repositories";
import { sessionEndSchema, sessionStartSchema } from "../schemas/session";
import { newEventId, newSessionId } from "../utils/ids";
import { errorResponse, json, parseJsonBody } from "../utils/http";

export const start: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const input = sessionStartSchema.parse(parseJsonBody(event));
    const repository = getRepository();
    await repository.initialize();

    const user = await repository.getUser(input.userId);
    if (!user || user.supplierId !== input.supplierId) {
      return json(404, { error: "user_not_found", message: "Usuário não encontrado." });
    }

    const startedAt = new Date().toISOString();
    const session = await repository.saveSession({
      sessionId: newSessionId(),
      userId: input.userId,
      supplierId: input.supplierId,
      startedAt
    });

    await repository.saveEvent({
      eventId: newEventId(),
      sessionId: session.sessionId,
      userId: session.userId,
      supplierId: session.supplierId,
      eventName: "session_start",
      page: null,
      section: null,
      itemId: null,
      keyword: null,
      timestamp: startedAt,
      durationMs: null,
      metadata: {}
    });

    return json(201, session);
  } catch (error) {
    return errorResponse(error);
  }
};

export const end: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const input = sessionEndSchema.parse(parseJsonBody(event));
    const repository = getRepository();
    await repository.initialize();

    const session = await repository.getSession(input.sessionId);
    if (!session) {
      return json(404, { error: "session_not_found", message: "Sessão não encontrada." });
    }

    if (session.endedAt) return json(200, session);

    const endedAt = new Date().toISOString();
    const durationMs = Math.max(
      0,
      new Date(endedAt).getTime() - new Date(session.startedAt).getTime()
    );

    const updated = await repository.saveSession({
      ...session,
      endedAt,
      durationMs
    });

    await repository.saveEvent({
      eventId: newEventId(),
      sessionId: updated.sessionId,
      userId: updated.userId,
      supplierId: updated.supplierId,
      eventName: "session_end",
      page: null,
      section: null,
      itemId: null,
      keyword: null,
      timestamp: endedAt,
      durationMs,
      metadata: {}
    });

    return json(200, updated);
  } catch (error) {
    return errorResponse(error);
  }
};
