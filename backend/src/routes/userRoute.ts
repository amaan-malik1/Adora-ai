import express from "express";
import { getMyAllprojects, getProjectById, getUserCredits, toggleProjectPublic } from "../controllers/userController.js";
import { protectRoute } from "../middleware/protectRoute.js";
const userRouter = express.Router();

userRouter.get('/credit', protectRoute, getUserCredits);
userRouter.get('/projects', protectRoute, getMyAllprojects);
userRouter.get('/project/:projectId', protectRoute, getProjectById);
userRouter.get('/publish/:projectId', protectRoute, toggleProjectPublic);

export default userRouter;