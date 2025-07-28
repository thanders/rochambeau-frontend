import { User } from "🛠️/types.ts";
import { UserNameHorizontal } from "./User.tsx";
import { tw } from "twind"; // Assuming twind is used for styling
import { Button } from "./Button.tsx";

export function Header(props: { user: User | null }) {
  return (
    <header>
      <div class={tw`flex justify-between items-center`}>
        {/* Added a link around the title to go back to the root page */}
        <a href="/" class={tw`no-underline text-current`}>
          {/* text-current prevents link color change */}
          <h1 class={tw`text-4xl font-bold`}>Rock, Paper, Scissors!</h1>
        </a>
      </div>

      <nav class={tw`flex items-center justify-between`}>
        {props.user
          ? (
            <>
              <p class={tw`text-sm text-gray-600`}>
                Logged in as <UserNameHorizontal user={props.user} />
              </p>
              <Button variant="primary" href="/auth/signout">
                Logout
              </Button>
            </>
          )
          : (
            <>
              <p class={tw`text-sm text-gray-600`}>
                Anonymous user
              </p>
              <Button variant="primary" href="/auth/signin">
                Login
              </Button>
            </>
          )}
      </nav>
    </header>
  );
}
