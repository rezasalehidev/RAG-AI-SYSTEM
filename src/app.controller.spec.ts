import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { GroqService } from './groq/groq.service.js';
import { VectorStoreService } from './rag/vector-store.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        VectorStoreService,
        {
          provide: GroqService,
          useValue: {
            isConfigured: () => false,
            embeddingModel: 'nomic-embed-text-v1.5',
            chatModel: 'openai/gpt-oss-20b',
          },
        },
      ],
    }).compile();

    appController = app.get(AppController);
  });

  it('returns rag health', () => {
    const health = appController.getHealth();
    expect(health.status).toBe('ok');
    expect(health.name).toBe('rag');
    expect(health.documents).toBe(0);
    expect(health.chunks).toBe(0);
  });
});
