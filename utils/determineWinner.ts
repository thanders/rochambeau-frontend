import { Choice } from "./types.ts";

const winsAgainst: Record<Choice, Choice> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

export const determineWinner = (user: Choice, opponent: Choice): "win" | "lose" | "draw" => {
  if (user === opponent) return "draw";
  return winsAgainst[user] === opponent ? "win" : "lose";
};