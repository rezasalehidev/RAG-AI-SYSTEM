import { Body, Controller, Delete, Post } from '@nestjs/common';
import { SeedService } from '../seed/seed.service.js';
import { IngestDocumentDto } from './dto/ingest-document.dto.js';
import { IngestService } from './ingest.service.js';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly ingest: IngestService,
    private readonly seedService: SeedService,
  ) {}

  @Post()
  create(@Body() dto: IngestDocumentDto) {
    return this.ingest.addDocument(dto);
  }

  @Post('seed')
  seed() {
    return this.seedService.seed(true);
  }

  @Delete()
  clear() {
    return this.ingest.clear();
  }
}
