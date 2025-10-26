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
