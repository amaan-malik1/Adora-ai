import e, { type NextFunction, type Request, type Response } from "express";

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.auth();
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        next();
    } catch (error) {
        console.log("Error while authorizing: ", error);
        res.status(401).json({ message: "Error in middleware" });
    }
} 