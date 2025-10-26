import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common'

import { RateLimitGuard } from 'src/guards/rate-limit.guard'
import { type RepositorySearchQuery, RepositorySearchQuerySchema } from 'src/shared/dto/repository-search.query.dto'
import { type RepositoryListResponseDto } from 'src/shared/dto/repository.dto'
import { ZodValidationPipe } from 'src/shared/utils/validation.pipe'

import { RepositoriesService } from './repositories.service'

@Controller('repositories')
@UseGuards(RateLimitGuard)
export class RepositoriesController {
    @Inject() private readonly repositoriesService: RepositoriesService

    @Get('score')
    async getScoredRepositories(
        @Query(new ZodValidationPipe(RepositorySearchQuerySchema)) query: RepositorySearchQuery
    ): Promise<RepositoryListResponseDto> {
        return this.repositoriesService.getScoredRepositories(query)
    }
}
