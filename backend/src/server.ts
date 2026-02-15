import express from "express";
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
if (!process.env.DATABASE_URL) console.warn("[startup] DATABASE_URL is not set – DB routes will fail");
if (!process.env.CLERK_SECRET_KEY) console.warn("[startup] CLERK_SECRET_KEY is not set – auth routes may fail");

// Middleware 
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL as string,
      "http://localhost:5173",
      //"http://localhost:5174", // Support both Vite default ports
    ],
    credentials: true,
  })
);


// Health check 
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Webhook 
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebHooks);

app.use(express.json());
app.use(clerkMiddleware());

// routes
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

// Global error handler – log full error in Render logs so we can debug 500s
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server error]", err?.message);
  console.error(err?.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});