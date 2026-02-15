import type { Request, Response } from "express";
import { prismaClient } from "../lib/prisma.js";

//getUserCredits 
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth();
        // console.log("UserId at credits controller: ", userId);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized!" });
        }

        const user = await prismaClient.user.findUnique({
            where: { id: userId as string }
        });
        console.log("User data at get credits: ", user);


        return res.json({ credits: user?.credits });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error while getting user credits:", message);
        return res.status(500).json({
            success: false,
            message: "Failed to load credits",
        });
    }
}

//get all my project
export const getMyAllprojects = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth();
        if (!userId) {
            return res.json({
                message: "Unable to get projects!"
            })
        }

        const myAllProjects = await prismaClient.project.findMany({
            where: {
                userId: userId as string
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(201).json({
            success: true,
            myProjects: myAllProjects
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error while getting user's all projects:", message);
        return res.status(500).json({
            success: false,
            message: "Failed to load projects",
        });
    }
}

//get oroject by id 
export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.auth();

        const project = await prismaClient.project.findUnique({
            where: {
                id: projectId as string,
                //@ts-ignore
                userId,
            },
        });
        if (!project) {
            return res.status(404).json({
                message: "Project not found or create new projects!"
            })
        }

        res.status(201).json({
            projectWithId: project
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error while getting project by id:", message);
        return res.status(500).json({
            success: false,
            message: "Failed to load project",
        });
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
                //@ts-ignore
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
                id: projectId as string
            },
            data: {
                isPublished: !project.isPublished
            }
        })

        res.status(201).json({
            isPublished: !project.isPublished
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error while toggling publish:", message);
        return res.status(500).json({
            success: false,
            message: "Failed to update publish status",
        });
    }
}