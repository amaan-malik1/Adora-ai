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
//get all project 
export const getAllprojects = async (req: Request, res: Response) => {
    try {

    } catch (error) {
        console.log("Error while getting user credits!" + error);
        res.status(500).json({
            success: false,
            message: error
        })
    }
}
//get oroject by id 
export const getProjectById = async (req: Request, res: Response) => {
    try {

    } catch (error) {
        console.log("Error while getting user credits!" + error);
        res.status(500).json({
            success: false,
            message: error
        })
    }
}
//toggle the project 
export const toggleProjectPublic = async (req: Request, res: Response) => {
    try {

    } catch (error) {
        console.log("Error while getting user credits!" + error);
        res.status(500).json({
            success: false,
            message: error
        })
    }
}