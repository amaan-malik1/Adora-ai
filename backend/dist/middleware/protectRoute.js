import {} from "express";
export const protectRoute = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({ message: "Unauthorized" });
    }
};
//# sourceMappingURL=protectRoute.js.map