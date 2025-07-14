import { Handlers } from "$fresh/server.ts";
import { getGameWithVersionstamp, getUserBySession, setGame } from "🛠️/db.ts";
import { determineWinner } from "🛠️/determineWinner.ts";
import { State } from "🛠️/types.ts";

export const handler: Handlers<undefined, State> = {
  async POST(req, ctx) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response("Missing id", { status: 400 });
    }
    const session = ctx.state.session ?? "";
    const user = await getUserBySession(session);
    if (!user) {
      return new Response("Not signed in", { status: 401 });
    }

    const body = await req.json();
    const choice = body.choice;
    console.log("make-move choice ", choice);
    if (!["rock", "paper", "scissors"].includes(choice)) {
      return new Response("Invalid choice", { status: 400 });
    }

    const gameRes = await getGameWithVersionstamp(id);
    if (!gameRes) {
      return new Response("Game not found", { status: 404 });
    }

    const [game, versionstamp] = gameRes;

    // Check if game is already finished
    if (game.state && game.state !== "in_progress") {
      return new Response("Game over", { status: 400 });
    }

    // Only allow player if they are initiator or opponent
    if (user.id !== game.initiator.id && user.id !== game.opponent.id) {
      return new Response("Not a player in this game", { status: 403 });
    }

    // Save the user's choice in game state
    if (user.id === game.initiator.id) {
      game.initiatorChoice = choice;
    } else if (user.id === game.opponent.id) {
      game.opponentChoice = choice;
    }

    // If both players have chosen, determine the winner
    if (game.initiatorChoice && game.opponentChoice) {
      game.result = determineWinner(game.initiatorChoice, game.opponentChoice);
      game.state = "finished";
    } else {
      game.state = "in_progress";
    }

    // Save the updated game state
    const success = await setGame(game, versionstamp);
    if (!success) {
      return new Response("Game has been updated/deleted while processing", {
        status: 409,
      });
    }

    return new Response(JSON.stringify(game), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
