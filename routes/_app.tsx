import { PageProps } from "$fresh/server.ts";
import { ToastProvider } from "../islands/Snackbar.tsx";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Rock, Paper, Scissors!</title>
        <meta
          name="description"
          content="Play Rock, Paper, Scissors online with style!"
        />
      </head>
      <body>
        <ToastProvider>
          <Component />
        </ToastProvider>
      </body>
    </html>
  );
}
