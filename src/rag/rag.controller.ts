import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AskDto } from './dto/ask.dto.js';
import { RetrieveDto } from './dto/retrieve.dto.js';
import { IngestService } from './ingest.service.js';
import { RagService } from './rag.service.js';

@Controller()
export class RagController {
  constructor(
    private readonly rag: RagService,
    private readonly ingest: IngestService,
  ) {}

  @Post('retrieve')
  retrieve(@Body() dto: RetrieveDto) {
    return this.rag.retrieve(dto.query, dto.limit);
  }

  @Post('ask')
  ask(@Body() dto: AskDto) {
    return this.rag.ask(dto.question, dto.limit);
  }

  @Get('documents')
  listDocuments() {
    return this.ingest.listDocuments();
  }

  @Get('documents/:id')
  getDocument(@Param('id') id: string) {
    return this.ingest.getDocument(id);
  }

  @Get('chunks')
  listChunks() {
    return this.ingest.listChunks();
  }
}
