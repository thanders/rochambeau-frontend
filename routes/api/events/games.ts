import { Handlers } from "$fresh/server.ts";
import { State } from "🛠️/types.ts";
import { getUserBySession, subscribeGamesByPlayer } from "../../../utils/db.ts";

export const handler: Handlers<undefined, State> = {
  async GET(req, ctx) {
    if (!ctx.state.session) {
      return new Response("Not logged in", { status: 401 });
    }
    const user = await getUserBySession(ctx.state.session);
    if (!user) return new Response("Not logged in", { status: 401 });

    const body = new ReadableStream({
      start(controller) {
        console.log(`[EventSource] Client connected for user: ${user.id}`);
        // Send a retry command to the client to reconnect automatically
        controller.enqueue(`retry: 1000\n\n`);

        const unsub = subscribeGamesByPlayer(user.id, (games) => {
          const data = JSON.stringify(games);
          controller.enqueue(`data: ${data}\n\n`);
        });

        // Use the request's signal to detect when the client disconnects
        req.signal.addEventListener("abort", () => {
          console.log(`[EventSource] Client disconnected for user: ${user.id}`);
          unsub(); // Clean up the database subscription
          try {
            controller.close();
          } catch (e) {
            console.error("Failed to close stream controller:", e);
          }
        }, { once: true });
      },
    });

    return new Response(body.pipeThrough(new TextEncoderStream()), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  },
};
