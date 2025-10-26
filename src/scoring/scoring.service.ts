import { Injectable } from '@nestjs/common'

import { RepositoryItemDto, RepositoryListResponseDto } from 'src/shared/dto/repository.dto'

import { METRICS, Metric } from './scoring-config'

@Injectable()
export class ScoringService {
    private readonly metrics: Metric[] = METRICS

    computeScoresForRepos(repositories: RepositoryListResponseDto): RepositoryListResponseDto {
        const items = repositories.items ?? []

        if (!items.length) return { ...repositories, items: [] }

        const maxStars: number = Math.max(...items.map((repository) => repository.stargazers_count))
        const maxForks: number = Math.max(...items.map((repository) => repository.forks_count))

        const itemsWithScores: RepositoryItemDto[] = items
            .map((repository) => ({
                ...repository,
                score: this.computePopularityScore(repository, maxStars, maxForks)
            }))
            .sort((a, b) => b.score - a.score)

        return {
            ...repositories,
            items: itemsWithScores
        }
    }

    private computePopularityScore(repository: RepositoryItemDto, maxStars: number, maxForks: number): number {
        const rawScore: number = this.metrics.reduce((acc, metric) => {
            return acc + metric.compute(repository, maxStars, maxForks) * metric.weight
        }, 0)

        return Math.round(this.sigmoid(rawScore) * 100)
    }

    private sigmoid(value: number): number {
        return 1 / (1 + Math.exp(-4 * (value - 0.5)))
    }
}
