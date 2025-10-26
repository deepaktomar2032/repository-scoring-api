import { Inject, Injectable } from '@nestjs/common'

import { GithubService } from 'src/github/github.service'
import { ScoringService } from 'src/scoring/scoring.service'
import { RepositorySearchQuery } from 'src/shared/dto/repository-search.query.dto'
import { RepositoryListResponseDto } from 'src/shared/dto/repository.dto'

@Injectable()
export class RepositoriesService {
    @Inject() private readonly githubService: GithubService
    @Inject() private readonly scoringService: ScoringService

    async getScoredRepositories(query: RepositorySearchQuery): Promise<RepositoryListResponseDto> {
        const repositories: RepositoryListResponseDto = await this.githubService.searchRepositories(query)

        return this.scoringService.computeScoresForRepos(repositories)
    }
}
