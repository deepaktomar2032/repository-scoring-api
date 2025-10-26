import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

import { RestClient } from 'src/shared/utils/rest.client'

import { GithubAdapter } from './github.adapter'
import { GithubService } from './github.service'

@Module({
    imports: [HttpModule],
    providers: [GithubAdapter, GithubService, RestClient],
    exports: [GithubService, RestClient]
})
export class GithubModule {}
