import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { GithubModule } from './github/github.module'
import { RepositoriesModule } from './repositories/repositories.module'
import { ScoringModule } from './scoring/scoring.module'

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), RepositoriesModule, GithubModule, ScoringModule]
})
export class AppModule {}
