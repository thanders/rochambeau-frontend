import { useEffect, useRef, useState } from "preact/hooks";
import { Game, User } from "🛠️/types.ts";
import { useDataSubscription } from "🛠️/hooks.ts";
import { useToast } from "./Snackbar.tsx";
import GamesList from "./GamesList.tsx";
import { getGameResultMessage } from "🛠️/getGameResultMessage.ts";
import { fetchGameById } from "../services/gameService.ts";

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
      const finishedGame = await fetchGameById(finishedGameId);
      if (!finishedGame) return;

      const { message, type } = getGameResultMessage(finishedGame, user);
      showToast(message, type, undefined, finishedGame.id);
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
