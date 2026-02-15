import { type Request, type Response } from "express";
declare const clerkWebHooks: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export default clerkWebHooks;
//# sourceMappingURL=clerk.d.ts.map