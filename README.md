# AI Interview Platform

<p align="center">
  <img src="./dashboard-page.png" alt="AI Interview Platform dashboard" width="920"/>
</p>

<p align="center">
  <b>Crack your next interview with AI</b> — live AI mock interviews, a 150-problem coding arena,
  an AI Learn Hub, a proctored Weekly Test and an ATS resume analyzer.
</p>

Full-stack placement-prep platform. React + Vite frontend, Spring Boot backend, OpenRouter AI for the interview engine.

---

## What it does

**🎤 Live AI mock interviews** — Pick a role (Java Full Stack, Backend, Frontend, AI/ML, DevOps, Data Analyst, Product Manager…), experience level, difficulty and focus topics; get voiced AI questions, answer by voice or text, and get an AI-generated score, strengths/weaknesses and an action plan. Full per-session reports are stored for review.

**💻 Coding Round** — 150 curated DSA problems across 30+ topics with difficulty filters. Monaco editor in **Java, Python, JavaScript, C and C++**. Problems ship with visible sample cases and hidden grading cases (up to 60). Code is wrapped in method-only stubs with an auto-generated I/O bridge (you write `public String solve(String input)` semantics, the bridge handles stdin/stdout, C memory, Python lists etc.). One-click **Run** for the samples, **Submit** for the full suite. Built-in AI tools: explain, debug, hints, complexity analysis.

**📚 Learn Hub** — Ask anything ("Explain B-Trees with a Java example") and get an interview-ready lesson in seconds. Voice input, chat-style tutor, quick-topic prompts.

**🏆 Weekly Test** — A timed, proctored coding contest: 3 coding questions (you choose each one's difficulty) + 15 MCQs, webcam presence proctoring (face-api, tiny-face model) and tab-switch auto-submission. Results are stored with per-question scoring.

**📄 Resume Analyzer** — Drop your resume (PDF), get an ATS score, keyword gaps, HR feedback and concrete rewrite suggestions.

**📊 Dashboard & Reports** — Solved counts, average score, daily streak, weekly progress, per-session AI interview reports (score, strengths, weaknesses, recommendations).

## Screenshots

| Dashboard | Coding Round (Two Sum in the judge) | AI Interview |
|---|---|---|
| ![Dashboard](./dashboard-page.png) | ![Coding Round](./coding-page.png) | ![AI Interview](./interview-page.png) |

| Interview Setup | Interview Report | Learn Hub |
|---|---|---|
| ![Interview Setup](./interview-setup.png) | ![Interview Report](./interview-report.png) | ![Learn Hub](./learn-page.png) |

| Weekly Test | Resume Analyzer | Reports |
|---|---|---|
| ![Weekly Test](./weeklytest-page.png) | ![Resume Analyzer](./resume_analyzer-page.png) | ![Reports](./reports-page.png) |

| Sign in | Create account | Problem preview |
|---|---|---|
| ![Sign in](./login-page.png) | ![Create account](./register-page.png) | ![Two Sum preview](./coding-preview.png) |

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19 · Vite 8 · Monaco Editor · Axios · React Router 7 · Recharts · Framer Motion · Bootstrap 5 · face-api |
| Backend | Java 22 · Spring Boot 3.5 · Spring Security + JWT · Spring Data JPA · H2 (file-based) |
| AI | OpenRouter API (`OPENROUTER_API_KEY`) |
| Build | Maven (`./mvnw`) · npm |

## Project structure

```
.
├── src/                  # React frontend (pages, components, data, services)
│   ├── pages/            # Dashboard, Coding, Learn, WeeklyTest, Interview…
│   ├── components/       # EditorPanel (Monaco + C/C++/Java/Python bridges) …
│   ├── data/             # questions.js, testCases.js, mcqBank.js, learnTopics.js
│   └── hooks/            # useVoiceAssistant
├── backend/              # Spring Boot API
│   └── src/main/java/com/aiml/interviewplatform/
│       ├── controller/   # Auth, Gemini, Submission, Learn, WeeklyTest …
│       ├── service/      # GeminiService, OfflineCodeService, DashboardService …
│       └── dto/ entity/ repository/
├── *.png                 # Screenshots used in this README
└── README.md
```

## Quick start

### Backend (port 8080)

```bash
cd backend
./mvnw spring-boot:run          # or mvnw.cmd on Windows
```

Environment variables:

| Variable | Purpose | Default |
|---|---|---|
| `OPENROUTER_API_KEY` | Required for ALL AI features (interview, learn, resume, hints) | `YOUR_OPENROUTER_API_KEY` (placeholder — set it!) |
| `JWT_SECRET` | JWT signing secret | built-in dev secret |

H2 file database is created automatically at `backend/data/interviewdb` on first run.

### Frontend (port 8000 — configured in `vite.config.js`)

```bash
npm install
npm run dev
```

Open http://localhost:8000, click **Create one free**, register, and start practicing. The dev server proxies `/api` → `http://localhost:8080` (see `vite.config.js`); set `VITE_API_URL` to override the API origin.

> Without `OPENROUTER_API_KEY`, the app still runs fully — code execution/grading work offline; every AI feature is disabled gracefully (or the interview falls back to voice-only/offline mode). Set the key to unlock the whole thing.

## Deploying for free (₹0, no card needed)

Stack: **Vercel** (frontend) + **Render** (backend) + **Neon** (Postgres). Everything stays on GitHub's free tiers with GitHub sign-in.

### 1. Database — Neon
1. https://neon.tech → Sign up with GitHub (free, no card).
2. Create a project, e.g. `interview-platform`.
3. From the connection string build the JDBC URL for step 2:
   `jdbc:postgresql://<host>/<dbname>?sslmode=require` → `DATABASE_URL`
4. Copy the username/password → `DB_USERNAME` / `DB_PASSWORD`.

### 2. Backend — Render
1. https://render.com → Sign up with GitHub.
2. New → Web Service → connect this repository.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `./mvnw -DskipTests package`
   - **Start Command:** `java -jar target/interviewplatform-0.0.1-SNAPSHOT.jar`
   - **Instance Type:** Free
4. Environment variables:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `DATABASE_URL=jdbc:postgresql://<host>/<dbname>?sslmode=require`
   - `DB_USERNAME=...`
   - `DB_PASSWORD=...`
   - `JWT_SECRET=<random 32+ characters>`
   - `OPENROUTER_API_KEY=<your key>`
5. Deploy. Your API will live at `https://<app>.onrender.com` (note: free instances sleep after ~15 min; first request after a break takes ~30–50 s).

### 3. Frontend — Vercel
1. https://vercel.com → Sign up with GitHub.
2. Add New → Project → import this repository (framework preset: **Vite**, no env vars required).
3. Edit `vercel.json` — replace `CHANGEME-YOUR-RENDER-APP` with your actual Render app name, commit and push.
4. Redeploy. Your app is live at `https://<project>.vercel.app`.

### Security notes
- Real secrets never go in the repo — local `application.properties` uses placeholders; production values come from environment variables via `application-prod.properties`.
- **Rotate your OpenRouter key before going live** — the old key appeared in plain text in the project history.
- Local `application.properties` uses H2 with an insecure dev-only JWT default; production must set `JWT_SECRET`.

## Notes

- `backend/data/` (runtime H2 files, user data) is intentionally **not tracked** in this repository — clone and run to create your own.
- The interview room accepts voice answers when a microphone is present; otherwise it falls back to text.
- Weekly Test proctoring requires a webcam and a modern Chromium-based browser.
