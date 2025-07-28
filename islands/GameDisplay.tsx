import { Choice, Game, User } from "🛠️/types.ts";
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

  const [result, setResult] = useState<
    "initiator_wins" | "opponent_wins" | "draw" | null
  >(null);

  useEffect(() => {
    updateGameDisplayState(props.game);
  }, [props.game, user?.id]);

  const startGame = () => {
    setStage("choose");
    setUserChoice(null);
    setOpponentChoice(null);
    setResult(null);
  };

  const handleUserChoice = async (choice: Choice) => {
    setUserChoice(choice);
    try {
      const res = await fetch(`/api/make-move?id=${game.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: choice }),
      });

      if (res.ok) {
        setStage("waiting");
        globalThis.location.href = "/";
      }

      if (!res.ok) {
        console.error("Failed to make move:", await res.text());
        return;
      }
    } catch (err) {
      console.error("Error during make-move:", err);
    }
  };

  const goToGamesList = () => {
    globalThis.location.href = "/";
  };

  const formatChoice = (choice: Choice | null) =>
    choice ? choice.charAt(0).toUpperCase() + choice.slice(1) : "N/A";

  const renderSelectionUI = () => (
    <div class="flex gap-6 mt-8">
      {CHOICES.map((choice) => (
        <button
          type="button"
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
            type="button"
            onClick={startGame}
            class="px-8 py-4 text-2xl font-bold rounded-lg bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Start Game
          </button>
        );

      case "choose":
        return (
          <>
            <div class="text-2xl font-semibold text-gray-800">
              Choose your move:
            </div>
            {renderSelectionUI()}
          </>
        );

      case "waiting":
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
              You chose: <strong>{formatChoice(userChoice)}</strong>
              {" "}
            </div>
            <div class="text-xl font-semibold mb-4">
              Opponent chose:{" "}
              <strong>{formatChoice(opponentChoice ?? null)}</strong>
              {" "}
            </div>
            <div class="text-3xl font-extrabold text-gray-900 drop-shadow-lg">
              {result === "draw"
                ? "It's a draw!"
                : (user?.id === game.initiator.id &&
                    result === "initiator_wins") ||
                    (user?.id === game.opponent.id &&
                      result === "opponent_wins")
                ? "You Win!"
                : "You Lose!"}
            </div>
            <button
              type="button"
              onClick={goToGamesList}
              class="mt-6 px-6 py-3 text-lg font-semibold rounded bg-green-600 text-white hover:bg-green-700 transition"
            >
              Go to Games List
            </button>
          </div>
        );
    }
  };

  useDataSubscription<Game>(
    `/api/events/game?id=${encodeURIComponent(props.game.id)}`,
    (newGame) => {
      setGame(newGame);
    },
    [props.game.id],
  );

  useEffect(() => {
    updateGameDisplayState(game);
  }, [game, user?.id]);

  const updateGameDisplayState = (gameData: Game) => {
    if (!user) {
      setStage("start");
      return;
    }

    const isInitiator = user.id === gameData.initiator.id;

    setUserChoice(
      isInitiator
        ? gameData.initiatorChoice ?? null
        : gameData.opponentChoice ?? null,
    );
    setOpponentChoice(
      isInitiator
        ? gameData.opponentChoice ?? null
        : gameData.initiatorChoice ?? null,
    );
    setResult(gameData.result ?? null);

    if (gameData.state === "finished") {
      setStage("reveal");
    } else if (gameData.state === "in_progress") {
      const myCurrentChoice = isInitiator
        ? gameData.initiatorChoice
        : gameData.opponentChoice;

      if (!myCurrentChoice) {
        setStage("choose");
      } else {
        const opponentCurrentChoice = isInitiator
          ? gameData.opponentChoice
          : gameData.initiatorChoice;
        if (!opponentCurrentChoice) {
          setStage("waiting");
        } else {
          setStage("waiting");
        }
      }
    } else {
      setStage("start");
    }
  };

  return (
    <div class="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50 text-center">
      {renderStage()}
    </div>
  );
}
