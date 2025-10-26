import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { GithubModule } from './github/github.module'
import { LoggerMiddleware } from './middlewares/logger.middleware'
import { RepositoriesModule } from './repositories/repositories.module'
import { ScoringModule } from './scoring/scoring.module'

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), RepositoriesModule, GithubModule, ScoringModule],
    providers: [LoggerMiddleware]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*')
    }
}
