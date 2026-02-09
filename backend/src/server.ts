import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import clerkWebHooks from "./controllers/clerk.js";
import userRouter from "./routes/userRoute.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3001;

//middleware
app.use(cors());
app.post('/api/clerk', express.raw({ type: 'application/json' }), clerkWebHooks);
app.use(express.json());    //help in parsing user data
app.use(clerkMiddleware());

//routes
app.use('/api/user', userRouter);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})