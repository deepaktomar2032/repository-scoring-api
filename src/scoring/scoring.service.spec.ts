import { Test, TestingModule } from '@nestjs/testing'

import { RepositoryListResponseDto } from 'src/shared/dto/repository.dto'

import { ScoringService } from './scoring.service'

describe('ScoringService', () => {
    let scoringService: ScoringService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ScoringService]
        }).compile()

        scoringService = module.get<ScoringService>(ScoringService)
    })

    it('should be defined', () => {
        expect(scoringService).toBeDefined()
    })

    it('computeScoresForRepos computes scores using metrics', () => {
        const repositories: RepositoryListResponseDto = {
            total_count: 2,
            incomplete_results: false,
            items: [
                {
                    id: 1,
                    full_name: 'a/a',
                    html_url: 'https://github.com/a/a',
                    description: null,
                    language: 'TypeScript',
                    stargazers_count: 100,
                    forks_count: 50,
                    created_at: '2025-01-01T00:00:00Z',
                    updated_at: new Date().toISOString(),
                    score: 0
                },
                {
                    id: 2,
                    full_name: 'b/b',
                    html_url: 'https://github.com/b/b',
                    description: null,
                    language: 'TypeScript',
                    stargazers_count: 10,
                    forks_count: 5,
                    created_at: '2025-01-01T00:00:00Z',
                    updated_at: new Date().toISOString(),
                    score: 0
                }
            ]
        }

        const scoredRepositories: RepositoryListResponseDto = scoringService.computeScoresForRepos(repositories)

        expect(scoredRepositories.total_count).toBe(2)
        expect(scoredRepositories.items).toHaveLength(2)

        expect(scoredRepositories.items[0].score).toBeGreaterThanOrEqual(0)
        expect(scoredRepositories.items[0].score).toBeLessThanOrEqual(100)

        // The one with higher stars/forks should typically have >= score if `updated_at` is similar
        expect(scoredRepositories.items[0].score).toBeGreaterThanOrEqual(scoredRepositories.items[1].score)
    })
})
