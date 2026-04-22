import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GroqService } from '../groq/groq.service.js';
import { IngestService } from '../rag/ingest.service.js';
import { VectorStoreService } from '../rag/vector-store.service.js';
import { LUMENCLOUD_SEED } from './lumencloud.seed.js';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly groq: GroqService,
    private readonly ingest: IngestService,
    private readonly store: VectorStoreService,
  ) {}

  async onModuleInit() {
    const autoSeed = this.config.get<string>('AUTO_SEED') !== 'false';
    if (!autoSeed) {
      this.logger.log('AUTO_SEED=false, skipping demo seed');
      return;
    }

    if (!this.groq.isConfigured()) {
      this.logger.warn(
        'GROQ_API_KEY is missing. Seed data will load after you add a key and POST /api/documents/seed',
      );
      return;
    }

    await this.seed(false);
  }

  async seed(force: boolean) {
    if (!force && this.store.documentCount() > 0) {
      return {
        seeded: false,
        reason: 'store already has documents',
        count: this.store.documentCount(),
        chunks: this.store.chunkCount(),
      };
    }

    this.store.clear();
    const documents = await this.ingest.addMany(LUMENCLOUD_SEED);
    this.logger.log(
      `Seeded ${documents.length} LumenCloud documents (${this.store.chunkCount()} chunks)`,
    );

    return {
      seeded: true,
      count: documents.length,
      chunks: this.store.chunkCount(),
      documents,
    };
  }
}
