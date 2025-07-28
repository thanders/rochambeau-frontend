import { Choice } from "./types.ts";

const winsAgainst: Record<Choice, Choice> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

// This function now returns specific strings indicating which player (initiator or opponent) won.
export const determineWinner = (
  initiatorChoice: Choice,
  opponentChoice: Choice,
): "initiator_wins" | "opponent_wins" | "draw" => {
  if (initiatorChoice === opponentChoice) {
    return "draw";
  }

  // Check if initiator wins
  if (winsAgainst[initiatorChoice] === opponentChoice) {
    return "initiator_wins";
  }

  // Otherwise, opponent wins
  return "opponent_wins";
};
