import { RepositoryItemDto } from 'src/shared/dto/repository.dto'

export type MetricFn = (repository: RepositoryItemDto, maxStars: number, maxForks: number) => number

export interface Metric {
    name: string
    weight: number
    compute: MetricFn
}

// Metrics configuration
export const METRICS: Metric[] = [
    {
        name: 'stars',
        weight: 0.5,
        compute: (repository, maxStars) => (maxStars ? repository.stargazers_count / maxStars : 0)
    },
    {
        name: 'forks',
        weight: 0.3,
        compute: (repository, _maxStars, maxForks) => (maxForks ? repository.forks_count / maxForks : 0)
    },
    {
        name: 'recency',
        weight: 0.2,
        compute: (repository) => {
            const daysSinceUpdate: number =
                (Date.now() - new Date(repository.updated_at).getTime()) / (1000 * 60 * 60 * 24)
            const tau: number = 180
            return Math.exp(-daysSinceUpdate / tau)
        }
    }
]
