import { Handlers } from "$fresh/server.ts";
import { getGame } from "../../utils/db.ts"; // Adjust path as needed based on your project structure

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const gameId = url.searchParams.get("id");

    if (!gameId) {
      return new Response("Missing game ID", { status: 400 });
    }

    const game = await getGame(gameId); // Use the getGame function here

    if (!game) {
      return new Response("Game not found", { status: 404 });
    }

    return new Response(JSON.stringify(game), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
