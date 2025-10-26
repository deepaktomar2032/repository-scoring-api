import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiQuery, ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger'

import { RateLimitGuard } from 'src/guards/rate-limit.guard'
import {
    type RepositorySearchQuery,
    RepositorySearchQueryDtoClass,
    RepositorySearchQuerySchema
} from 'src/shared/dto/repository-search.query.dto'
import { type RepositoryListResponseDto, RepositoryListResponseDtoClass } from 'src/shared/dto/repository.dto'
import { ZodValidationPipe } from 'src/shared/utils/validation.pipe'

import { RepositoriesService } from './repositories.service'

@ApiTags('GitHub Repositories API')
@Controller('repositories')
@UseGuards(RateLimitGuard)
export class RepositoriesController {
    @Inject() private readonly repositoriesService: RepositoriesService

    @Get('score')
    @ApiQuery({ type: RepositorySearchQueryDtoClass })
    @ApiOkResponse({
        description: 'List of scored repositories',
        type: RepositoryListResponseDtoClass
    })
    @ApiTooManyRequestsResponse({
        description: 'Rate limit exceeded',
        schema: {
            example: {
                statusCode: 429,
                message: 'Rate limit exceeded. You can make up to 10 requests per minute.',
                limit: 10,
                reset: 1761327117
            }
        }
    })
    async getScoredRepositories(
        @Query(new ZodValidationPipe(RepositorySearchQuerySchema)) query: RepositorySearchQuery
    ): Promise<RepositoryListResponseDto> {
        return this.repositoriesService.getScoredRepositories(query)
    }
}
