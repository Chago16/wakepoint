# WakePoint

WakePoint is a mobile app for planning trips, saving routes, and setting route-aware alarms. It includes a React Native (Expo + TypeScript) frontend and a lightweight Node.js backend for user, route, and trip management.

## Key Features

- Plan and save routes
- Set alarms tied to route checkpoints
- View trip history and manage saved routes
- Map integration (Mapbox)

## Tech Stack

- Frontend: Expo, React Native, TypeScript
- Backend: Node.js, Express
- Maps: Mapbox

## Repo Structure (top-level)

- `app/` — Expo app source (screens, routes, components)
- `backend/` — Node/Express API server and controllers
- `components/`, `ui/` — Shared UI components used by the app
- `utils/`, `hooks/`, `constants/` — Helper utilities, hooks, and constants

## Prerequisites

- Node.js (16+ recommended)
- npm or Yarn
- Expo CLI (optional, for local Expo tooling)
- Mapbox access token (if running map features)

## Quick Start — Development

1. Install dependencies

```bash
npm install
cd backend && npm install
```

2. Configure env variables

Create a file named `.env` in the project root (or set environment variables) with at least:

```
MAPBOX_ACCESS_TOKEN=your_mapbox_token
BACKEND_URL=http://localhost:3000
```

3. Start the backend server

```bash
node backend/server.js
# or if backend has a script: npm run dev --prefix backend
```

4. Start the Expo app

```bash
npm start
# or: expo start
```

Open the app in the Expo Go app or an emulator.

## Backend Notes

- The backend lives in the `backend/` folder and exposes REST endpoints for authentication, saved routes, trip history, and Mapbox-related helpers. Check `backend/server.js` and the `controllers/` folder for routes and implementation.

## Development Tips

- Use the simulator or Expo Go for quick iteration.
- When changing native-like behavior, test on physical devices where possible.
- If Mapbox features fail, verify `MAPBOX_ACCESS_TOKEN` and `BACKEND_URL` are correct.

## Contributing

Please open issues or pull requests for bug fixes, feature suggestions, or documentation updates. When submitting code changes, include a short description and steps to reproduce if applicable.

## License

This project is provided under the terms in `LICENSE`.

---

If you'd like, I can also add more detailed setup instructions, a sample `.env.example`, or expand the Features section with screenshots and API docs. Which would you prefer next?
