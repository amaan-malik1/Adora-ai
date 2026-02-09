import { Request } from "express";
declare global {
    namespace Express {
        interface Request {
            auth: () => {
                userId: String; has: (Permission: any) => boolean
            };
            plan?: String;
            file: any;
        }
    }
}