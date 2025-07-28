// routes/api/mock-opponent-move.ts
import { Handlers } from "$fresh/server.ts";
import { getGameWithVersionstamp, setGame } from "🛠️/db.ts"; // Need getUserById
import { Choice } from "🛠️/types.ts";
import { determineWinner } from "🛠️/determineWinner.ts"; // If you want winner logic here

const MOCK_OPPONENT_ID = "mock-user-id-steve";

function getRandomChoice(): Choice {
  const choices: Choice[] = ["rock", "paper", "scissors"];
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

export const handler: Handlers = {
  async POST(req) { // Using POST as it modifies state
    const url = new URL(req.url);
    const gameId = url.searchParams.get("id");

    if (!gameId) {
      return new Response("Missing game ID", { status: 400 });
    }

    const gameRes = await getGameWithVersionstamp(gameId);
    if (!gameRes) {
      return new Response("Game not found", { status: 404 });
    }

    const [game, versionstamp] = gameRes;

    // Verify the mock opponent is actually part of this game
    if (
      game.initiator.id !== MOCK_OPPONENT_ID &&
      game.opponent.id !== MOCK_OPPONENT_ID
    ) {
      return new Response("Mock opponent is not part of this game.", {
        status: 403,
      });
    }

    // Check if the mock opponent has already made a move
    if (game.opponent.id === MOCK_OPPONENT_ID && game.opponentChoice) {
      return new Response("Mock opponent already moved.", { status: 409 });
    }
    if (game.initiator.id === MOCK_OPPONENT_ID && game.initiatorChoice) {
      return new Response("Mock opponent already moved.", { status: 409 });
    }

    // Determine if mock opponent is initiator or opponent in THIS specific game
    let targetChoiceField: "initiatorChoice" | "opponentChoice";
    if (game.initiator.id === MOCK_OPPONENT_ID) {
      targetChoiceField = "initiatorChoice";
    } else if (game.opponent.id === MOCK_OPPONENT_ID) {
      targetChoiceField = "opponentChoice";
    } else {
      // This case should ideally not be reached due to the check above
      return new Response("Mock opponent not found as a player in this game.", {
        status: 500,
      });
    }

    // Generate the move
    const mockChoice = getRandomChoice();
    game[targetChoiceField] = mockChoice;
    game.state = "in_progress";

    // If both players have now chosen (including the mock opponent)
    if (game.initiatorChoice && game.opponentChoice) {
      game.result = determineWinner(game.initiatorChoice, game.opponentChoice);
      game.state = "finished";
    }

    const success = await setGame(game, versionstamp);
    if (!success) {
      return new Response(
        "Game updated by another process (concurrency conflict)",
        {
          status: 409,
        },
      );
    }

    return new Response(JSON.stringify(game), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
