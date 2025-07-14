import { Handlers } from "$fresh/server.ts";
import { State } from "🛠️/types.ts";
import { getUserBySession, getAllGamesByPlayerForStats } from "../../utils/db.ts";

export const handler: Handlers<undefined, State> = {
  async GET(req, ctx) {
    if (!ctx.state.session) {
      return new Response("Not logged in", { status: 401 });
    }
    const user = await getUserBySession(ctx.state.session);
    if (!user) return new Response("User not found", { status: 404 });

    const allGames = await getAllGamesByPlayerForStats(user.id);

    return new Response(JSON.stringify(allGames), {
      headers: { "Content-Type": "application/json" },
    });
  },
};