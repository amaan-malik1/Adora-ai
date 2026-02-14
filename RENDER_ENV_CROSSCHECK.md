# Render environment variables – cross-check

Comparison of **your provided values** vs **what appears in your Render screenshot**.

---

## ✅ Match (same in both)

| Variable | Your value | In Render screenshot | Status |
|----------|------------|----------------------|--------|
| **VITE_CLERK_PUBLISHABLE_KEY** | `pk_test_ZW5oYW5jZWQtcm9iaW4tMTEuY2xlcmsuYWNjb3VudHMuZGV2JA` | Same | ✅ Match |
| **DATABASE_URL** | `postgresql://neondb_owner:npg_gLdDw7UVP8GF@ep-frosty-snow-aift0g3p-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` | Same | ✅ Match |

---

## ✅ Confirmed exact values (set these in Render)

You confirmed the **exact** values from Clerk. In Render → Environment, set:

- **CLERK_SECRET_KEY**  
  Use this **exact** value (letter **O** in `uOB2`, and **Ll9** with lowercase L and 9):  
  `sk_test_uOB2Rih3xPgdaZAxn8wHZJywtwd7KqLl9tAPSPGCBu`

- **CLERK_WEBHOOK_SIGNING_SECRET**  
  Use this **exact** value from Clerk Webhooks (note `0o7O7` – zero, lowercase o, 7, uppercase O, 7):  
  `whsec_0o7O7yxicI6x6Ptn1mZ2yNQq+noqCF20`

If your Render screenshot showed different characters (e.g. `00707` or `u0B2` or `KqL19`), replace with the values above, then **Save** and **Redeploy** the service.

---

## Other variables in your Render screenshot

| Variable | In Render | Note |
|----------|-----------|------|
| **CLERK_WEBHOOK_SIGNING_SECRET** | Set to `whsec_0o7O7yxicI6x6Ptn1mZ2yNQq+noqCF20` (see above) | ✅ Required for webhook. |
| **CLOUDINARY_URL** | `cloudinary://217663368454565:...@dbg8kanyd` | ✅ Backend can use this single var (no need for separate cloud name/key/secret). |
| **GEMINI_CLOUD_API_KEY** | Set | ✅ For image/video generation. |
| **PORT** | `3000` | ✅ Render can override; your app uses `process.env.PORT \|\| 3001`. |

---

## Backend vs frontend keys

- **Backend on Render** needs: **CLERK_SECRET_KEY** (and optionally CLERK_PUBLISHABLE_KEY for some flows).  
- **VITE_CLERK_PUBLISHABLE_KEY** is mainly for the **frontend** app. Having it on Render is harmless but not required for the API.

---

## Summary

1. **DATABASE_URL** and **VITE_CLERK_PUBLISHABLE_KEY** in Render match.
2. Set **CLERK_SECRET_KEY** and **CLERK_WEBHOOK_SIGNING_SECRET** in Render to the **exact** values above (from your Clerk copy).
3. Save env and **Redeploy** the backend, then run:  
   `node scripts/test-api-endpoints.mjs https://adora-ai-backend.onrender.com`
