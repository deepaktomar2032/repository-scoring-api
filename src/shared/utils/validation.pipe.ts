import { BadRequestException, Injectable, Logger, PipeTransform } from '@nestjs/common'
import { ZodSafeParseResult, ZodType } from 'zod'

@Injectable()
export class ZodValidationPipe<T extends Record<string, unknown>> implements PipeTransform {
    private readonly logger: Logger = new Logger(ZodValidationPipe.name)

    constructor(private schema: ZodType<T>) {}

    transform(value: unknown): T {
        const result: ZodSafeParseResult<T> = this.schema.safeParse(value)

        if (!result.success) {
            this.logger.warn('ZodValidationPipe:transform: Validation failed:', result.error.issues)

            const messages: string[] = result.error.issues.map(
                (issue) => `${issue.path.map((p) => String(p)).join('.')} - ${issue.message}`
            )

            throw new BadRequestException(messages)
        }

        return result.data
    }
}
