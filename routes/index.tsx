import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import { Game, State, User } from "🛠️/types.ts";
import {
  getAllGamesByPlayerForStats,
  getUserByLogin,
  getUserBySession,
  listGamesByPlayer,
  listPreviouslyPlayedUsers,
} from "🛠️/db.ts";

import { Button } from "🧱/Button.tsx";
import { Header } from "🧱/Header.tsx";

import LiveGamesSection from "🏝️/LiveGamesSection.tsx";
import { validateGameParam } from "🛠️/validate.ts";
import GameToast from "🏝️/GameToast.tsx";
import Footer from "🧱/Footer.tsx";
import { PlayRequestCard } from "../components/PlayRequestCard.tsx";
import SaveToLocalStorage from "🏝️/SaveToLocalStorage.tsx";
import { PlayRequestCardNew } from "🏝️/PlayRequestCardNew.tsx";

type Data = SignedInData | null;

interface SignedInData {
  user: User | null;
  users: User[];
  games: Game[];
  allGamesForStats: Game[];
  appUrl: string;
  gameParam?: string;
  challengedBy?: User;
}

export async function handler(req: Request, ctx: HandlerContext<Data, State>) {
  const url = new URL(req.url);
  const rawChallengedByParam = url.searchParams.get("challengedBy");
  const challengedBy = rawChallengedByParam
    ? await getUserByLogin(rawChallengedByParam)
    : null;
  console.log("HELLO", challengedBy);

  const rawGameParam = url.searchParams.get("game");

  const gameParam = validateGameParam(rawGameParam);
  console.log("GAME PARAM EARLY ", rawGameParam);

  if (!ctx.state.session) {
    console.log("state session");
    return ctx.render({
      user: null,
      users: [],
      games: [],
      allGamesForStats: [],
      appUrl: new URL(req.url).origin,
      ...(challengedBy ? { challengedBy } : {}),
    });
  }

  const user = await getUserBySession(ctx.state.session);
  if (!user) return ctx.render(null);

  const [users, allGamesForStats, games] = await Promise.all([
    listPreviouslyPlayedUsers(user.id),
    getAllGamesByPlayerForStats(user.id),
    listGamesByPlayer(user.id),
  ]);

  const appUrl = new URL(req.url).origin;
  console.log("DEFAULT");
  return ctx.render({
    user,
    users,
    games,
    allGamesForStats,
    appUrl,
    ...(gameParam ? { gameParam } : {}),
    ...(challengedBy ? { challengedBy } : {}),
  });
}

export default function Home(props: PageProps<Data>) {
  const { data } = props;

  return (
    <>
      <Head>
        <title>Rock, Paper, Scissors!</title>
      </Head>
      <div class="px-4 py-8 mx-auto max-w-screen-md">
        <Header user={data?.user ?? null} />
        <main>
          {!data?.user
            ? <SignedOut challengedBy={data?.challengedBy} />
            : (
              <section>
                {data.gameParam && (
                  <GameToast gameParam={data.gameParam} user={data.user} />
                )}
                <SignedIn
                  user={data.user}
                  users={data.users}
                  games={data.games}
                  allGamesForStats={data.allGamesForStats}
                  appUrl={data.appUrl}
                  gameParam={data.gameParam}
                  challengedBy={data.challengedBy}
                />
              </section>
            )}
        </main>

        <Footer
          appUrl={data?.user?.login
            ? `${data.appUrl}/?challengedBy=${data.user.login}`
            : data?.appUrl || ""}
        />
      </div>
    </>
  );
}

function SignedIn(props: SignedInData) {
  const otherUsers = props.users.filter((u) => u.id != props.user?.id);
  const startPath = `/start?opponent=${props.challengedBy?.login}`;
  const challengedByAlreadyExists: boolean = otherUsers.some((user) =>
    user.id === props.challengedBy?.id
  );
  if (props.user) {
    return (
      <>
        <h2>Game Dashboard</h2>

        {props.challengedBy && !challengedByAlreadyExists && (
          <SaveToLocalStorage challengedBy={props.challengedBy} />
        )}
        <LiveGamesSection
          user={props.user}
          initialGames={props.games}
          allGamesForStats={props.allGamesForStats}
        />
        <PlayRequestCardNew
          url={startPath}
          text="has challenged you to a game of Rock, Paper, Scissors!"
          gameParam={props.gameParam}
          challengedBy={props.challengedBy?.login}
        />

        {otherUsers.length > 0 && (
          <>
            <h2>Play with friends</h2>
            <ul class="my-6">
              {otherUsers.map((u) => <UserListItem key={u.id} user={u} />)}
            </ul>
          </>
        )}
        <h2>Invite Friends</h2>
        <p class="my-6">
          Enter their GitHub username in the box below and click "Invite".
        </p>
        <form action="/start" method="POST">
          <label for="invite-user">GitHub Username</label>
          <input
            type="text"
            name="opponent"
            id="invite-user"
            placeholder="@johnsmith"
            class="w-full px-4 py-2 border border-gray-300 rounded-md flex-1"
            required
          />
          <Button type="submit" class="my-2 block">
            Invite
          </Button>
        </form>
      </>
    );
  }
  return null;
}

function UserListItem(props: { user: User }) {
  const startPath = `/start?opponent=${props.user.login}`;

  return (
    <li class="flex items-center">
      <PlayRequestCard
        url={startPath}
        login={props.user.login}
        avatarUrl={props.user.avatarUrl}
      />
    </li>
  );
}

function SignedOut(props: { challengedBy: User | undefined }) {
  const { challengedBy } = props;

  return (
    <>
      {challengedBy && <SaveToLocalStorage challengedBy={challengedBy} />}
      <h2>Sign In to Play</h2>
      <p class="my-6">
        Welcome to the Rock, Paper, Scissors game! You can log in with your
        GitHub account to challenge others to play.
      </p>
    </>
  );
}
