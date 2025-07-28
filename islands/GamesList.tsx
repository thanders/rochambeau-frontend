import { tw } from "twind";

import { Game, User } from "🛠️/types.ts";
import { GameStateInProgress } from "🛠️/game.ts";

import { UserNameHorizontal } from "🧱/User.tsx";
import { Button } from "🧱/Button.tsx";

export default function GameList(
  props: { games: Game[]; user: User; allGamesForStats: Game[] },
) {
  const activeGames = props.games as (Game & GameStateInProgress)[];

  const finishedGames = props.allGamesForStats.filter((game) =>
    game.state === "finished"
  );

  const wins = finishedGames.filter((game) => {
    return (
      (game.result === "initiator_wins" &&
        props.user.id === game.initiator.id) ||
      (game.result === "opponent_wins" && props.user.id === game.opponent.id)
    );
  }).length;

  const losses = finishedGames.filter((game) => {
    return (
      (game.result === "initiator_wins" &&
        props.user.id === game.opponent.id) ||
      (game.result === "opponent_wins" && props.user.id === game.initiator.id)
    );
  }).length;

  const ties = finishedGames.filter((g) => g.result === "draw").length;

  return (
    <div class="my-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="grid gap-4 grid-cols-3 sm:grid-cols-1">
        <div class="border rounded-lg p-2 text-center">
          <h2 class="text-lg font-semibold">Wins 🏆</h2>
          <p class="text-4xl font-bold">
            {wins}
          </p>
        </div>
        <div class="border rounded-lg p-2 text-center">
          <h2 class="text-lg font-semibold">Losses 😭</h2>
          <p class="text-4xl font-bold">
            {losses}
          </p>
        </div>
        <div class="border rounded-lg p-2 text-center">
          <h2 class="text-lg font-semibold">Ties 😐</h2>
          <p class="text-4xl font-bold">
            {ties}
          </p>
        </div>
      </div>

      <div class="border rounded-lg sm:col-span-3 flex flex-col max-h-72">
        <h2 class="px-4 pt-2 text-lg font-semibold">
          Active Games
        </h2>
        <p class="px-4 pb-2 text(sm gray-500)">
          {activeGames.length} in progress games
        </p>

        <ul class="flex-grow-1 overflow-y-auto">
          {activeGames.length
            ? activeGames.map((game) => (
              <GameListItem
                game={game}
                currentUser={props.user}
                key={game.id}
              />
            ))
            : (
              <li class="text-gray-600 px-4 py-2 border-t">
                No active games right now. Start one below!
              </li>
            )}
        </ul>
        {
          /* <a
          class="px-4 py-1 border-t text(sm gray-600 center) hover:bg-gray-50 block"
          href="/games"
        >
          See full game history
        </a> */
        }
      </div>
    </div>
  );
}

function GameListItem(
  props: { currentUser: User; game: Game & GameStateInProgress },
) {
  const { game, currentUser } = props;

  const otherPlayer = game.initiator.id == currentUser.id
    ? game.opponent
    : game.initiator;

  const isCurrentUserInitiator = currentUser.id === game.initiator.id;

  const myChoice = isCurrentUserInitiator
    ? game.initiatorChoice
    : game.opponentChoice;

  const gameMoveText = myChoice ? "Waiting for Opponent" : "Make a move";

  return (
    <li
      class={tw`flex items-center ${
        isCurrentUserInitiator && game.initiatorChoice
      } px-3 py-2 border-t`}
    >
      <img
        class="w-8 h-8 mr-2 rounded-full"
        src={otherPlayer.avatarUrl}
        alt={otherPlayer.login}
      />
      <div class="flex-1">
        <p class="font-semibold">
          You vs <UserNameHorizontal user={otherPlayer} />
        </p>
        <p class="text-sm text-gray-600">
          {gameMoveText}
        </p>
      </div>
      {myChoice
        ? <Button variant="primary" href={`/game/${game.id}`}>View</Button>
        : (
          <Button variant="success" href={`/game/${game.id}`}>
            Make Move!
          </Button>
        )}
    </li>
  );
}
