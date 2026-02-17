
import { verifyWebhook } from "@clerk/express/webhooks"
import { type Request, type Response } from "express";
import { prismaClient } from "../lib/prisma.js"


const clerkWebHooks = async (req: Request, res: Response) => {
    try {
        const event: any = await verifyWebhook(req);

        //switch case for different Events
        const { data, type } = event;
        switch (type) {
            case "user.created":
                await prismaClient.user.create({
                    data: {
                        id: data.id,
                        email: data.email_addresses[0]?.email_address,
                        name: data.first_name + " " + data.last_name,
                        image: data?.image_url,
                    }
                })
                break;

            // case "user.updated":
            //     await prismaClient.user.update({
            //         where: { id: data.id },
            //         data: {
            //             email: data.email_addresses[0]?.email_address,
            //             name: data.first_name + " " + data.last_name,
            //             image: data?.image_url,
            //         }
            //     })
            //     break;

            case "user.updated":
                await prismaClient.user.upsert({
                    where: { id: data.id },
                    update: {
                        email: data.email_addresses[0]?.email_address,
                        name: data.first_name + " " + data.last_name,
                        image: data?.image_url,
                    },
                    create: {
                        id: data.id,
                        email: data.email_addresses[0]?.email_address,
                        name: data.first_name + " " + data.last_name,
                        image: data?.image_url,
                        credits: 5
                    }
                })
                break;

            case "user.deleted":
                await prismaClient.user.deleteMany({
                    where: { id: data.id },
                })
                break;

            // case "paymentAttempt.updated":
            // if ((data.charge_type === "recurring" || data.charge_type === "checkout") && data.status === "paid") {
            //     const credits = { basic: 30, pro: 100, ultra: 350 }
            //     const clerkUserId = data?.payer?.user_id;
            //     const planId: keyof typeof credits = data?.subscription_items?.[0]?.plan?.slug;

            //     if (planId !== "basic" && planId !== "pro" && planId !== "ultra") {
            //         return res.status(400).json({
            //             message: "Invalid plan"
            //         })
            //     }

            //     console.log(planId)
            //     await prismaClient.user.update({
            //         where: {
            //             id: clerkUserId
            //         },
            //         data: {
            //             credits: { increment: credits[planId] }
            //         }
            //     })
            // }
            // break;

            case "paymentAttempt.updated":
                if (
                    (data.charge_type === "recurring" || data.charge_type === "checkout") &&
                    data.status === "paid"
                ) {
                    const credits = { basic: 30, pro: 100, ultra: 350 };

                    const clerkUserId = data?.payer?.user_id;
                    const planId: keyof typeof credits =
                        data?.subscription_items?.[0]?.plan?.slug;

                    if (!clerkUserId) {
                        console.log("No Clerk user ID found in payment event");
                        return res.status(200).json({ message: "No user ID, skipping" });
                    }

                    if (!["basic", "pro", "ultra"].includes(planId)) {
                        console.log("Invalid plan:", planId);
                        return res.status(200).json({ message: "Invalid plan, skipping" });
                    }

                    const user = await prismaClient.user.findUnique({
                        where: { id: clerkUserId },
                    });

                    if (!user) {
                        console.log("User not found for credit update:", clerkUserId);
                        return res.status(200).json({
                            message: "User not found, skipping credit update",
                        });
                    }

                    await prismaClient.user.update({
                        where: { id: clerkUserId },
                        data: {
                            credits: { increment: credits[planId] },
                        },
                    });
                }
                break;

            default:
                break;
        }
        res.status(200).json({ message: "Webhook recieved: " + type });

    } catch (error: any) {
        console.log("Error while creating webhook: ", error);

        res.status(500).json({
            message: error.message
        })
    }
}

export default clerkWebHooks;