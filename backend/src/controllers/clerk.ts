import { verifyWebhook } from "@clerk/express/webhooks";
import { type Request, type Response } from "express";
import { prismaClient } from "../config/prisma.js";

const CREDITS_BY_PLAN = { basic: 30, pro: 100, ultra: 350 } as const;
type PlanSlug = keyof typeof CREDITS_BY_PLAN;

function getEmail(data: { email_addresses?: Array<{ email_address?: string }> }): string | null {
    return data.email_addresses?.[0]?.email_address ?? null;
}

function getFullName(data: { first_name?: string; last_name?: string }): string | null {
    const first = data.first_name ?? "";
    const last = data.last_name ?? "";
    const name = [first, last].filter(Boolean).join(" ").trim();
    return name || null;
}

const clerkWebHooks = async (req: Request, res: Response) => {
    if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
        console.error("[webhook] CLERK_WEBHOOK_SIGNING_SECRET is not set");
        return res.status(503).json({ error: "Webhook not configured" });
    }

    let event: { data: any; type: string };
    try {
        event = await verifyWebhook(req);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Verification failed";
        console.error("[webhook] Verification failed:", message);
        return res.status(400).json({ error: "Webhook verification failed" });
    }

    const { data, type } = event;

    try {
        switch (type) {
            case "user.created": {
                const email = getEmail(data);
                const name = getFullName(data);
                await prismaClient.user.upsert({
                    where: { id: data.id },
                    create: {
                        id: data.id,
                        email,
                        name,
                        image: data?.image_url ?? null,
                    },
                    update: {
                        email,
                        name,
                        image: data?.image_url ?? null,
                    },
                });
                break;
            }

            case "user.updated":
                await prismaClient.user.update({
                    where: { id: data.id },
                    data: {
                        email: getEmail(data),
                        name: getFullName(data),
                        image: data?.image_url ?? undefined,
                    },
                });
                break;

            case "user.deleted":
                await prismaClient.user.delete({
                    where: { id: data.id },
                }).catch(() => {
                    // Already deleted or missing – idempotent
                });
                break;

            case "payment_attempt.updated":
                if (
                    (data.charge_type === "recurring" || data.charge_type === "checkout") &&
                    data.status === "paid"
                ) {
                    const clerkUserId = data?.payer?.user_id;
                    const planSlug = data?.subscription_items?.[0]?.plan?.slug;

                    if (
                        !clerkUserId ||
                        !planSlug ||
                        !(planSlug in CREDITS_BY_PLAN)
                    ) {
                        return res.status(400).json({ error: "Invalid plan or payer" });
                    }

                    const planId = planSlug as PlanSlug;
                    await prismaClient.user.update({
                        where: { id: clerkUserId },
                        data: {
                            credits: { increment: CREDITS_BY_PLAN[planId] },
                        },
                    });
                }
                break;

            default:
                break;
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[webhook] Handler error:", message, type);
        return res.status(500).json({ error: "Webhook processing failed" });
    }
};

export default clerkWebHooks;