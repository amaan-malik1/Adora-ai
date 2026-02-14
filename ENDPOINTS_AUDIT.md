# API Endpoints Audit – Frontend ↔ Backend

**Backend base URL:** `https://adora-ai-backend.onrender.com`

All frontend calls use `apiInstance` (axios) with `baseURL` from `VITE_BASE_URL` (same URL above in production).

---

## 1. Endpoint mapping (must match)

| # | Method | Backend route | Full URL | Frontend usage | Auth | Response shape (success) |
|---|--------|----------------|----------|----------------|------|---------------------------|
| 1 | GET | `/api/user/credit` | `.../api/user/credit` | Navbar.tsx | Bearer | `{ credits: number }` |
| 2 | GET | `/api/user/projects` | `.../api/user/projects` | MyGeneration.tsx | Bearer | `{ success, projects: Project[] }` |
| 3 | GET | `/api/user/project/:projectId` | `.../api/user/project/{id}` | Result.tsx | Bearer | `{ project: Project }` |
| 4 | GET | `/api/user/publish/:projectId` | `.../api/user/publish/{id}` | ProjectCard.tsx (toggle publish) | Bearer | `{ isPublished: boolean }` |
| 5 | POST | `/api/project/create` | `.../api/project/create` | Generate.tsx | Bearer + FormData | `{ projectId: string }` |
| 6 | POST | `/api/project/video` | `.../api/project/video` | Result.tsx | Bearer + `{ projectId }` | `{ message, videoURL }` |
| 7 | GET | `/api/project/published-projects` | `.../api/project/published-projects` | Community.tsx | No | `{ projects: Project[] }` |
| 8 | DELETE | `/api/project/:projectId` | `.../api/project/{id}` | ProjectCard.tsx (delete) | Bearer | `{ success, message }` |
| 9 | POST | `/api/clerk` | `.../api/clerk` | Clerk Dashboard (webhook) | Webhook signature | `{ received: true }` |

---

## 2. Per-endpoint contract

### 1) GET /api/user/credit
- **Backend:** userController.getUserCredits → creates user in DB if missing (Clerk sync).
- **Frontend:** expects `data.credits` (number). Navbar shows "Credits: {credits}".
- **Status:** 200 + `{ credits }` | 401 no token | 500 server error.

### 2) GET /api/user/projects
- **Backend:** userController.getAllprojects → `where: { userId }`, returns `{ success, projects }`.
- **Frontend:** expects `data.projects` (array). MyGeneration maps to ProjectCard.
- **Status:** 201 + `{ success, projects }` | 401 | 500.

### 3) GET /api/user/project/:projectId
- **Backend:** userController.getProjectById → `where: { userId, id: projectId }`, returns `{ project }`.
- **Frontend:** expects `data.project`. Result page sets `setProjectsData(data.project)`, `setIsGenerating(project.isGenerating)`.
- **Status:** 201 + `{ project }` | 404 not found | 500.

### 4) GET /api/user/publish/:projectId
- **Backend:** userController.toggleProjectPublic → toggles `isPublished`, returns `{ isPublished }`.
- **Frontend:** expects `data.isPublished`. ProjectCard updates list with new `isPublished`.
- **Status:** 201 + `{ isPublished }` | 404 | 500.

### 5) POST /api/project/create
- **Backend:** projectController.createProject. Body: FormData (name, productName, productDescription, userPrompt, aspectRatio, targetLength, images[]). protectRoute + upload.array('images', 2).
- **Frontend:** POST formData to `/api/project/create` with Bearer. Expects `data.projectId`.
- **Status:** 201 + `{ projectId }` | 400/401/500.

### 6) POST /api/project/video
- **Backend:** projectController.createVideo. Body: JSON `{ projectId }`. protectRoute.
- **Frontend:** POST `{ projectId }` to `/api/project/video`. Expects `data.videoURL`, `data.message`.
- **Status:** 200 + `{ message, videoURL }` | 201 already generated | 401/404/500.

### 7) GET /api/project/published-projects
- **Backend:** projectController.getAllPublishedProjects. No auth. Returns `{ projects }`.
- **Frontend:** expects `data.projects`. Community uses `data.projects ?? []` and handles errors.
- **Status:** 200 + `{ projects }` | 500 (returns `{ projects: [], message }`).

### 8) DELETE /api/project/:projectId
- **Backend:** projectController.deleteProject. protectRoute. Returns `{ success, message }`.
- **Frontend:** expects no specific body; ProjectCard removes item from list on success.
- **Status:** 201 + `{ success, message }` | 401/404/500.

### 9) POST /api/clerk (webhook)
- **Backend:** clerk.ts. Raw body, verifyWebhook(req). Handles user.created/updated/deleted, payment_attempt.updated.
- **Caller:** Clerk Dashboard (Endpoint URL: `https://adora-ai-backend.onrender.com/api/clerk`). No frontend call.
- **Status:** 200 + `{ received: true }` | 400 verification failed | 503 secret missing | 500 handler error.

---

## 3. Sync checklist

- [x] All frontend paths use `/api/user/*` or `/api/project/*` and match backend routes.
- [x] Frontend expects the same response keys as backend sends (credit, projects, project, isPublished, projectId, videoURL, message).
- [x] Protected routes send `Authorization: Bearer <token>` from Clerk getToken().
- [x] Community page handles missing/error response with `data.projects ?? []` and try/catch.
- [x] Backend error responses use serializable `message` (no raw Error object) and correct status codes (401/404/500).

---

## 4. Troubleshooting (Render 500s)

If the deployed backend returns **500** for most or all requests:

1. **Database**
   - In Render → Web Service → **Environment**, set **DATABASE_URL** to your PostgreSQL URL (Internal Database URL from your Render Postgres service).
   - Ensure **Build Command** ran: `npm install && npm run render:build` (so `prisma generate` and `prisma migrate deploy` run).

2. **Clerk**
   - Set **CLERK_SECRET_KEY** and **CLERK_PUBLISHABLE_KEY** in the same Environment tab (from Clerk Dashboard).
   - Without these, `clerkMiddleware()` can cause errors on protected routes.

3. **Webhook**
   - Set **CLERK_WEBHOOK_SIGNING_SECRET** only if you use the webhook. Missing it only affects `POST /api/clerk` (returns 503).

4. **Verify**
   - **Health (no DB, no Clerk):** `GET /api/health` should always return `200` and `{ "status": "ok" }` once the app is running. If this fails, the deploy or start command is wrong.
   - **Public route:** `GET /api/project/published-projects` should return `200` and `{ "projects": [] }` when DB and Clerk are OK.
   - **Webhook:** `POST /api/clerk` with invalid body should return `400`. If you get `503`, the signing secret is not set.
   - **When you get 500:** In Render → your Web Service → **Logs**, look for a line starting with `[server error]` – that shows the real cause (e.g. Prisma connection, Clerk secret, missing env).
   - Run: `node scripts/test-api-endpoints.mjs https://adora-ai-backend.onrender.com` after fixing env and redeploying.
