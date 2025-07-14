import { Game, OauthSession, User } from "./types.ts";

const kv = await Deno.openKv();

export async function getAndDeleteOauthSession(
  session: string,
): Promise<OauthSession | null> {
  const res = await kv.get<OauthSession>(["oauth_sessions", session]);
  if (res.versionstamp === null) return null;
  await kv.delete(["oauth_sessions", session]);
  return res.value;
}

export async function setOauthSession(session: string, value: OauthSession) {
  console.log("set 0auth_session", session, value)
  await kv.set(["oauth_sessions", session], value);
}

export async function setUserWithSession(user: User, session: string) {
  await kv.atomic()
    .set(["users", user.id], user)
    .set(["users_by_login", user.login], user)
    .set(["users_by_session", session], user)
    .set(["users_by_last_signin", new Date().toISOString(), user.id], user)
    .commit();
}

export async function getUserBySession(session: string) {
  const res = await kv.get<User>(["users_by_session", session]);
  return res.value;
}

export async function getUserById(id: string) {
  const res = await kv.get<User>(["users", id]);
  return res.value;
}

export async function getUserByLogin(login: string) {
  const res = await kv.get<User>(["users_by_login", login]);
  return res.value;
}

export async function deleteSession(session: string) {
  await kv.delete(["users_by_session", session]);
}

export async function listRecentlySignedInUsers(): Promise<User[]> {
  const users = [];
  const iter = kv.list<User>({ prefix: ["users_by_last_signin"] }, {
    limit: 10,
    reverse: true,
  });
  for await (const { value } of iter) {
    users.push(value);
  }
  return users;
}

export async function addMockUserOnline(user: User) {
  const now = new Date().toISOString();
  await kv.atomic()
    .set(["users", user.id], user)
    .set(["users_by_login", user.login], user)
    .set(["users_by_last_signin", now, user.id], user)
    .commit();
}

export async function addMockUserOnlineTest(user: User) {
  const now = new Date().toISOString();
  // Generate a unique session ID for this mock user
  const mockSessionId = `mock_session_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`; // More robust ID

  await kv.atomic()
    .set(["users", user.id], user) // Store the user object by its ID
    .set(["users_by_login", user.login], user) // Store user by login
    .set(["users_by_last_signin", now, user.id], user) // Track last sign-in
    // CRUCIAL: Store the mapping from the mockSessionId to the user object
    .set(["users_by_session", mockSessionId], user)
    .commit();

  // Return the generated mock session ID
  return mockSessionId;
}

export async function setGame(game: Game, versionstamp?: string) {
  const ao = kv.atomic();
  if (versionstamp) {
    ao.check({ key: ["games", game.id], versionstamp });
  }
  const res = await ao
    .set(["games", game.id], game)
    .set(["games_by_user", game.initiator.id, game.id], game)
    .set(["games_by_user", game.opponent.id, game.id], game)
    .set(["games_by_user_updated", game.initiator.id], true)
    .set(["games_by_user_updated", game.opponent.id], true)
    .commit();
  return res.ok;
}

export async function listGamesByPlayer(userId: string): Promise<Game[]> {
  const games: Game[] = [];
  const iter = kv.list<Game>({ prefix: ["games_by_user", userId] });
  for await (const { value } of iter) {
    if (value.state === "in_progress") { games.push(value); } 
  }
  return games;
}

export async function getAllGamesByPlayerForStats(userId: string): Promise<Game[]> {
  const games: Game[] = [];
  const iter = kv.list<Game>({ prefix: ["games_by_user", userId] });
  for await (const { value } of iter) {
    games.push(value);
  }
  return games;
}

export async function getGame(id: string): Promise<Game | null> {
  const responseGame = await kv.get<Game>(["games", id]);
  if(!responseGame) return null;
  return responseGame.value;
}

export async function getGameWithVersionstamp(id: string) {
  const res = await kv.get<Game>(["games", id]);
  if (res.versionstamp === null) return null;
  return [res.value, res.versionstamp] as const;
}

export function subscribeGame(
  id: string,
  cb: (game: Game) => void,
): () => void {
  const stream = kv.watch([["games", id]]);
  const reader = stream.getReader();

  (async () => {
    while (true) {
      const x = await reader.read();
      if (x.done) {
        console.log("subscribeGame: Subscription stream closed");
        return;
      }

      const [game] = x.value!;
      if (game.value) {
        cb(game.value as Game);
      }
    }
  })();

  return () => {
    reader.cancel();
  };
}

export function subscribeGamesByPlayer(
  userId: string,
  cb: (list: Game[]) => void,
) {
  const stream = kv.watch([["games_by_user_updated", userId]]);
  const reader = stream.getReader();

  (async () => {
    while (true) {
      const x = await reader.read();
      if (x.done) {
        console.log("subscribeGamesByPlayer: Subscription stream closed");
        return;
      }

      const games = await listGamesByPlayer(userId);
      cb(games);
    }
  })();

  return () => {
    reader.cancel();
  };
}
