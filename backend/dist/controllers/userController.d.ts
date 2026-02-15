import type { Request, Response } from "express";
export declare const getUserCredits: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMyAllprojects: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProjectById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const toggleProjectPublic: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=userController.d.ts.map