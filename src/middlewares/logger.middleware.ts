import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const logger: Logger = new Logger(LoggerMiddleware.name)

        logger.log(`LoggerMiddleware: [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
        next()
    }
}
