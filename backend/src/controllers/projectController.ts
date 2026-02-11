import type { Request, Response } from "express";
import { prismaClient } from "../config/prisma.js";
import { v2 as cloudinary } from "cloudinary";
import { HarmCategory, HarmBlockThreshold } from "@google/genai";
import { GenerateContentConfig } from "@google/genai";
import fs from "fs"
import ai from "../config/ai.js";
import axios from "axios";
import path from "path";

const loadImage = (path: string, mimeType: string) => {
    return {
        inlineData: {
            data: fs.readFileSync(path).toString('base64'),
            mimeType,
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
                id: userId as string,
            }
        })

        if (!user || user.credits < 5) {
            return res.status(401).json({ message: "insufficient credits" })
        } else {
            //deducting credits
            await prismaClient.user.update({
                where: {
                    id: userId as string
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
        const image1 = loadImage(images[0].path, images[0].mimetype);
        const image2 = loadImage(images[1].path, images[1].mimetype);

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

                where: { id: userId as string },
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
    const { userId } = req.auth();
    const { projectId } = req.body;
    const { } = req.body;
    let isCreditsDeducted = false;

    try {
        const user = await prismaClient.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.credits < 10) {
            return res.status(401).json("Not sufficient credits!");
        }

        await prismaClient.user.update({
            where: { id: userId },
            data: {
                credits: { decrement: 10 }
            }
        }).then(() => { isCreditsDeducted = true });

        //finding project and making video with ccredit deduction
        const project = await prismaClient.project.findUnique({
            where: { id: projectId, userId },
            include: { user: true }
        });

        if (!projectId || project?.isGenerating) {
            return res.status(404).json({
                message: "Generation in progress.."
            })
        };

        if (project?.generatedVideo) {
            return res.status(201).json({
                message: "Video already generated!"
            })
        };

        await prismaClient.project.update({
            where: {
                id: projectId
            },
            data: {
                isGenerating: true
            }
        });

        const prompt = `Make the person showcase the product which is ${project?.productName} ${project?.productDescription && `and product description: ${project.productDescription}`} `;

        const model = 'veo-3.1-generate-preview';

        if (!project?.generatedImage) {
            throw new Error("Generated image not found!")
        };

        const image = await axios.get(project.generatedImage, { responseType: 'arraybuffer' });

        const imageByte: any = Buffer.from(image.data);

        let operation: any = await ai.models.generateVideos({
            model,
            prompt,
            image: {
                imageBytes: imageByte.toString('base64'),
                mimeType: 'image/png'
            },
            config: {
                aspectRatio: project?.aspectRatio || '9:16',
                numberOfVideos: 1,
                resolution: '720p'
            }
        });

        while (!operation.done) {
            console.log("Waiting for video generation to compelte...");
            await new Promise((resolve) => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({
                operation: operation,
            });
        }

        const fileName = `${userId}-${Date.now()}.mp4`;
        const filePath = path.join('videos', fileName);

        //create image directory if doesn't exist
        fs.mkdirSync('videos', { recursive: true });

        //download the file 
        await ai.files.download({
            file: operation.response.generateVideos[0].video,
            downloadPath: filePath
        });

        const uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: 'video' });

        await prismaClient.project.update({
            where: { id: project.id },
            data: {
                generatedVideo: uploadResult.secure_url,
                isGenerating: false,
            }
        });

        fs.unlinkSync(filePath);

        res.json({
            message: "Video generation completed!",
            videoURL: uploadResult.secure_url
        })

    } catch (error: any) {
        await prismaClient.project.update({
            where: { id: projectId },
            data: {
                isGenerating: false,
                error: error.message
            }
        });

        if (isCreditsDeducted) {
            await prismaClient.user.update({

                where: { id: userId as string },
                data: {
                    credits: { increment: 10 }
                }
            })
        }

        console.log("Error while : ", error)
        res.json({
            message: "Task not done!" + error
        })
    }
}

//getAllPublishedProjects route
export const getAllPublishedProjects = async (req: Request, res: Response) => {
    try {

        const allProjects = await prismaClient.project.findMany({
            where: { isPublished: true }
        })
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

        const project = await prismaClient.project.findUnique({
            where: { id: projectId, userId }
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found!"
            })
        }

        await prismaClient.project.delete({
            where: {
                id: projectId,
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