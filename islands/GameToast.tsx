import { useEffect } from "preact/hooks";
import { useToast } from "🏝️/Snackbar.tsx";
import { User } from "🛠️/types.ts";
import { getGameResultMessage } from "🛠️/getGameResultMessage.ts";
import { fetchGameById } from "../services/gameService.ts";

interface Props {
  gameParam?: string;
  user: User;
}

export default function GameToast({ gameParam, user }: Props) {
  const { showToast } = useToast();

  useEffect(() => {
    if (!gameParam) return;

    const handleGameToast = async () => {
      const game = await fetchGameById(gameParam);
      if (!game) return;

      if (game.state === "finished") {
        const { message, type } = getGameResultMessage(game, user);
        showToast(message, type, undefined, game.id);
      }
    };

    handleGameToast();

    // Clean up URL
    const url = new URL(globalThis.location.href);
    url.searchParams.delete("game");
    globalThis.history.replaceState({}, "", url.toString());
  }, [gameParam]);

  return null;
}
