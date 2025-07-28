import { PageProps } from "$fresh/server.ts";
import { ToastProvider } from "🏝️/Snackbar.tsx";

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

        <script
          // deno-lint-ignore react-no-danger
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-5JJQ2SJ4');`,
          }}
        />
      </head>
      <body>
        <noscript
          // deno-lint-ignore react-no-danger
          dangerouslySetInnerHTML={{
            __html:
              `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5JJQ2SJ4"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
        <ToastProvider>
          <Component />
        </ToastProvider>
      </body>
    </html>
  );
}
