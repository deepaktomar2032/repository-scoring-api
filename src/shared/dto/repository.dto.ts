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
