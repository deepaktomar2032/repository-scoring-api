import { z } from 'zod'

export const GithubRepositoriesSearchResponseSchema = z.object({
    total_count: z.number().min(0),
    incomplete_results: z.boolean(),
    items: z.array(
        z.object({
            id: z.number(),
            full_name: z.string(),
            html_url: z.httpUrl(),
            description: z.string().nullable(),
            language: z.string().nullable(),
            stargazers_count: z.number().min(0),
            forks_count: z.number().min(0),
            created_at: z.iso.datetime(),
            updated_at: z.iso.datetime()
        })
    )
})

export type GithubRepositoriesSearchResponse = z.infer<typeof GithubRepositoriesSearchResponseSchema>
