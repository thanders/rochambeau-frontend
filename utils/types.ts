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

export interface Game {
  id: string;
  initiator: User;
  opponent: User;
  startedAt: Date;
  lastMoveAt: Date;
  initiatorChoice?: Choice;
  opponentChoice?: Choice;
  result?: "initiator_wins" | "opponent_wins" | "draw";
  state?: "in_progress" | "finished";
}

export type Choice = "rock" | "paper" | "scissors";
