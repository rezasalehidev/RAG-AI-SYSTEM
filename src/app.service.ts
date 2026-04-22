import { Injectable } from '@nestjs/common';
import { GroqService } from './groq/groq.service.js';
import { VectorStoreService } from './rag/vector-store.service.js';

@Injectable()
export class AppService {
  constructor(
    private readonly groq: GroqService,
    private readonly store: VectorStoreService,
  ) {}

  getHealth() {
    return {
      name: 'rag',
      status: 'ok',
      groqConfigured: this.groq.isConfigured(),
      documents: this.store.documentCount(),
      chunks: this.store.chunkCount(),
      models: {
        embeddings: this.groq.embeddingModel,
        chat: this.groq.chatModel,
      },
      endpoints: {
        health: 'GET /api/health',
        retrieve: 'POST /api/retrieve',
        ask: 'POST /api/ask',
        documents: 'GET /api/documents',
        chunks: 'GET /api/chunks',
        seed: 'POST /api/documents/seed',
      },
    };
  }
}
