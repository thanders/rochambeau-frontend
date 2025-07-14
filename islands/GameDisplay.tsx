import { Choice, Game, User } from "🛠️/types.ts";
import Countdown from "./CountDown.tsx";
import { useEffect, useState } from "preact/hooks";
import { useDataSubscription } from "🛠️/hooks.ts";

type Stage = "start" | "choose" | "countdown" | "waiting" | "reveal";

const CHOICES: Choice[] = ["rock", "paper", "scissors"];

export default function GameDisplay(props: { game: Game; user: User | null }) {

    console.log("GameDisplay (NEW PAGE LOAD) - props.game:", props.game);
  console.log("GameDisplay (NEW PAGE LOAD) - props.game.id:", props.game.id);
  console.log("GameDisplay (NEW PAGE LOAD) - props.game.state:", props.game.state);
  console.log("GameDisplay (NEW PAGE LOAD) - props.game.initiatorChoice:", props.game.initiatorChoice);
  console.log("GameDisplay (NEW PAGE LOAD) - props.game.opponentChoice:", props.game.opponentChoice);


  const { user } = props;
  const [game, setGame] = useState(props.game);
  const [stage, setStage] = useState<Stage>("start");
  const [userChoice, setUserChoice] = useState<Choice | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<Choice | null>(null);
  // The 'result' type here should match your updated Game interface in types.ts
  const [result, setResult] = useState<"initiator_wins" | "opponent_wins" | "draw" | null>(null);


  console.log('stage', stage);

  // Initialize stage based on initial game data
  useEffect(() => {
    updateGameDisplayState(props.game);
  }, [props.game, user?.id]); // Run once on mount and if props.game or user changes initially

  const startGame = () => {
    setStage("choose");
    setUserChoice(null);
    setOpponentChoice(null);
    setResult(null);
  };

  const handleUserChoice = (choice: Choice) => {
    setUserChoice(choice);
    // When user makes a choice, always go to countdown first
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
        // If the move failed, you might want to reset the stage or show an error
        // For now, we'll let the subscription handle state updates if it eventually succeeds
        return;
      }
    } catch (err) {
      console.error("Error during make-move:", err);
      // Handle error, e.g., revert stage or show a message
    }
  };

const startNewGame = async () => {
  if (!user) {
    console.error("Cannot start new game: user is not logged in.");
    return;
  }

const opponentLogin = user.id === game.initiator.id
  ? game.opponent.login
  : game.initiator.login;
console.log("startNewGame: Opponent login determined as:", opponentLogin);
if (!opponentLogin) {
  console.error("Could not determine opponent for new game, opponentLogin is empty.");
  return;
}

  try {
    const res = await fetch(`/start`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ opponent: opponentLogin }).toString(),
    });
    if(res.ok) {
    globalThis.location.href = res.url;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to start new game (final page error):", errorText);
      alert(`Failed to start new game: ${errorText}`);
    } else {
        console.log("New game initiated successfully, browser handled redirect.");
    }
  } catch (error) {
    console.error("Network error starting new game:", error);
    alert("Network error trying to start a new game.");
  }
};

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
              You chose: <strong>{formatChoice(userChoice)}</strong> {/* Use formatChoice here */}
            </div>
            <div class="text-xl font-semibold mb-4">
              Opponent chose: <strong>{formatChoice(opponentChoice ?? null)}</strong> {/* Use formatChoice here */}
            </div>
            <div class="text-3xl font-extrabold text-gray-900 drop-shadow-lg">
              {/* Adjust this logic to use initiator_wins/opponent_wins/draw */}
              {result === "draw"
                ? "It's a draw!"
                : (user?.id === game.initiator.id && result === "initiator_wins") ||
                  (user?.id === game.opponent.id && result === "opponent_wins")
                ? "You Win!"
                : "You Lose!"}
            </div>
            <button
              onClick={startNewGame}
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
      setGame(newGame); // This updates the `game` state, triggering the useEffect below
    };
    return () => eventSource.close();
  }, [props.game.id]);

  useEffect(() => {
    // This useEffect will run when `game` state (updated by SSE) or `user.id` changes
    updateGameDisplayState(game);
  }, [game, user?.id]);

  const updateGameDisplayState = (gameData: Game) => {
    // Ensure user is present before attempting to determine choices/stage
    if (!user) {
        setStage("start"); // Or a signed-out state if appropriate
        return;
    }

    const isInitiator = user.id === gameData.initiator.id;

    // Set userChoice, opponentChoice, and result based on the latest gameData
    // This ensures consistency from the server's single source of truth
    setUserChoice(isInitiator ? gameData.initiatorChoice ?? null : gameData.opponentChoice ?? null);
    setOpponentChoice(isInitiator ? gameData.opponentChoice ?? null : gameData.initiatorChoice ?? null);
    setResult(gameData.result ?? null);

    // Determine the stage based on the game's state and choices
    if (gameData.state === "finished") {
      setStage("reveal");
    } else if (gameData.state === "in_progress") {
        const myCurrentChoice = isInitiator ? gameData.initiatorChoice : gameData.opponentChoice;

        if (!myCurrentChoice) {
            // My choice is null, meaning I need to make a move
            setStage("choose");
        } else { // My choice is present
            const opponentCurrentChoice = isInitiator ? gameData.opponentChoice : gameData.initiatorChoice;
            if (!opponentCurrentChoice) {
                // I've chosen, but opponent hasn't
                setStage("waiting");
            } else {
                // Both choices are present, but game.state is still in_progress.
                // This is a very brief transitional state before the backend updates to "finished".
                // We'll treat it as waiting for the reveal.
                setStage("waiting");
            }
        }
    } else {
        // Default/initial state for games not yet in progress or finished
        // This handles when a game is freshly created and no choices are made.
        setStage("start");
    }
  };

  return (
    <div class="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50 text-center">
      {renderStage()}
    </div>
  );
}