import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common'

type Bucket = {
    remaining: number
    resetAt: number
}

@Injectable()
export class RateLimitGuard implements CanActivate {
    private readonly minuteStore = new Map<string, Bucket>()
    private readonly hourStore = new Map<string, Bucket>()

    private readonly MINUTE_LIMIT: number = 10
    private readonly HOUR_LIMIT: number = 60
    private readonly MINUTE_WINDOW: number = 60 * 1000 // 1 min
    private readonly HOUR_WINDOW: number = 60 * 60 * 1000 // 1 hour

    canActivate(context: ExecutionContext): boolean {
        const http = context.switchToHttp()
        const req = http.getRequest<{ ip?: string; connection?: { remoteAddress?: string } }>()

        const ip = req.ip || req.connection?.remoteAddress || 'unknown'
        const now = Date.now()

        // Check both 1-min and 1-hour buckets
        this.enforceLimit(ip, now, this.minuteStore, this.MINUTE_LIMIT, this.MINUTE_WINDOW)
        this.enforceLimit(ip, now, this.hourStore, this.HOUR_LIMIT, this.HOUR_WINDOW)

        return true
    }

    private enforceLimit(ip: string, now: number, store: Map<string, Bucket>, limit: number, windowMs: number) {
        let bucket = store.get(ip)

        // Reset bucket if new window started
        if (!bucket || now >= bucket.resetAt) {
            bucket = { remaining: limit, resetAt: now + windowMs }
            store.set(ip, bucket)
        }

        bucket.remaining -= 1

        const resetSec: number = Math.floor(bucket.resetAt / 1000)

        if (bucket.remaining < 0) {
            throw new HttpException(
                {
                    message: `Rate limit exceeded. You can make up to ${limit} requests per ${
                        windowMs === this.MINUTE_WINDOW ? 'minute' : 'hour'
                    }.`,
                    limit,
                    reset: resetSec
                },
                HttpStatus.TOO_MANY_REQUESTS
            )
        }
    }
}
