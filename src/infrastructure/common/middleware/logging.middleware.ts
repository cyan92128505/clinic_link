// src/infrastructure/common/middleware/logging.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Log health check requests to identify source
    if (req.path.includes('health')) {
      console.log(
        `Health check request from: ${req.headers['user-agent']}, IP: ${req.ip}`,
      );
    }
    next();
  }
}
