import type { Request, Response } from "express";
export declare const createProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createVideo: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllPublishedProjects: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=projectController.d.ts.map