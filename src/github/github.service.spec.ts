import { BadRequestException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { RepositoryListResponseDto } from 'src/shared/dto/repository.dto'

import { GithubAdapter } from './github.adapter'
import { GithubService } from './github.service'

describe('GithubService', () => {
    let githubService: GithubService
    let configMock: { get: jest.Mock }
    let adapterMock: { fetchRepositoriesFromApi: jest.Mock }

    beforeAll(() => {
        const methods = ['log', 'error', 'warn', 'debug'] as const

        for (const method of methods) {
            jest.spyOn(Logger.prototype, method).mockImplementation(jest.fn())
        }
    })

    beforeEach(async () => {
        configMock = { get: jest.fn().mockReturnValue('https://baseurl.com') }
        adapterMock = { fetchRepositoriesFromApi: jest.fn() }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GithubService,
                { provide: ConfigService, useValue: configMock },
                { provide: GithubAdapter, useValue: adapterMock }
            ]
        }).compile()

        githubService = module.get<GithubService>(GithubService)
    })

    it('should be defined', () => {
        expect(githubService).toBeDefined()
    })

    it('throws BadRequestException when base URL is missing', async () => {
        configMock.get.mockReturnValueOnce(undefined)
        await expect(
            githubService.searchRepositories({ language: 'TypeScript', createdAt: '2025-01-01' } as any)
        ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('builds URL and returns mapped repositories with score=0', async () => {
        adapterMock.fetchRepositoriesFromApi.mockResolvedValue({
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
                    updated_at: '2025-01-02T00:00:00Z'
                }
            ]
        })

        const result: RepositoryListResponseDto = await githubService.searchRepositories({
            language: 'TypeScript',
            createdAt: '2025-01-01'
        })

        expect(result).toEqual({
            total_count: 1,
            incomplete_results: false,
            items: [
                expect.objectContaining({
                    id: 1,
                    full_name: 'owner/repo',
                    html_url: 'https://github.com/owner/repo',
                    description: 'desc',
                    language: 'TypeScript',
                    stargazers_count: 10,
                    forks_count: 2,
                    created_at: '2025-01-01T00:00:00Z',
                    updated_at: '2025-01-02T00:00:00Z',
                    score: 0
                })
            ]
        })

        expect(adapterMock.fetchRepositoriesFromApi).toHaveBeenCalledWith(
            expect.stringContaining('/search/repositories?q=language:TypeScript&created:>2025-01-01')
        )
    })
})
