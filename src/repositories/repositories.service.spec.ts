import { Test, TestingModule } from '@nestjs/testing'

import { GithubService } from 'src/github/github.service'
import { ScoringService } from 'src/scoring/scoring.service'
import { RepositorySearchQuery } from 'src/shared/dto/repository-search.query.dto'
import { RepositoryListResponseDto } from 'src/shared/dto/repository.dto'

import { RepositoriesService } from './repositories.service'

describe('RepositoriesService', () => {
    let repositoriesService: RepositoriesService
    let githubMock: { searchRepositories: jest.Mock }
    let scoringMock: { computeScoresForRepos: jest.Mock }

    beforeEach(async () => {
        githubMock = { searchRepositories: jest.fn() }
        scoringMock = { computeScoresForRepos: jest.fn() }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RepositoriesService,
                { provide: GithubService, useValue: githubMock },
                { provide: ScoringService, useValue: scoringMock }
            ]
        }).compile()

        repositoriesService = module.get<RepositoriesService>(RepositoriesService)
    })

    it('should be defined', () => {
        expect(repositoriesService).toBeDefined()
    })

    it('should fetch and score repos', async () => {
        const query: RepositorySearchQuery = { language: 'TypeScript', createdAt: '2025-01-01' }
        const repositories: RepositoryListResponseDto = {
            total_count: 1,
            incomplete_results: false,
            items: [
                {
                    id: 1,
                    full_name: 'owner/repo',
                    html_url: 'https://github.com/owner/repo',
                    description: 'demo repo',
                    language: 'TypeScript',
                    stargazers_count: 5,
                    forks_count: 1,
                    created_at: '2025-01-01T00:00:00Z',
                    updated_at: '2025-01-02T00:00:00Z',
                    score: 0
                }
            ]
        }

        const { total_count, incomplete_results, items } = repositories

        const getScoredRepositories: RepositoryListResponseDto = {
            total_count,
            incomplete_results,
            items: items.map((repository) => ({
                ...repository,
                score: 75
            }))
        }

        githubMock.searchRepositories.mockResolvedValue(repositories)
        scoringMock.computeScoresForRepos.mockReturnValue(getScoredRepositories)

        const result: RepositoryListResponseDto = await repositoriesService.getScoredRepositories(query)

        expect(githubMock.searchRepositories).toHaveBeenCalledWith(query)

        expect(scoringMock.computeScoresForRepos).toHaveBeenCalledWith(repositories)

        expect(result).toEqual(getScoredRepositories)
    })
})
