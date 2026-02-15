import { verifyWebhook } from "@clerk/express/webhooks";
import {} from "express";
import { prismaClient } from "../lib/prisma.js";
const clerkWebHooks = async (req, res) => {
    try {
        const event = await verifyWebhook(req);
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
                });
                break;
            case "user.updated":
                await prismaClient.user.update({
                    where: { id: data.id },
                    data: {
                        email: data.email_addresses[0]?.email_address,
                        name: data.first_name + " " + data.last_name,
                        image: data?.image_url,
                    }
                });
                break;
            case "user.deleted":
                await prismaClient.user.delete({
                    where: { id: data.id },
                });
                break;
            case "payment_attempt.updated":
                if ((data.charge_type === "recurring" || data.charge_type === "checkout") && data.status === "paid") {
                    const credits = { basic: 30, pro: 100, ultra: 350 };
                    const clerkUserId = data?.payer?.user_id;
                    const planId = data?.subscription_items?.[0]?.plan?.slug;
                    if (planId !== "basic" && planId !== "pro" && planId !== "ultra") {
                        return res.status(400).json({
                            message: "Invalid plan"
                        });
                    }
                    console.log(planId);
                    await prismaClient.user.update({
                        where: {
                            id: clerkUserId
                        },
                        data: {
                            credits: { increment: credits[planId] }
                        }
                    });
                }
                break;
            default:
                break;
        }
        res.status(200).json({ received: true + type });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
export default clerkWebHooks;
//# sourceMappingURL=clerk.js.map