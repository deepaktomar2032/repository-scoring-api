import { INestApplication, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger'
import { cleanupOpenApiDoc } from 'nestjs-zod'

import { AppModule } from './app.module'

const logger: Logger = new Logger('Bootstrap Module')

async function bootstrap() {
    try {
        const app: INestApplication = await NestFactory.create(AppModule)

        app.enableCors({
            origin: true,
            methods: ['GET'],
            allowedHeaders: ['Content-Type', 'Accept', 'Origin'],
            credentials: false
        })

        const configService: ConfigService = app.get(ConfigService)

        const PORT: number = configService.get<number>('PORT', 3000)
        const nodeEnv: string = configService.get<string>('NODE_ENV', 'development')
        const isProduction: boolean = nodeEnv === 'production'

        logger.log(`Server is up & running on Port: ${PORT}`)
        logger.log(`API is ready to use: http://localhost:${PORT}`)

        if (!isProduction) {
            initializeSwagger(app)
            logger.log(`API Docs are available on: http://localhost:${PORT}/api-docs`)
        }

        await app.listen(PORT)
    } catch (error: unknown) {
        logger.error('bootstrap: ', error)
        process.exit(1)
    }
}

const initializeSwagger = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('GitHub Repository Scoring API')
        .setDescription('GitHub Repository Scoring Service API documentation')
        .setVersion('1.0.0')
        .build()

    const rawDocument: OpenAPIObject = SwaggerModule.createDocument(app, config)
    const document: OpenAPIObject = cleanupOpenApiDoc(rawDocument)
    SwaggerModule.setup('api-docs', app, document)
}

bootstrap()
