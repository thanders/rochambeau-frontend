import { Button } from "./Button.tsx";

export function PlayRequestCard(
  props: { url: string; login: string; avatarUrl: string; text?: string },
) {
  return (
    <div class="flex items-center justify-between gap-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-blue-900 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700">
      <div class="flex items-center gap-4 flex-1">
        <img
          src={props.avatarUrl}
          alt={`${props.login}'s avatar`}
          class="w-10 h-10 rounded-full border border-yellow-300"
        />
        <span>
          <strong>@{props.login}</strong> {props.text}
        </span>
      </div>

      <form action={props.url} method="POST">
        <Button type="submit" class="my-2 block">
          Start Game
        </Button>
      </form>
    </div>
  );
}
