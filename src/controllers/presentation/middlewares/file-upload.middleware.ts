import {Request, Response, NextFunction} from 'express';
export class FileUploadMiddleware {
    static async containFile(req: Request, res: Response, next: NextFunction) {
        if(!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                error: 'No files were uploaded.'
            });
        }

        if(!Array.isArray(req.files.file)) {
            req.body.file = [req.files.file];
        } else {
            req.body.files = req.files.file;
        }

        next();
    }
}