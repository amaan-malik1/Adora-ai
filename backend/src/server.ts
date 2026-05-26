import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import clerkWebHooks from "./controllers/clerk.js";
import userRouter from "./routes/userRoute.js";
import projectRouter from "./routes/projectRoutes.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3001;

// Log env status at startup (helps debug 500s on Render – check Logs tab)
if (!process.env.DATABASE_URL)
  console.warn("[startup] DATABASE_URL is not set: DB routes will fail");
if (!process.env.CLERK_SECRET_KEY)
  console.warn("[startup] CLERK_SECRET_KEY is not set: auth routes may fail");

// Middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL as string, "http://localhost:5173"],
    credentials: true,
  }),
);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Webhook
app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebHooks,
);

app.use(express.json());
app.use(
  clerkMiddleware({
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  }),
);

// routes
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

//listening server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
