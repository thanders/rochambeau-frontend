import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import { Game, State, User } from "🛠️/types.ts";
import {
  getAllGamesByPlayerForStats,
  getUserBySession,
  listGamesByPlayer,
  listPreviouslyPlayedUsers,
} from "🛠️/db.ts";

import { Button, ButtonLink } from "🧱/Button.tsx";
import { UserNameVertical } from "🧱/User.tsx";
import { Header } from "🧱/Header.tsx";

import ShareButton from "🏝️/ShareButton.tsx";
import LiveGamesSection from "🏝️/LiveGamesSection.tsx";
import { useRef } from "preact/hooks";

type Data = SignedInData | null;

interface SignedInData {
  user: User;
  users: User[];
  games: Game[];
  allGamesForStats: Game[];
  appUrl: string;
}

export async function handler(req: Request, ctx: HandlerContext<Data, State>) {
  if (!ctx.state.session) return ctx.render(null);

  const user = await getUserBySession(ctx.state.session);
  if (!user) return ctx.render(null);

  const [users, allGamesForStats, games] = await Promise.all([
    listPreviouslyPlayedUsers(user.id),
    getAllGamesByPlayerForStats(user.id),
    listGamesByPlayer(user.id),
  ]);

  const appUrl = new URL(req.url).origin;

  return ctx.render({
    user,
    users,
    games,
    allGamesForStats,
    appUrl,
  });
}

export default function Home(props: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>Rock, Paper, Scissors!</title>
      </Head>
      <div class="px-4 py-8 mx-auto max-w-screen-md">
        <Header user={props.data?.user ?? null} />
        {props.data ? <SignedIn {...props.data} /> : <SignedOut />}
        <footer class="bg-gray-100 py-6 mt-12 text-sm text-gray-700">
          <div class="px-4 mx-auto max-w-screen-md flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4">
            <div class="hidden sm:block">
              <img
                src="/bear-walking.svg"
                alt=""
                role="presentation"
                class="h-12 w-12"
              />
            </div>
            <div class="flex items-center justify-center sm:flex-grow sm:justify-center gap-2">
              <img
                src="/bear-walking.svg"
                alt=""
                role="presentation"
                class="h-12 w-12 sm:hidden"
              />
              <span class="text-center">
                &copy; {new Date().getFullYear()} Rock, Paper, Scissors!
              </span>
            </div>
            <div>
              <ShareButton
                title="Share the App!"
                text="Come play Rock, Paper, Scissors with me!"
                url={props.data?.appUrl || ""}
              />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function SignedIn(props: SignedInData) {
  const otherUsers = props.users.filter((u) => u.id != props.user.id);

  return (
    <>
      <LiveGamesSection
        user={props.user}
        initialGames={props.games}
        allGamesForStats={props.allGamesForStats}
      />
      <p class="my-6">
        Challenge someone to a game of Rock, Paper Scissors. Just enter their
        GitHub username in the box below and click "Start Game".
      </p>
      <form action="/start" method="POST">
        <input
          type="text"
          name="opponent"
          placeholder="@johnsmith"
          class="w-full px-4 py-2 border border-gray-300 rounded-md flex-1"
          required
        />
        <Button type="submit" class="mt-4">
          Invite
        </Button>
      </form>

      <p class="my-6">
        Or, challenge one of these users:
      </p>
      <ul class="my-6">
        {otherUsers.map((u) => <UserListItem key={u.id} user={u} />)}
      </ul>
    </>
  );
}

function UserListItem(props: { user: User }) {
  const startPath = `/start?opponent=${props.user.login}`;

  return (
    <li class="flex items-center">
      <img
        class="w-8 h-8 mr-2 rounded-full"
        src={props.user.avatarUrl}
        alt={props.user.login}
      />
      <UserNameVertical class="flex-1" user={props.user} />
      {/* The form method is POST, action is the path */}
      <form action={startPath} method="POST">
        {
          /*
          Instead of ButtonLink (which is an <a> tag) with JS onclick,
          use a regular <button type="submit">.
          This button will automatically submit the parent form via POST to its action.
        */
        }
        <button
          type="submit" // THIS IS THE KEY: Makes the button submit the form
          class="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded my-2 block" // Apply your existing styling here
        >
          Start Game
        </button>
      </form>
    </li>
  );
}

function SignedOut() {
  return (
    <>
      <p class="my-6">
        Welcome to the Rock, Paper, Scissors game! You can log in with your
        GitHub account below to challenge others to a game of Rock, Paper,
        Scissors.
      </p>
      <p class="my-6">
        <ButtonLink href="/auth/signin">
          Log in with GitHub
        </ButtonLink>
      </p>
    </>
  );
}
