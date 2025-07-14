import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { State } from "🛠️/types.ts";

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const url = new URL(req.url);
  console.log("[Middleware] Request URL Path:", url.pathname);
  if (url.pathname === "") {
    console.log("[Middleware] Skipping session parsing for root path.");
    return await ctx.next();

  };
  const cookies = getCookies(req.headers);
  const sessionCookieValue = cookies.session;
  console.log("[Middleware] Raw 'session' cookie value from request headers:", sessionCookieValue);
  ctx.state.session = cookies.session;
  console.log("[Middleware] ctx.state.session after assignment:", ctx.state.session);
  const resp = await ctx.next();
  return resp;
}
