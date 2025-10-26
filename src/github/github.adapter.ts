import {
    ForbiddenException,
    HttpException,
    Inject,
    Injectable,
    InternalServerErrorException,
    Logger
} from '@nestjs/common'
import { ZodSafeParseResult } from 'zod'

import {
    type GithubRepositoriesSearchResponse as ExternalGitHubRepositories,
    GithubRepositoriesSearchResponseSchema as ExternalGitHubRepositoriesSchema
} from 'src/shared/dto/github-repositories-search.response'
import { ERRORS } from 'src/shared/utils/error'
import { RestClient } from 'src/shared/utils/rest.client'

@Injectable()
export class GithubAdapter {
    private readonly logger: Logger = new Logger(GithubAdapter.name)

    @Inject() private readonly restClient: RestClient

    async fetchRepositoriesFromApi(queryURL: string): Promise<ExternalGitHubRepositories> {
        try {
            const repositories: unknown = await this.restClient.get({ url: queryURL })

            const parsedResult: ZodSafeParseResult<ExternalGitHubRepositories> =
                ExternalGitHubRepositoriesSchema.safeParse(repositories)

            if (!parsedResult.success) {
                this.logger.error('GithubAdapter:fetchRepositoriesFromApi: ', parsedResult.error)
                throw new InternalServerErrorException('Something went wrong. Please try again.')
            }

            return parsedResult.data
        } catch (error: unknown) {
            if (error instanceof HttpException) {
                const status: number = error.getStatus()

                if (status === 403) {
                    this.logger.warn(
                        'GithubAdapter:fetchRepositoriesFromApi: GitHub API rate limit exceeded or forbidden'
                    )
                    throw new ForbiddenException('Please use auth token to increase usage limits.')
                }

                if (status === 429) {
                    this.logger.warn('GithubAdapter:fetchRepositoriesFromApi: Too many requests to GitHub API')
                    throw new HttpException(
                        { key: ERRORS.TOO_MANY_REQUESTS.key, message: ERRORS.TOO_MANY_REQUESTS.message },
                        ERRORS.TOO_MANY_REQUESTS.status
                    )
                }

                throw error
            }

            this.logger.error('GithubAdapter:fetchRepositoriesFromApi: ', error)
            throw new InternalServerErrorException('Something went wrong. Please try again.')
        }
    }
}
