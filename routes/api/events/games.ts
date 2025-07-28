import { Handlers } from "$fresh/server.ts";
import { State } from "🛠️/types.ts";
import { getUserBySession, subscribeGamesByPlayer } from "../../../utils/db.ts";

export const handler: Handlers<undefined, State> = {
  async GET(_, ctx) {
    if (!ctx.state.session) {
      return new Response("Not logged in", { status: 401 });
    }
    const user = await getUserBySession(ctx.state.session);
    if (!user) return new Response("Not logged in", { status: 401 });

    // Initialize cleanup to a no-op function
    let cleanup: () => void = () => {}; // <-- FIX: Initialize to empty function

    const body = new ReadableStream({
      start(controller) {
        console.log(`[EventSource] Client connected for user: ${user.id}`);
        controller.enqueue(`retry: 1000\n\n`);

        // Assign the actual cleanup function
        cleanup = subscribeGamesByPlayer(user.id, (games) => {
          console.log(
            `[EventSource] Sending games update for user ${user.id}:`,
            games,
          );
          const data = JSON.stringify(games);
          controller.enqueue(`data: ${data}\n\n`);
        });
      },
      cancel() {
        console.log(`[EventSource] Client disconnected for user: ${user.id}`);
        // Now 'cleanup' will always be a function, even if it's the no-op.
        // It won't throw 'undefined is not a function'.
        cleanup();
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
