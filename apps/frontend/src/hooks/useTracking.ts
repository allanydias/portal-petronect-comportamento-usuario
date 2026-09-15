import { useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { trackEventSchema, type EventName } from "@/schemas/event";
import { useSession } from "@/contexts/SessionContext";

type TrackArgs = {
  eventName: EventName;
  page: string;
  section?: string;
  itemId?: string;
  keyword?: string;
  interest?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
};

export function useTracking(page: string) {
  const { session } = useSession();
  const firstClickSent = useRef(false);
  const activeSince = useRef(Date.now());

  useEffect(() => {
    firstClickSent.current = false;
    activeSince.current = Date.now();
  }, [page]);

  const send = useCallback(
    async (args: TrackArgs) => {
      if (!session) return null;

      const input = trackEventSchema.parse({
        sessionId: session.sessionId,
        userId: session.userId,
        supplierId: session.supplierId,
        eventName: args.eventName,
        page: args.page,
        section: args.section ?? null,
        itemId: args.itemId ?? null,
        keyword: args.keyword ?? null,
        durationMs: args.durationMs ?? null,
        metadata: {
          ...(args.metadata ?? {}),
          ...(args.interest ? { interest: args.interest } : {})
        }
      });

      return api.trackEvent(input);
    },
    [session]
  );

  const track = useCallback(
    async (args: Omit<TrackArgs, "page">) => {
      if (!session) return null;

      if (
        args.eventName !== "page_view" &&
        args.eventName !== "first_click" &&
        !firstClickSent.current
      ) {
        firstClickSent.current = true;

        await send({
          eventName: "first_click",
          page,
          section: args.section,
          itemId: args.itemId,
          interest: args.interest
        }).catch(console.error);
      }

      return send({ ...args, page });
    },
    [page, send, session]
  );

  useEffect(() => {
    if (!session) return;

    send({
      eventName: "page_view",
      page,
      section: page
    }).catch(console.error);
  }, [page, send, session]);

  useEffect(() => {
    if (!session) return;

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;

      const now = Date.now();
      const durationMs = Math.max(0, now - activeSince.current);
      activeSince.current = now;

      send({
        eventName: "heartbeat",
        page,
        section: page,
        durationMs
      }).catch(console.error);
    }, 15000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        activeSince.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [page, send, session]);

  return { track };
}
