# Moborr.io

Frontend for Moborr.io, a multiplayer FPS game in development.

## Run locally

1. Start the backend server from the MoborrBackend repository.
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_GAME_SERVER_URL=ws://localhost:3001` in `.env.local`.
4. Run `npm install` and `npm run dev`.

The browser connects to the game server automatically. Playing is disabled until the WebSocket server is connected. Movement and firing controls are WASD/arrow keys and the left mouse button.

## Netlify

Set `VITE_GAME_SERVER_URL` in the Netlify site environment variables to the Render WebSocket URL, using `wss://`. Rebuild/redeploy the site after changing it. The backend's `ALLOWED_ORIGINS` must include the exact Netlify site origin.
