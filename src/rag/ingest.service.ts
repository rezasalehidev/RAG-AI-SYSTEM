import { Injectable, NotFoundException } from '@nestjs/common';
import { GroqService } from '../groq/groq.service.js';
import { ChunkerService } from './chunker.service.js';
import { IngestDocumentDto } from './dto/ingest-document.dto.js';
import { PublicDocument, StoredChunk, StoredDocument } from './stored-chunk.js';
import { VectorStoreService } from './vector-store.service.js';

@Injectable()
export class IngestService {
  constructor(
    private readonly groq: GroqService,
    private readonly chunker: ChunkerService,
    private readonly store: VectorStoreService,
  ) {}

  listDocuments(): PublicDocument[] {
    return this.store.listDocuments();
  }

  listChunks() {
    return this.store.listChunks();
  }

  getDocument(id: string): PublicDocument {
    const document = this.store.getPublicDocument(id);
    if (!document) {
      throw new NotFoundException(`Document ${id} was not found`);
    }

    return document;
  }

  async addDocument(dto: IngestDocumentDto): Promise<PublicDocument> {
    const [document] = await this.addMany([
      {
        title: dto.title,
        content: dto.content,
        metadata: dto.metadata,
      },
    ]);
    return document;
  }

  async addMany(
    items: Array<{
      id?: string;
      title: string;
      content: string;
      metadata?: Record<string, string>;
    }>,
  ): Promise<PublicDocument[]> {
    if (items.length === 0) {
      return [];
    }

    const prepared = items.map((item) => {
      const document: StoredDocument = {
        id: item.id ?? crypto.randomUUID(),
        title: item.title,
        content: item.content,
        metadata: item.metadata ?? {},
      };
      const pieces = this.chunker.split(
        this.toEmbedText(item.title, item.content),
      );
      return { document, pieces };
    });

    const embeddings = await this.groq.embed(
      prepared.flatMap((item) => item.pieces.map((piece) => piece.content)),
    );

    let offset = 0;
    return prepared.map(({ document, pieces }) => {
      const chunks: StoredChunk[] = pieces.map((piece, index) => ({
        id: `${document.id}:${piece.index}`,
        documentId: document.id,
        documentTitle: document.title,
        index: piece.index,
        content: piece.content,
        metadata: document.metadata,
        embedding: embeddings[offset + index],
      }));
      offset += pieces.length;
      return this.store.upsertDocument(document, chunks);
    });
  }

  clear(): { deletedDocuments: number; deletedChunks: number } {
    const deletedDocuments = this.store.documentCount();
    const deletedChunks = this.store.chunkCount();
    this.store.clear();
    return { deletedDocuments, deletedChunks };
  }

  private toEmbedText(title: string, content: string): string {
    return `${title}\n\n${content}`;
  }
}
