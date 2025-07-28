import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import { Game, State, User } from "🛠️/types.ts";
import { Header } from "🧱/Header.tsx";
import { getGame, getUserBySession } from "🛠️/db.ts";
import GameDisplay from "🏝️/GameDisplay.tsx";
interface Data {
  game: Game;
  user: User;
}

export async function handler(req: Request, ctx: HandlerContext<Data, State>) {
  const [game, user] = await Promise.all([
    getGame(ctx.params.id),
    getUserBySession(ctx.state.session ?? ""),
  ]);

  console.log("[/game/:id handler] Fetched game:", game?.id);
  console.log("[/game/:id handler] Fetched user:", user ? user.login : "N/A");

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  if (!game) {
    return new Response("Game not found", { status: 404 });
  }

  // Return render with real game and user
  return ctx.render({
    user,
    game,
  });
}

export default function Home(props: PageProps<Data>) {
  const { user, game } = props.data;
  return (
    <>
      <Head>
        <title>
          Rock, Paper, Scissors!
        </title>
      </Head>
      <div class="px-4 py-8 mx-auto max-w-screen-md">
        <Header user={user} />
        <main>
          <h1>Game #{game.id}</h1>
          <GameDisplay key={game.id} game={game} user={user} />
        </main>
      </div>
    </>
  );
}
