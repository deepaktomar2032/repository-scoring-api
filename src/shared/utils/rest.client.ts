import { HttpException, Injectable, Logger } from '@nestjs/common'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'

import { ERRORS } from './error'

@Injectable()
export class RestClient {
    private readonly logger: Logger = new Logger(RestClient.name)

    async get<T>(config: AxiosRequestConfig): Promise<T> {
        try {
            const { data }: { data: T } = await axios(config)
            return data
        } catch (err) {
            this.logger.error('RestClient:get: ', err instanceof Error ? err.stack : err)
            throw this.toHttpException(err)
        }
    }

    private toHttpException(error: unknown): HttpException {
        if (error instanceof HttpException) return error

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<unknown>
            const status = axiosError.response?.status || 500

            let appError: (typeof ERRORS)[keyof typeof ERRORS]
            if (status === 403) appError = ERRORS.FORBIDDEN
            else if (status === 429) appError = ERRORS.TOO_MANY_REQUESTS
            else if (status === 503) appError = ERRORS.SERVICE_UNAVAILABLE
            else appError = ERRORS.INTERNAL_ERROR

            this.logger.error(
                `RestClient:toHttpException: `,
                JSON.stringify({
                    status: status,
                    responseData: axiosError.response?.data,
                    message: axiosError.message,
                    stack: axiosError.stack
                })
            )

            return new HttpException({ key: appError.key, message: appError.message }, appError.status)
        }

        this.logger.error('RestClient: unknown error', error instanceof Error ? error.stack : JSON.stringify(error))

        return new HttpException(
            { key: ERRORS.INTERNAL_ERROR.key, message: ERRORS.INTERNAL_ERROR.message },
            ERRORS.INTERNAL_ERROR.status
        )
    }
}
