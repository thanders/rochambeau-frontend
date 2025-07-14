import { Choice, Game, User } from "🛠️/types.ts";
import Countdown from "./CountDown.tsx";
import { useEffect, useState } from "preact/hooks";
import { useDataSubscription } from "🛠️/hooks.ts";

type Stage = "start" | "choose" | "countdown" | "waiting" | "reveal";

const CHOICES: Choice[] = ["rock", "paper", "scissors"];

export default function GameDisplay(props: { game: Game; user: User | null }) {
  const { user } = props;
  const [game, setGame] = useState(props.game);
  const [stage, setStage] = useState<Stage>("start");
  const [userChoice, setUserChoice] = useState<Choice | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);


  console.log('stage', stage);
  const startGame = () => {
    setStage("choose");
    setUserChoice(null);
    setOpponentChoice(null);
    setResult(null);
  };

  const handleUserChoice = (choice: Choice) => {
    setUserChoice(choice);
    setStage("countdown");
  };

  const handleCountdownComplete = async () => {
    if (!userChoice || !user || !game.id) return;

    try {
      const res = await fetch(`/api/make-move?id=${game.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: userChoice }),
      });

      if (!res.ok) {
        console.error("Failed to make move:", await res.text());
        return;
      }

      const updatedGame: Game = await res.json();

      const isInitiator = user.id === updatedGame.initiator.id;

      const myChoice = isInitiator ? updatedGame.initiatorChoice : updatedGame.opponentChoice;
      const oppChoice = isInitiator ? updatedGame.opponentChoice : updatedGame.initiatorChoice;

      setUserChoice(myChoice ?? null);
      setOpponentChoice(oppChoice ?? null);
      setResult(updatedGame.result ?? null);
      setStage("reveal");
    } catch (err) {
      console.error("Error during make-move:", err);
    }
  };

  const resetGame = () => setStage("start");

  const formatChoice = (choice: Choice | null) =>
    choice ? choice.charAt(0).toUpperCase() + choice.slice(1) : "N/A";

  const renderSelectionUI = () => (
    <div class="flex gap-6 mt-8">
      {CHOICES.map((choice) => (
        <button
          key={choice}
          onClick={() => handleUserChoice(choice)}
          class="px-6 py-4 text-xl font-bold rounded-lg bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition"
        >
          {formatChoice(choice)}
        </button>
      ))}
    </div>
  );

  const renderStage = () => {
    switch (stage) {
      case "start":
        return (
          <button
            type='submit'
            onClick={startGame}
            class="px-8 py-4 text-2xl font-bold rounded-lg bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Start Game
          </button>
        );

      case "choose":
        return (
          <>
            <div class="text-2xl font-semibold text-gray-800">Choose your move:</div>
            {renderSelectionUI()}
          </>
        );

      case "countdown":
        return (
          <>
            <div class="text-2xl font-semibold text-gray-800 mt-4">Waiting for opponent...</div>
            <Countdown start={3} onComplete={handleCountdownComplete} />
          </>
        );

      case "waiting": // This stage is now correctly handled
        return (
          <div class="mt-8 text-2xl font-semibold text-gray-800">
            You chose: <strong>{formatChoice(userChoice)}</strong>.
            <br />
            Waiting for opponent to make their move...
            <p class="mt-4 text-gray-600 text-lg">
                (Page will update automatically when opponent plays)
            </p>
          </div>
        );

      case "reveal":
        return (
          <div class="mt-8">
            <div class="text-xl font-semibold mb-2">
              You chose: <strong>{userChoice}</strong>
            </div>
            <div class="text-xl font-semibold mb-4">
              Opponent chose: <strong>{opponentChoice ?? "..."}</strong>
            </div>
            <div class="text-3xl font-extrabold text-gray-900 drop-shadow-lg">
              {result === "draw"
                ? "It's a draw!"
                : result === "win"
                ? "You Win!"
                : "You Lose!"}
            </div>
            <button
              onClick={resetGame}
              class="mt-6 px-6 py-3 text-lg font-semibold rounded bg-green-600 text-white hover:bg-green-700 transition"
            >
              Play Again
            </button>
          </div>
        );
    }
  };

  useDataSubscription(() => {
    const eventSource = new EventSource(
      `/api/events/game?id=${encodeURIComponent(props.game.id)}`,
    );
    eventSource.onmessage = (e) => {
      const newGame = JSON.parse(e.data) as Game;
      setGame(newGame);
    };
    return () => eventSource.close();
  }, [props.game.id]);

    useEffect(() => {
    updateGameDisplayState(game);
  }, [game, user?.id]);

  const updateGameDisplayState = (gameData: Game) => {
    const isInitiator = user?.id === gameData.initiator.id;

    const myChoice = isInitiator ? gameData.initiatorChoice : gameData.opponentChoice;
    const oppChoice = isInitiator ? gameData.opponentChoice : gameData.initiatorChoice;

    setUserChoice(myChoice ?? null);
    setOpponentChoice(oppChoice ?? null);
    setResult(gameData.result ?? null);

    if (gameData.state === "finished" && myChoice && oppChoice) {
      setStage("reveal");
    } else if ((myChoice && !oppChoice) || (!myChoice && oppChoice)) {
      // If one player has chosen but the other hasn't
      setStage("waiting");
    } else if (!myChoice && !oppChoice && gameData.state !== "finished") {
        // Game just started or reset, no moves yet
        setStage("start");
    }
  };

  return (
    <div class="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50 text-center">
      {renderStage()}
    </div>
  );
}
