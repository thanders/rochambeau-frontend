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
