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
  console.log("set 0auth_session");
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
  console.log("RESULT USER", res);
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
  const mockSessionId = `mock_session_${user.id}_${Date.now()}_${
    Math.random().toString(36).substring(2, 9)
  }`; // More robust ID

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
  const now = new Date().getTime();
  const res = await ao
    .set(["games", game.id], game)
    .set(["games_by_user", game.initiator.id, game.id], game)
    .set(["games_by_user", game.opponent.id, game.id], game)
    .set(["games_by_user_updated", game.initiator.id], now)
    .set(["games_by_user_updated", game.opponent.id], now)
    .commit();
  return res.ok;
}

export async function listPreviouslyPlayedUsers(
  currentUserId: string,
): Promise<User[]> {
  const previouslyPlayedUsers: Record<string, User> = {}; // Use a record to store unique users
  const iter = kv.list<Game>({ prefix: ["games_by_user", currentUserId] });

  for await (const { value: game } of iter) {
    // We are looking for games where the current user played, and the game is finished.
    if (game.state === "finished") {
      // Determine the other player in this finished game
      const otherPlayer = game.initiator.id === currentUserId
        ? game.opponent
        : game.initiator;

      // Add the other player to our unique list
      previouslyPlayedUsers[otherPlayer.id] = otherPlayer;
    }
  }
  // Convert the record of unique users back to an array
  return Object.values(previouslyPlayedUsers);
}

export async function listGamesByPlayer(userId: string): Promise<Game[]> {
  const games: Game[] = [];
  const iter = kv.list<Game>({ prefix: ["games_by_user", userId] });
  for await (const { value } of iter) {
    if (value.state === "in_progress") games.push(value);
  }
  return games;
}

export async function getAllGamesByPlayerForStats(
  userId: string,
): Promise<Game[]> {
  const games: Game[] = [];
  const iter = kv.list<Game>({ prefix: ["games_by_user", userId] });
  for await (const { value } of iter) {
    games.push(value);
  }
  return games;
}

export async function getGame(id: string): Promise<Game | null> {
  const responseGame = await kv.get<Game>(["games", id]);
  if (!responseGame) return null;
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
      try {
        const x = await reader.read();
        if (x.done) {
          console.log(
            "subscribeGame: Subscription stream closed (from x.done)",
          );
          return;
        }

        for (const entry of x.value) {
          if (entry.value !== null) {
            cb(entry.value as Game);
          } else {
            console.log(`Key ["games", "${id}"] was deleted or became null.`);
            // You might even want a specific callback for deletion: cb(null);
          }
        }
      } catch (error) {
        console.error(
          `[subscribeGame ERROR] Stream encountered an error for game ${id}:`,
          error,
        );
        break; // Stop the loop on error
      }
    }
  })();

  return () => {
    reader.cancel();
  };
}

type UnsubscribeFunction = () => void;

export function subscribeGamesByPlayer(
  userId: string,
  cb: (list: Game[]) => void,
): UnsubscribeFunction {
  const stream = kv.watch([["games_by_user_updated", userId]]);
  const reader = stream.getReader();

  (async () => {
    while (true) {
      try {
        const x = await reader.read();
        if (x.done) {
          console.log(
            "subscribeGamesByPlayer: Subscription stream closed (from x.done)",
          );
          return;
        }

        // It's good practice to also ensure x.value is not empty for KvEntry[]
        // Though for a single key watch, it should usually have one entry on change.
        if (x.value && x.value.length > 0) {
          // No need to check x.value[0].value here since it's just a boolean flag.
          // But if there were multiple keys watched, you'd iterate.
        }

        const games = await listGamesByPlayer(userId);
        cb(games);
      } catch (error) {
        console.error(
          `[subscribeGamesByPlayer ERROR] Stream encountered an error for user ${userId}:`,
          error,
        );
        // Decide how to handle this:
        // - You might want to break the loop to stop trying to read from a broken stream.
        // - Or re-throw if you want the outer stream to also propagate the error.
        // For a background watcher, breaking is often fine.
        break; // Stop the loop on error
      }
    }
  })();

  return () => {
    reader.cancel();
  };
}
