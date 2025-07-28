# Rock, Paper, Scissors!

[![Made with Fresh](https://fresh.deno.dev/fresh-badge.svg)](https://fresh.deno.dev)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

This is a global, real-time multiplayer Rock, Paper, Scissors game written in
Deno. It persists game states in a Deno KV store, and synchronizes game state
between clients using the `watch()` feature of Deno KV.

## Features

- Real-time multiplayer game
- Persistent game state and coordination using Deno KV
- Uses GitHub OAuth for authentication
- Hosted with Deno Deploy

## Example

You can try out the game at https://rps-3000.deno.dev

## Development

To develop locally, you must create a GitHub OAuth application and set the
following environment variables in a `.env` file:

```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

You can create a GitHub OAuth application at
https://github.com/settings/applications/new. Set the callback URL to
`http://localhost:8000/auth/oauth2callback`.

You can then start the local development server:

```
deno task start
```
