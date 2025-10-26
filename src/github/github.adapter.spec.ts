import { InternalServerErrorException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { type GithubRepositoriesSearchResponse as ExternalGitHubRepositories } from 'src/shared/dto/github-repositories-search.response'
import { RestClient } from 'src/shared/utils/rest.client'

import { GithubAdapter } from './github.adapter'

describe('GithubAdapter', () => {
    let githubAdapter: GithubAdapter
    let restClientMock: { get: jest.Mock }

    beforeAll(() => {
        const methods = ['log', 'error', 'warn', 'debug'] as const

        for (const method of methods) {
            jest.spyOn(Logger.prototype, method).mockImplementation(jest.fn())
        }
    })

    beforeEach(async () => {
        restClientMock = { get: jest.fn() }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GithubAdapter,
                {
                    provide: RestClient,
                    useValue: restClientMock
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: (key: string) =>
                            (({ GITHUB_API_BASE_URL: 'https://baseurl.com' }) as Record<string, string>)[key]
                    }
                }
            ]
        }).compile()

        githubAdapter = module.get<GithubAdapter>(GithubAdapter)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(githubAdapter).toBeDefined()
    })

    it('should return parsed data when response is valid', async () => {
        const validResponse: ExternalGitHubRepositories = {
            total_count: 1,
            incomplete_results: false,
            items: [
                {
                    id: 1,
                    full_name: 'owner/repo',
                    html_url: 'https://github.com/owner/repo',
                    description: 'demo repo',
                    language: 'TypeScript',
                    stargazers_count: 10,
                    forks_count: 2,
                    created_at: '2025-01-01T00:00:00Z',
                    updated_at: '2025-01-02T00:00:00Z'
                }
            ]
        }

        restClientMock.get.mockResolvedValue(validResponse)

        const result: ExternalGitHubRepositories = await githubAdapter.fetchRepositoriesFromApi(
            'https://baseurl.com?created=2025-01-01&language=TypeScript'
        )

        expect(result).toEqual(validResponse)
        expect(restClientMock.get).toHaveBeenCalledWith({
            url: 'https://baseurl.com?created=2025-01-01&language=TypeScript'
        })
    })

    it('should throw InternalServerError when validation fails', async () => {
        const invalidResponse = {
            total_count: 'invalid_number',
            incomplete_results: false,
            items: []
        }

        restClientMock.get.mockResolvedValue(invalidResponse)

        await expect(
            githubAdapter.fetchRepositoriesFromApi('https://baseurl.com?created=2025-01-01&language=TypeScript')
        ).rejects.toBeInstanceOf(InternalServerErrorException)
    })

    it('should throw InternalServerError when client rejects', async () => {
        restClientMock.get.mockRejectedValue(new Error('network'))

        await expect(githubAdapter.fetchRepositoriesFromApi('https://baseurl.com')).rejects.toBeInstanceOf(
            InternalServerErrorException
        )
    })
})
