import { Handlers } from "$fresh/server.ts";
import { addMockUserOnlineTest } from "🛠️/db.ts";
import { User } from "🛠️/types.ts";

export const handler: Handlers = {
  async GET(_req) {
    const mockUser: User = {
      id: "mock-user-id-steve",
      login: "mockuser-steve",
      avatarUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
      name: "Steve",
    };

    const mockSessionId = await addMockUserOnlineTest(mockUser);

    return new Response(
      `✅ Mock user "${mockUser.login}" added and marked as online.\n\n` +
        `Use this session ID in Postman 'Cookie' header: session=${mockSessionId}`, // <-- It's added here!
      { status: 200 },
    );
  },
};
