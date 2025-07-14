import { Game } from "./types.ts";

export type GameState = GameStateInProgress | GameStateTie | GameStateWin;


export interface GameStateInProgress {
  state: "in_progress";
  pendingPlayerId: string | null; // Indicates whose choice is still needed
}

export interface GameStateTie {
  state: "tie";
}

export interface GameStateWin {
  state: "win";
  winner: string;
}

export function analyzeGame(game: Game): GameState {
  const {
    initiator: initiatorUser,
    opponent: opponentUser,
    initiatorChoice,
    opponentChoice,
    result, // This comes from determineWinner.ts
    state,  // This is set in make-move.ts
  } = game;

  // 1. If the game is already in a final state ("finished")
  if (state === "finished") {
    if (result === "draw") {
      return { state: "tie" };
    } else if (result === "initiator_wins") { // Assuming 'result' comes as a string like this
      return { state: "win", winner: initiatorUser.id };
    } else if (result === "opponent_wins") { // Assuming 'result' comes as a string like this
      return { state: "win", winner: opponentUser.id };
    }
    // Fallback if result is 'win'/'lose' but not clearly tied to an ID,
    // or if `result` is something unexpected.
    return { state: "in_progress", pendingPlayerId: null };
  }

  // 2. If the game is in progress or its initial state (no 'state' property yet)
  if (state === "in_progress" || state === undefined) {
    if (!initiatorChoice && !opponentChoice) {
      // Neither player has made a choice yet.
      // For the UI to prompt someone, let's say the initiator is expected to play first.
      return { state: "in_progress", pendingPlayerId: initiatorUser.id };
    } else if (!initiatorChoice && opponentChoice) {
      // Opponent has played, waiting for initiator.
      return { state: "in_progress", pendingPlayerId: initiatorUser.id };
    } else if (initiatorChoice && !opponentChoice) {
      // Initiator has played, waiting for opponent.
      return { state: "in_progress", pendingPlayerId: opponentUser.id };
    } else {
      // Both choices are present, but the game state is still 'in_progress'.
      // This is a transitional state before the `make-move.ts` handler updates `state` to "finished".
      // In this scenario, no one is "pending" a move; they are waiting for the result.
      return { state: "in_progress", pendingPlayerId: null };
    }
  }

  // Fallback for any other unexpected game state (e.g., if 'state' is neither 'in_progress' nor 'finished')
  // Treats it as if it's in progress with no immediate pending player.
  return { state: "in_progress", pendingPlayerId: null };
}