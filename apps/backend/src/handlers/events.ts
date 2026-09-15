import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getRepository } from "../repositories";
import { eventInputSchema, eventListQuerySchema } from "../schemas/event";
import { buildSupplierProfile } from "../services/analyticsService";
import { newEventId } from "../utils/ids";
import { errorResponse, json, parseJsonBody } from "../utils/http";

export const create: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const input = eventInputSchema.parse(parseJsonBody(event));
    const repository = getRepository();
    await repository.initialize();

    const session = await repository.getSession(input.sessionId);
    if (!session) {
      return json(404, { error: "session_not_found", message: "Sessão não encontrada." });
    }

    if (
      session.userId !== input.userId ||
      session.supplierId !== input.supplierId
    ) {
      return json(403, {
        error: "identity_mismatch",
        message: "Evento não pertence à sessão informada."
      });
    }

    if (input.eventName === "first_click") {
      const sessionEvents = await repository.listEventsBySession(input.sessionId);
      const duplicate = sessionEvents.some(
        (existing) =>
          existing.eventName === "first_click" &&
          (existing.page ?? "") === (input.page ?? "")
      );

      if (duplicate) {
        return json(200, {
          accepted: false,
          duplicate: true,
          reason: "first_click já registrado para esta página na sessão."
        });
      }
    }

    const saved = await repository.saveEvent({
      eventId: input.eventId ?? newEventId(),
      sessionId: input.sessionId,
      userId: input.userId,
      supplierId: input.supplierId,
      eventName: input.eventName,
      page: input.page ?? null,
      section: input.section ?? null,
      itemId: input.itemId ?? null,
      keyword: input.keyword ?? null,
      timestamp: input.timestamp ?? new Date().toISOString(),
      durationMs: input.durationMs ?? null,
      metadata: input.metadata
    });

    const profile = await buildSupplierProfile(repository, input.supplierId);

    return json(201, {
      accepted: true,
      event: saved,
      profile
    });
  } catch (error) {
    return errorResponse(error);
  }
};

export const list: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const query = eventListQuerySchema.parse(event.queryStringParameters ?? {});
    const repository = getRepository();
    await repository.initialize();

    let events = query.supplierId
      ? await repository.listEventsBySupplier(query.supplierId)
      : query.sessionId
        ? await repository.listEventsBySession(query.sessionId)
        : await repository.listEvents();

    events = events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, query.limit);

    return json(200, { events });
  } catch (error) {
    return errorResponse(error);
  }
};
