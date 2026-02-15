import express from "express"
import { createProject, createVideo, deleteProject, getAllPublishedProjects } from "../controllers/projectController.js";
import { protectRoute } from "../middleware/protectRoute.js";
import upload from "../lib/multer.js";

const projectRouter = express.Router();

projectRouter.post('/create', protectRoute, upload.array('images', 2), createProject);
projectRouter.post('/video', protectRoute, createVideo);
projectRouter.get('/published-projects', getAllPublishedProjects);
projectRouter.delete('/:projectId', protectRoute, deleteProject);

export default projectRouter;