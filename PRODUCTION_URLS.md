# Production URLs (Adora-Ai)

Use these exact values when configuring services.

## Backend (Render)

- **API base:** `https://adora-ai-backend.onrender.com`
- **Health / public:** `https://adora-ai-backend.onrender.com/api/project/published-projects`

## Clerk webhook

In **Clerk Dashboard → Webhooks → Add endpoint** (or edit existing):

- **Endpoint URL (no space):**  
  `https://adora-ai-backend.onrender.com/api/clerk`

Subscribe to: `user.created`, `user.updated`, `user.deleted`, and optionally `payment_attempt.updated`.  
Copy the **Signing secret** and set it in Render as the `CLERK_WEBHOOK_SIGNING_SECRET` environment variable.

## Frontend

Set in your frontend env (e.g. Vercel/Netlify or `.env`):

- `VITE_BASE_URL=https://adora-ai-backend.onrender.com`

So all API calls go to the deployed backend.
