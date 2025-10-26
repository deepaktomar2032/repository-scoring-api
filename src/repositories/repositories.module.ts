import { Module } from '@nestjs/common'

import { GithubModule } from 'src/github/github.module'
import { RateLimitGuard } from 'src/guards/rate-limit.guard'
import { ScoringService } from 'src/scoring/scoring.service'

import { RepositoriesController } from './repositories.controller'
import { RepositoriesService } from './repositories.service'

@Module({
    imports: [GithubModule],
    controllers: [RepositoriesController],
    providers: [RepositoriesService, ScoringService, RateLimitGuard]
})
export class RepositoriesModule {}
