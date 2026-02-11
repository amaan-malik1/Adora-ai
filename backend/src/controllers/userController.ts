import type { Request, Response } from "express";
import { prismaClient } from "../config/prisma.js";

//getUserCredits 
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth();
        if (!userId) {
            return res.json({
                message: "Unauthorized!"
            })
        }

        const user = await prismaClient.user.findUnique({
            where: { id: userId as string }
        });

        res.json({
            credits: user?.credits
        })

    } catch (error) {
        console.log("Error while getting user credits!" + error);
        res.status(500).json({
            success: false,
            message: error
        })
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
                id: userId as string
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(201).json({
            success: true,
            rpojects: allProjects
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