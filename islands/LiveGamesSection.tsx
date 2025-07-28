import { useEffect, useRef, useState } from "preact/hooks";
import { Game, User } from "🛠️/types.ts";
import { useDataSubscription } from "🛠️/hooks.ts";
import { useToast } from "./Snackbar.tsx";
import GamesList from "./GamesList.tsx";

interface LiveGamesSectionProps {
  user: User;
  initialGames: Game[];
  allGamesForStats: Game[];
}

export default function LiveGamesSection(props: LiveGamesSectionProps) {
  const { user, initialGames, allGamesForStats } = props;
  const { showToast } = useToast();

  const [liveGames, setLiveGames] = useState<Game[]>(() =>
    initialGames.map((g) => ({
      ...g,
      startedAt: new Date(g.startedAt),
      lastMoveAt: new Date(g.lastMoveAt),
    }))
  );

  const prevLiveGamesRef = useRef<Game[]>([]);

  useDataSubscription<Game[]>(
    `/api/events/games`,
    (fetchedGames) => {
      setLiveGames(fetchedGames.map((g: Game) => ({
        ...g,
        startedAt: new Date(g.startedAt),
        lastMoveAt: new Date(g.lastMoveAt),
      })));
    },
    [],
  );

  // Effect to detect newly finished games for toasts
  useEffect(() => {
    if (prevLiveGamesRef.current.length === 0 && liveGames.length > 0) {
      prevLiveGamesRef.current = [...liveGames];
      return;
    }

    const potentialFinishedGamesIds = prevLiveGamesRef.current
      .filter((prevGame) => prevGame.state === "in_progress")
      .filter((prevGame) =>
        !liveGames.some((currGame) => currGame.id === prevGame.id)
      )
      .map((game) => game.id);

    potentialFinishedGamesIds.forEach(async (finishedGameId) => {
      try {
        const response = await fetch(`/api/game-details?id=${finishedGameId}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch game details for ${finishedGameId}: ${response.statusText}`,
          );
        }
        const finishedGame: Game = await response.json();

        if (finishedGame.state === "finished") {
          let message = "";
          let type: "success" | "error" | "info" | "warning" = "info";

          if (finishedGame.result === "initiator_wins") {
            if (user.id === finishedGame.initiator.id) {
              message = "🎉 You won the game!";
              type = "success";
            } else {
              message = "😞 You lost the game.";
              type = "error";
            }
          } else if (finishedGame.result === "opponent_wins") {
            if (user.id === finishedGame.opponent.id) {
              message = "🎉 You won the game!";
              type = "success";
            } else {
              message = "😞 You lost the game.";
              type = "error";
            }
          } else if (finishedGame.result === "draw") {
            message = "🤝 The game was a tie!";
            type = "info";
          } else {
            message = "Game finished with an unknown outcome.";
            type = "info";
          }

          console.log(
            `Showing toast: "${message}" with type "${type}" for game ${finishedGame.id}`,
          );
          showToast(message, type, undefined, finishedGame.id);
        }
      } catch (error) {
        console.error(
          `Error processing finished game ${finishedGameId}:`,
          error,
        );
        showToast(
          `Error detecting game outcome for ${finishedGameId}.`,
          "error",
        );
      }
    });

    prevLiveGamesRef.current = [...liveGames];
  }, [liveGames, user.id, showToast]);

  return (
    <>
      <GamesList
        games={liveGames}
        user={user}
        allGamesForStats={allGamesForStats}
      />
    </>
  );
}
