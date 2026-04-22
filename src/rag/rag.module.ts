import { Module } from '@nestjs/common';
import { SeedService } from '../seed/seed.service.js';
import { ChunkerService } from './chunker.service.js';
import { DocumentsController } from './documents.controller.js';
import { IngestService } from './ingest.service.js';
import { RagController } from './rag.controller.js';
import { RagService } from './rag.service.js';
import { VectorStoreService } from './vector-store.service.js';

@Module({
  controllers: [RagController, DocumentsController],
  providers: [
    ChunkerService,
    VectorStoreService,
    IngestService,
    RagService,
    SeedService,
  ],
  exports: [VectorStoreService, IngestService, RagService, SeedService],
})
export class RagModule {}
