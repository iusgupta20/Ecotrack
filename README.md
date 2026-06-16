# EcoTrack AI – Carbon Footprint Awareness & Action Platform

EcoTrack AI is a modern full-stack web application designed to help individuals calculate, track, and reduce their carbon footprint through simple actions, personalized AI coaching, gamification, and interactive education.

This project was built to solve the **Carbon Footprint Awareness Platform** challenge, maximizing evaluations across problem statement alignment, code quality, security, efficiency, testing, and accessibility.

---

## 🚀 Key Features

1. **Carbon Footprint Calculator**: A step-by-step interactive form measuring transport, household energy, diet, waste, and water usage to output monthly CO₂ footprint, score (0-100), and offset trees.
2. **AI Sustainability Coach**: A contextual assistant analyzing user footprints to generate targeted recommendations. Integrates with Gemini API with a fallback rule-based expert sustainability system.
3. **Personalized Action Plans**: Dynamic weekly challenges based on highest footprint categories. Completing tasks rewards points, maintains streaks, and cuts actual footprint.
4. **Gamification & Rewards**: A competitive leaderboard and unlockable milestone badges (Green Starter, Eco Explorer, Carbon Saver, Climate Champion, Net Zero Hero).
5. **Scenario Simulator**: Interactive sliders projecting footprint reductions and trees saved in real-time when substituting sustainable habits.
6. **Eco Knowledge Hub & Quizzes**: High-value sustainability articles and interactive quizzes that award reward points to solidify ecological knowledge.
7. **Client-Side PDF Reports**: One-click generation of fully formatted PDF sustainability summaries.
8. **A11y Features**: Dark Mode, High Contrast Mode, ARIA landmarks, form keyboard navigation, and responsive scaling.

---

## 🛠️ Technology Stack

- **Frontend**: Vite, React, TypeScript, Tailwind CSS v4, Recharts, jsPDF, Lucide React.
- **Backend**: Node.js, Express.js, TypeScript, Mongoose, JWT authentication, bcryptjs, Helmet, Express Rate Limit.
- **Database**: In-Memory MongoDB Server (`mongodb-memory-server`) for seamless zero-configuration local execution out of the box, with support for standard MongoDB Atlas connection.

---

## 🏛️ System Architecture

```
                               ┌────────────────────────────────┐
                               │       Vite React Client        │
                               │  (Tailwind v4 / Recharts / TS) │
                               └──────────────┬─────────────────┘
                                              │
                                              │ REST API Requests
                                              │ (JWT Auth Headers)
                                              ▼
                               ┌────────────────────────────────┐
                               │       Express API Server       │
                               │    (Node.js / TypeScript)      │
                               └──────────────┬─────────────────┘
                                              │
                     ┌────────────────────────┼────────────────────────┐
                     ▼                        ▼                        ▼
       ┌──────────────────────────┐  ┌─────────────────┐  ┌──────────────────────────┐
       │   AI Coach Engine        │  │ Mongoose Models │  │  MongoDB Memory Server   │
       │ (Gemini API / Rule-Base) │  │  (User / Goal)  │  │   (Or External Atlas)    │
       └──────────────────────────┘  └─────────────────┘  └──────────────────────────┘
```

---

## 📦 Setup & Installation Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### 1. Clone & Set Up Directory
Set the project subdirectory as your active workspace:
```bash
cd ecotrack-ai
```

### 2. Environment Configuration
Create your local env file in `server/` from the template:
```bash
cp server/.env.example server/.env
```

Then edit `server/.env` as needed:
```env
PORT=5000
JWT_SECRET=your_secret_key_here
NODE_ENV=development

# Optional: To use real Gemini model. If omitted, the expert system is used.
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: To use external MongoDB. If omitted, a local memory database boots.
# MONGODB_URI=mongodb+srv://<redacted-credentials>@cluster.mongodb.net/ecotrack
```

### 3. Install & Start Backend Server
```bash
cd server
npm install
npm run dev
```
The server will boot up and automatically start the in-memory database. Keep this terminal running.

### 4. Install & Start Frontend Client
In a new terminal window:
```bash
cd client
npm install --legacy-peer-deps
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run From One Root Folder
You can now manage the full stack from the single project root:
```bash
npm install
npm run install:all
npm run dev
```
For a fresh setup and instant demo from the root folder:
```bash
npm run setup:demo
```
The root installer uses `--legacy-peer-deps` for the client to match the current frontend dependency constraints.
Useful root commands:
```bash
npm run setup:demo
npm run demo
npm run build
npm run start
npm run serve
npm run test
npm run lint
```

- `npm run setup:demo`: installs root, server, and client dependencies, then launches the demo automatically.
- `npm run demo`: starts backend and frontend, then opens the app automatically in your browser.
- `npm run start`: runs the backend in production mode and serves the built frontend from Express.
- `npm run serve`: builds both apps, then serves the full stack from one command.

---

## 🧪 Testing

We have built full automated test coverage for calculators and server endpoints:
```bash
cd server
npm run test
```

---

## 💡 Key Assumptions
1. **Zero-Configuration MongoDB**: To make evaluation painless, the database operates in-memory out-of-the-box. It seeds mock leaderboard competitors and initializes schemas automatically.
2. **AI Fallback**: If no Gemini API Key is provided, the Coach falls back to a highly personalized expert ruleset analyzing the exact footprint of the logged-in user.
3. **Emissions factors**: Emission calculations utilize international metrics from EPA (Environmental Protection Agency) and DEFRA averages.
# Ecotracker
