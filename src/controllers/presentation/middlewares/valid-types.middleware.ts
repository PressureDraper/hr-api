import { NextFunction, Request, Response } from "express";

export class ValidTypeMiddleware {
    static validType(validTypes: string[]) {
        return (req: Request, res: Response, next: NextFunction) => {
            const type = req.url.split('/').at(2) ?? '';
            if(!validTypes.includes(type)) {
                return res.status(400).json({
                    error: 'Invalid type'
                });
            }
            next();
        };
    }
}