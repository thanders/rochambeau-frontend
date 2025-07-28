import { useEffect, useState } from "preact/hooks";
import { getParsedLocalStorage } from "🛠️/getParsedLocalStorage.ts";
import { Button } from "../components/Button.tsx";
import { User } from "🛠️/types.ts";
import { trackEvent } from "🛠️/trackEvent.ts";

export function PlayRequestCardNew(
  props: {
    url: string;
    text?: string;
    gameParam?: string;
    challengedBy?: string;
  },
) {
  const [stored, setStored] = useState<User | null>(null);

  useEffect(() => {
    if (props.gameParam) {
      localStorage.removeItem("challengedBy");
    }

    const parsed = getParsedLocalStorage<User>("challengedBy");
    setStored(parsed);
  }, [props.gameParam]);

  if (!stored) return null;

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    console.log("Form submitted!");

    trackEvent({
      event: "game_invite_joined",
      challengedBy: stored?.login,
    });

    setTimeout(() => {
      const form = event.target as HTMLFormElement | null;
      form?.submit();
    }, 100);
  }

  return (
    <div class="flex items-center justify-between gap-4 px-3 py-2 bg-blue-100 border border-blue-300 rounded text-blue-900 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700">
      <div class="flex items-center gap-4 flex-1">
        <img
          src={stored.avatarUrl}
          alt={`${stored.login}'s avatar`}
          class="w-10 h-10 rounded-full border border-yellow-300"
        />
        <span>
          <strong>@{stored.login}</strong> {props.text}
        </span>
      </div>

      <form action={props.url} method="POST" onSubmit={handleSubmit}>
        <Button type="submit" class="my-2 block">
          Start Game
        </Button>
      </form>
    </div>
  );
}
