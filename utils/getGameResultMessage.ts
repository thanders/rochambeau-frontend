import { Game, User } from "🛠️/types.ts";

export type ToastType = "success" | "error" | "info" | "warning";

export function getGameResultMessage(
  game: Game,
  user: User,
): { message: string; type: ToastType } {
  const isInitiator = user.id === game.initiator.id;
  const isOpponent = user.id === game.opponent.id;

  switch (game.result) {
    case "initiator_wins":
      return {
        message: isInitiator ? "🎉 You won the game!" : "😞 You lost the game.",
        type: isInitiator ? "success" : "error",
      };

    case "opponent_wins":
      return {
        message: isOpponent ? "🎉 You won the game!" : "😞 You lost the game.",
        type: isOpponent ? "success" : "error",
      };

    case "draw":
      return {
        message: "🤝 The game was a tie!",
        type: "info",
      };

    default:
      return {
        message: "Game finished with an unknown outcome.",
        type: "info",
      };
  }
}
