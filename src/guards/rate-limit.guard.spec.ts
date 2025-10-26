import { ExecutionContext, HttpException } from '@nestjs/common'

import { RateLimitGuard } from './rate-limit.guard'

function createMockContext(ip: string): ExecutionContext {
    return {
        switchToHttp: () => ({
            getRequest: () => ({ ip, connection: { remoteAddress: ip } })
        })
    } as ExecutionContext
}

describe('RateLimitGuard', () => {
    it('allows first request within limit', () => {
        const guard: RateLimitGuard = new RateLimitGuard()
        const ctx: ExecutionContext = createMockContext('1.2.3.4')
        expect(guard.canActivate(ctx)).toBe(true)
    })

    it('blocks when exceeding minute limit', () => {
        const guard: RateLimitGuard = new RateLimitGuard()
        const ctx: ExecutionContext = createMockContext('5.6.7.8')

        // Exceed 10 requests in the same minute
        for (let i = 1; i <= 10; i++) {
            expect(guard.canActivate(ctx)).toBe(true)
        }

        // Expect the 11th request to throw
        expect(() => guard.canActivate(ctx)).toThrow(HttpException)
    })
})
