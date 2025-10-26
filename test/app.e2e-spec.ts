import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { App } from 'supertest/types'

import { AppModule } from '../src/app.module'
import { RestClient } from '../src/shared/utils/rest.client'

describe('Repositories (e2e)', () => {
    let app: INestApplication<App>
    let restClient: { get: jest.Mock }

    beforeEach(async () => {
        process.env.GITHUB_API_BASE_URL = 'https://api.github.com'

        restClient = {
            get: jest.fn().mockResolvedValue({
                total_count: 1,
                incomplete_results: false,
                items: [
                    {
                        id: 1,
                        full_name: 'owner/repo',
                        html_url: 'https://github.com/owner/repo',
                        description: 'demo repo',
                        language: 'TypeScript',
                        stargazers_count: 10,
                        forks_count: 2,
                        created_at: '2025-01-01T00:00:00Z',
                        updated_at: '2025-01-02T00:00:00Z'
                    }
                ]
            })
        }

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        })
            .overrideProvider(RestClient)
            .useValue(restClient)
            .compile()

        app = moduleFixture.createNestApplication()
        await app.init()
    })

    afterEach(async () => {
        await app.close()
    })

    it('GET /repositories/score returns scored list response', async () => {
        const query = { language: 'TypeScript', created_at: '2025-01-01' }

        const res = await request(app.getHttpServer()).get('/repositories/score').query(query).expect(200)

        const body = res.body

        expect(body).toEqual(
            expect.objectContaining({
                total_count: expect.any(Number),
                incomplete_results: expect.any(Boolean),
                items: expect.any(Array)
            })
        )

        const queryDate: Date = new Date(query.created_at)

        for (const item of body.items) {
            expect(item).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    full_name: expect.any(String),
                    html_url: expect.stringMatching(/^https:\/\/github\.com\//),
                    description: expect.anything(),
                    language: query.language,
                    stargazers_count: expect.any(Number),
                    forks_count: expect.any(Number),
                    updated_at: expect.stringMatching(/^20\d{2}-\d{2}-\d{2}/),
                    score: expect.any(Number)
                })
            )

            const createdAt: Date = new Date(item.created_at)
            expect(createdAt.getTime()).toBeGreaterThanOrEqual(queryDate.getTime())
        }
    })

    it('GET /repositories/score returns 400 for missing query', async () => {
        await request(app.getHttpServer()).get('/repositories/score').expect(400)
    })

    it('GET /repositories/score enforces per-minute rate limit', async () => {
        // 10 allowed, 11th should fail
        for (let i = 0; i < 10; ++i) {
            await request(app.getHttpServer())
                .get('/repositories/score')
                .query({ language: 'TypeScript', created_at: '2025-01-01' })
                .expect(200)
        }

        const res = await request(app.getHttpServer())
            .get('/repositories/score')
            .query({ language: 'TypeScript', created_at: '2025-01-01' })
            .expect(429)

        expect(res.body).toEqual(
            expect.objectContaining({
                message: expect.stringContaining('Rate limit exceeded'),
                limit: 10,
                reset: expect.any(Number)
            })
        )
    })
})
