import type { Request, Response } from "express";
import { prismaClient } from "../config/prisma.js";

//getUserCredits – ensures user exists in DB (syncs from Clerk if webhook missed)
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth();
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized!" });
        }

        const id = userId as string;
        let user = await prismaClient.user.findUnique({
            where: { id },
        });

        // If user exists in Clerk but not in DB (e.g. webhook not run yet), create with defaults
        if (!user) {
            user = await prismaClient.user.upsert({
                where: { id },
                create: { id },
                update: {},
            });
        }

        return res.json({ credits: user.credits });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error while getting user credits:", message);
        return res.status(500).json({
            success: false,
            message: "Failed to load credits",
        });
    }
}

//get all project for user 
export const getAllprojects = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth();
        if (!userId) {
            return res.json({
                message: "Unable to get projects!"
            })
        }

        const allProjects = await prismaClient.project.findMany({
            where: {
                userId: userId as string
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(201).json({
            success: true,
            projects: allProjects
        })
    } catch (error) {
        console.log("Error while getting user's all project!" + error);
        res.status(500).json({
            success: false,
            message: error
        })
    }
}

//get oroject by id 
export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.auth();

        const project = await prismaClient.project.findUnique({
            where: {
                userId,
                id: projectId,
            },
        });
        if (!project) {
            return res.status(404).json({
                message: "Project not found!"
            })
        }

        res.status(201).json({
            project
        });

    } catch (error) {
        console.log("Error while getting user's project with id!" + error);
        res.status(500).json({
            success: false,
            message: error
        })
    }
}

//toggle the project 
export const toggleProjectPublic = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.auth();

        const project = await prismaClient.project.findUnique({
            where: {
                id: projectId as string,
                userId,
            },
        });
        if (!project) {
            return res.status(404).json({
                message: "Project not found!"
            })
        }
        if (!project.generatedImage && !project.generatedVideo) {
            return res.status(404).json({
                message: "Image or video not generated!"
            })
        }

        await prismaClient.project.update({
            where: {
                id: projectId
            },
            data: {
                isPublished: !project.isPublished
            }
        })

        res.status(201).json({
            isPublished: !project.isPublished
        });

    } catch (error) {
        console.log("Error while toggling!" + error);
        res.status(500).json({
            success: false,
            message: error
        })
    }
}