import { User } from "🛠️/types.ts";

export function UserNameHorizontal(props: { class?: string; user: User }) {
  return (
    <span class={props.class}>
      <span class="font-semibold">
        {`@${props.user.login}`}
      </span>
    </span>
  );
}
