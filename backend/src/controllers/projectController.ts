import type { Request, Response } from "express";
import { prismaClient } from "../config/prisma.js";
import { v2 as cloudinary } from "cloudinary";
import { GenerateContentConfig, HarmCategory, HarmBlockThreshold } from "@google/genai";
import fs from "fs"
import ai from "../config/ai.js";

const loadImage = (path: string, mimeType: string) => {
    return {
        inlineData: {
            data: fs.readFileSync(path).toString('base64')
            mimeType:
         }
    }
}

//createProject route
export const createProject = async (req: Request, res: Response) => {
    const { userId } = req.auth();
    let tempProjectId;
    let isCreditsDeducted = false;

    const {
        name = 'New Project',
        productName,
        productDescription,
        userPrompt,
        aspectRatio,
        targetLength = 5,
    } = req.body;

    const images: any = req.files;

    try {
        if (images.length() < 2 || !productName) {
            return res.status(400).json({
                message: "Please upload atleast 2 images"
            })

        }
        const user = await prismaClient.user.findUnique({
            where: {
                id: userId,
            }
        })

        if (!user || user.credits < 5) {
            return res.status(401).json({ message: "insufficient credits" })
        } else {
            //deducting credits
            await prismaClient.user.update({
                where: {
                    id: userId
                },
                data: {
                    credits: { decrement: 5 }
                }
            }).then(() => isCreditsDeducted = true)
        }

        //uploading img to cloudinary
        const uploadedImages = await Promise.all(images.map(async (item: any) => {
            let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
            return result.secure_url;
        }));

        //creating project and feed data to DB
        const project = await prismaClient.project.create({
            data: {
                userId,
                name,
                productName,
                productDescription,
                userPrompt,
                aspectRatio,
                targetLength: parseInt(targetLength),
                isGenerating: true,
                uploadedImages
            }
        })

        tempProjectId = project.id;

        //gemini API for img generation
        const model = 'gemini-3-pro-image-preview';

        const generateContentConfig: GenerateContentConfig = {
            maxOutputTokens: 32768,
            temperature: 1,
            topK: 0.95,
            responseModalities: ['IMAGE'],
            imageConfig: {
                aspectRatio: aspectRatio || '9:16',
                imageSize: '1k'
            },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.OFF,
                },
            ]
        };

        //feeding img base-64 to model
        const image1 = loadImage(images[0].path, images[0].mimeType);
        const image2 = loadImage(images[1].path, images[1].mimeType);

        const prompt = {
            text: `Combine the person and product into a realistic photo.
            Make the person naturally hold or use the product.
            Match lightning, shadows, scale, and perspective.
            Make the person stand in professional studio lightning.
            Output ecommerce-quality photo realistic imagery.
            ${userPrompt} 
            `
        }

        const resImg: any = await ai.models.generateContent({
            model,
            contents: [image1, image2, prompt],
            config: generateContentConfig
        });

        if (!resImg?.candidates[0]?.content?.parts) {
            throw new Error("Unexpected response Img");
        }

        const parts = resImg.candidates[0]?.content?.parts;

        let finalBuffer: Buffer | null = null;

        for (const part of parts) {
            if (part.inlineData) {
                finalBuffer = Buffer.from(part.inlineData.data, 'base64')
            }

        }

        if (!finalBuffer) {
            throw new Error("failed to generate Image!")
        }

        const base64Image = `data:image/png;base64,${finalBuffer.toString('base64')}`;

        const uploadResult = await cloudinary.uploader.upload(base64Image, { resource_type: 'image' });

        await prismaClient.project.update({
            where: {
                id: project.id
            },
            data: {
                generatedImage: uploadResult.secure_url,
                isGenerating: false
            }
        });

        res.status(201).json({ projectId: project.id })
    } catch (error: any) {
        if (tempProjectId!) {
            await prismaClient.project.update({
                where: {
                    id: tempProjectId
                },
                data: {
                    isGenerating: false,
                    error: error.message
                }
            })
        }

        if (isCreditsDeducted) {
            await prismaClient.user.update({

                where: { id: userId },
                data: {
                    credits: { increment: 5 }
                }
            })
        }



        console.log("Error while : ", error)
        res.json({
            message: "Task not done!" + error
        })
    }
}

//createVideo route
export const createVideo = async (req: Request, res: Response) => {
    try {

    } catch (error) {
        console.log("Error while : ", error)
        res.json({
            message: "Task not done!" + error
        })
    }
}

//getAllPublishedProjects route
export const getAllPublishedProjects = async (req: Request, res: Response) => {
    try {
        const allProjects = await prismaClient.project.findMany()
        res.json({
            projects: allProjects
        })
    } catch (error) {
        console.log("Error while : ", error)
        res.json({
            message: "Task not done!" + error
        })
    }
}

//deleteProject route
export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth()
        const { projectId } = req.params;

        if (!userId || !projectId) {
            return res.status(401).json({ message: "Unauthorized user" })
        }

        await prismaClient.project.delete({
            where: {
                id: projectId,
                userId,
            }
        });

        res.status(201).json({
            success: true,
            message: "Project deleted successfully!"
        })

    } catch (error) {
        console.log("Error while deleting project: ", error)
        res.json({
            message: "Task not done!" + error
        })

    }
} 