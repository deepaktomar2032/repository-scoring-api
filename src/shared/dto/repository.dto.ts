import { ApiProperty } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const RepositoryItemSchema = z.object({
    id: z.number(),
    full_name: z.string(),
    html_url: z.httpUrl(),
    description: z.string().nullable(),
    language: z.string().nullable(),
    stargazers_count: z.number().min(0),
    forks_count: z.number().min(0),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
    score: z.number().min(0)
})

export type RepositoryItemDto = z.infer<typeof RepositoryItemSchema>

export const RepositoryListResponseSchema = z.object({
    total_count: z.number().min(0),
    incomplete_results: z.boolean(),
    items: z.array(RepositoryItemSchema)
})

export type RepositoryListResponseDto = z.infer<typeof RepositoryListResponseSchema>

export class RepositoryItemDtoClass extends createZodDto(RepositoryItemSchema) {
    @ApiProperty({ example: 123456, description: 'Unique repository ID' })
    id: number

    @ApiProperty({ example: 'owner/repo', description: 'Full repository name' })
    full_name: string

    @ApiProperty({ example: 'https://github.com/owner/repo', description: 'Repository URL' })
    html_url: string

    @ApiProperty({ example: 'This is a sample repository', description: 'Repository description' })
    description: string | null

    @ApiProperty({ example: 'TypeScript', description: 'Programming language' })
    language: string | null

    @ApiProperty({ example: 100, description: 'Number of stars' })
    stargazers_count: number

    @ApiProperty({ example: 50, description: 'Number of forks' })
    forks_count: number

    @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Creation date' })
    created_at: string

    @ApiProperty({ example: '2025-01-10T00:00:00Z', description: 'Last updated date' })
    updated_at: string

    @ApiProperty({ example: 70, description: 'Repository score out of 100' })
    score: number
}

export class RepositoryListResponseDtoClass extends createZodDto(RepositoryListResponseSchema) {
    @ApiProperty({ example: 123, description: 'Total repositories matching the search criteria' })
    total_count: number

    @ApiProperty({ example: false, description: 'Whether the results are incomplete' })
    incomplete_results: boolean

    @ApiProperty({ type: RepositoryItemDtoClass, isArray: true })
    items: RepositoryItemDtoClass[]
}
