import { Test, TestingModule } from '@nestjs/testing'

import { RepositorySearchQuery } from 'src/shared/dto/repository-search.query.dto'
import { RepositoryListResponseDto } from 'src/shared/dto/repository.dto'

import { RepositoriesController } from './repositories.controller'
import { RepositoriesService } from './repositories.service'

describe('RepositoriesController', () => {
    let controller: RepositoriesController
    let repositoriesService: { getScoredRepositories: jest.Mock }

    beforeEach(async () => {
        repositoriesService = { getScoredRepositories: jest.fn() }

        const module: TestingModule = await Test.createTestingModule({
            controllers: [RepositoriesController],
            providers: [
                {
                    provide: RepositoriesService,
                    useValue: repositoriesService
                }
            ]
        }).compile()

        controller = module.get<RepositoriesController>(RepositoriesController)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    it('should return scored repositories from the service', async () => {
        const query: RepositorySearchQuery = { language: 'TypeScript', createdAt: '2025-01-01' }
        const scoredRepos: RepositoryListResponseDto = {
            total_count: 1,
            incomplete_results: false,
            items: [
                {
                    id: 1,
                    full_name: 'owner/repo',
                    html_url: 'https://github.com/owner/repo',
                    description: 'desc',
                    language: 'TypeScript',
                    stargazers_count: 10,
                    forks_count: 2,
                    created_at: '2025-01-01T00:00:00Z',
                    updated_at: '2025-01-02T00:00:00Z',
                    score: 42
                }
            ]
        }

        repositoriesService.getScoredRepositories.mockResolvedValue(scoredRepos)

        const result: RepositoryListResponseDto = await controller.getScoredRepositories(query)

        expect(result).toEqual(scoredRepos)

        expect(repositoriesService.getScoredRepositories).toHaveBeenCalledWith(query)
    })
})
