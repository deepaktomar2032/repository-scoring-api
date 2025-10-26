import { ApiProperty } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const RepositorySearchQuerySchema = z
    .object({
        language: z.string().min(1),
        created_at: z.iso.date()
    })
    .transform((data) => ({
        language: data.language,
        createdAt: data.created_at
    }))

export type RepositorySearchQuery = z.infer<typeof RepositorySearchQuerySchema>

export const RepositorySearchQuerySwaggerSchema = z.object({
    language: z.string().min(1),
    created_at: z.iso.date()
})

export class RepositorySearchQueryDtoClass extends createZodDto(RepositorySearchQuerySwaggerSchema) {
    @ApiProperty({ example: 'TypeScript', description: 'Programming language filter' })
    language: string

    @ApiProperty({ example: '2025-01-01', description: 'Created on/after this date' })
    created_at: string
}
