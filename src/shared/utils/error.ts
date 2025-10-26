import { HttpStatus } from '@nestjs/common'

export interface AppError {
    key: string
    message: string
    status: number
}

export const ERRORS = {
    // 4xx Client Errors
    FORBIDDEN: { key: 'forbidden', message: 'Insufficient permissions', status: HttpStatus.FORBIDDEN },
    TOO_MANY_REQUESTS: { key: 'too_many_requests', message: 'Too many requests', status: HttpStatus.TOO_MANY_REQUESTS },

    // 5xx Server Errors
    INTERNAL_ERROR: {
        key: 'internal_error',
        message: 'Internal server error',
        status: HttpStatus.INTERNAL_SERVER_ERROR
    },
    SERVICE_UNAVAILABLE: {
        key: 'service_unavailable',
        message: 'External service unavailable',
        status: HttpStatus.SERVICE_UNAVAILABLE
    }
}
