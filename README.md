# 🌿 WildArc Arbor

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

Tree management for regenerative permaculture farms: map every tree, record its health and the work it needs, and see the whole farm at a glance. Arbor is the first module of WildArc, an open-source platform for digitizing a farm's ecological intelligence.

This repository holds the Arbor app: the API, the web client and the database migrations. It was split out of [yozo06/tms](https://github.com/yozo06/tms) in November 2026 and keeps that repository's history.

📖 **[The long-term WildArc vision and module roadmap live in the tms repository](https://github.com/yozo06/tms/blob/main/docs/vision/00_OVERVIEW.md)**

![Dashboard Preview](./frontend/public/icons/icon-512.png) 

## Features

- **Dashboard Analytics**: Real-time summary counts, progress metrics, and urgent tree highlights (rendered dynamically backend-side).
- **Interactive Map Picker**: Visually place trees on a designated canvas to automatically populate X/Y coordinates during addition.
- **Tree Lifecycle Tracking**: Track trees from 'pending' addition, through active actions ('cut', 'trim', 'treat', 'monitor'), to 'completed'.
- **Health & Activity Logs**: Comprehensive timestamped logs for observations, health scores, and manual interventions per tree.
- **Employee & Role Management**: Secure role-based access control (`owner` vs `employee`). Owners can re-assign workloads and manage the team.
- **Progressive Web App (PWA)**: Built with offline-first capabilities utilizing Workbox caching for seamless field use on mobile devices with spotty internet.
- **Google Drive Integration**: Automated upload of tree photos and media to a secure, organized Google Drive structure.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Zustand (state management), React Router.
- **Backend**: Node.js, Express, TypeScript.
- **Database & Auth**: Supabase (PostgreSQL + JWT Authentication).
- **Hosting / Deployment**: Configured as a Unified App (the Node backend serves the static built React frontend for easy centralized deployment).

## Local Development Initialization

1. **Prerequisites**: Ensure you have Node.js 20 installed, the version CI uses.
2. **Install Dependencies**:
   ```bash
   npm install              # Installs backend dependencies
   cd frontend && npm install # Installs frontend dependencies
   cd ..
   ```
3. **Environment Setup**: 
   Create a `.env` file in the root directory mirroring `.env.example`. You will need your Supabase API keys, DB URL, and Google Service Account credentials.
4. **Run Application**:
   ```bash
   npm run dev
   ```
   *The backend runs securely on port `3000` and the frontend runs on port `5173`. The Vite proxy ensures seamless API communication.*

## Deployment 

This application is configured for unified deployment (e.g., Render.com, Railway, Heroku).

1. Push this repository to GitHub.
2. Connect your repository to your hosting provider as a standard **Node.js Web Service**.
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`
5. Inject all necessary environment variables (from your `.env` file) into the hosting provider's dashboard.

*The build command will automatically trigger a compilation of the React frontend into `frontend/dist` and transpile the Express backend into `dist`. The Express server will then statically serve your frontend application.*
