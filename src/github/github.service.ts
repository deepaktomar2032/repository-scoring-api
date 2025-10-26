import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { type GithubRepositoriesSearchResponse } from 'src/shared/dto/github-repositories-search.response'
import { type RepositorySearchQuery } from 'src/shared/dto/repository-search.query.dto'
import { type RepositoryListResponseDto } from 'src/shared/dto/repository.dto'
import * as CONSTANTS from 'src/shared/utils/constants'
import { UrlBuilder } from 'src/shared/utils/url-builder'

import { GithubAdapter } from './github.adapter'

@Injectable()
export class GithubService {
    private readonly logger: Logger = new Logger(GithubService.name)

    @Inject() private readonly configService: ConfigService
    @Inject() private readonly githubAdapter: GithubAdapter

    async searchRepositories(query: RepositorySearchQuery): Promise<RepositoryListResponseDto> {
        const repoBaseUrl: string | undefined = this.configService.get<string>('GITHUB_API_BASE_URL')

        if (!repoBaseUrl) {
            this.logger.error('GitHub API Base URL is not defined')
            throw new BadRequestException('GitHub API Base URL is not defined in the configuration')
        }

        const repoSearchRepositoriesEndpoint: string = `${repoBaseUrl}/search/repositories`

        const queryURL: string = this.buildSearchQueryUrl(repoSearchRepositoriesEndpoint, query)

        const gitHubRepositories: GithubRepositoriesSearchResponse =
            await this.githubAdapter.fetchRepositoriesFromApi(queryURL)

        const { total_count, incomplete_results, items } = gitHubRepositories

        const mappedRepositories: RepositoryListResponseDto = {
            total_count,
            incomplete_results,
            items: items.map((repository) => ({
                ...repository,
                score: 0
            }))
        }

        return mappedRepositories
    }

    private buildSearchQueryUrl(baseUrl: string, requestQuery: RepositorySearchQuery): string {
        const urlBuilder: UrlBuilder = new UrlBuilder(baseUrl)

        if (requestQuery.language) urlBuilder.addLanguageFilter(CONSTANTS.LANGUAGE_QUERY_KEY, requestQuery.language)

        if (requestQuery.createdAt) urlBuilder.addCreatedFilter(CONSTANTS.CREATED_QUERY_KEY, requestQuery.createdAt)

        return urlBuilder.build()
    }
}
