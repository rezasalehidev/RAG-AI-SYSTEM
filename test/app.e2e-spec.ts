import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { GroqService } from './../src/groq/groq.service.js';
import { SeedService } from './../src/seed/seed.service.js';

describe('RAG API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GroqService)
      .useValue({
        isConfigured: () => false,
        embeddingModel: 'nomic-embed-text-v1.5',
        chatModel: 'openai/gpt-oss-20b',
        embed: async () => {
          throw new Error('not used in health e2e');
        },
        chat: async () => '',
      })
      .overrideProvider(SeedService)
      .useValue({
        onModuleInit: async () => undefined,
        seed: async () => ({
          seeded: false,
          count: 0,
          chunks: 0,
          documents: [],
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  it('GET /api/health', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((response) => {
        expect(response.body.status).toBe('ok');
        expect(response.body.name).toBe('rag');
        expect(response.body.groqConfigured).toBe(false);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
