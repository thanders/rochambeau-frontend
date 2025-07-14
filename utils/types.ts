export interface State {
  session: string | undefined;
}

export interface User {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
}

export interface OauthSession {
  state: string;
  codeVerifier: string;
}

export type GameGrid = [
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
];

export interface Game {
  id: string;
  initiator: User;
  opponent: User;
  grid: GameGrid;
  startedAt: Date;
  lastMoveAt: Date;
  initiatorChoice?: Choice;
  opponentChoice?: Choice;
  result?: "win" | "lose" | "draw";
  state?: "in_progress" | "finished";
}

export interface GameRpS {
  id: string;
  startedAt: Date;
  lastMoveAt: Date;
  initiatorChoice?: Choice;
  opponentChoice?: Choice;
  result?: "win" | "lose" | "draw";
  state?: "in_progress" | "finished";
}

export type Choice = "rock" | "paper" | "scissors";
