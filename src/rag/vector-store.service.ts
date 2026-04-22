import { Injectable } from '@nestjs/common';
import { cosineSimilarity } from '../common/cosine.js';
import {
  PublicChunk,
  PublicDocument,
  RankedChunk,
  StoredChunk,
  StoredDocument,
} from './stored-chunk.js';

@Injectable()
export class VectorStoreService {
  private readonly documents = new Map<string, StoredDocument>();
  private readonly chunks = new Map<string, StoredChunk>();

  upsertDocument(
    document: StoredDocument,
    chunks: StoredChunk[],
  ): PublicDocument {
    this.deleteDocument(document.id);
    this.documents.set(document.id, document);
    for (const chunk of chunks) {
      this.chunks.set(chunk.id, chunk);
    }
    return this.toPublicDocument(document);
  }

  getDocument(id: string): StoredDocument | undefined {
    return this.documents.get(id);
  }

  getPublicDocument(id: string): PublicDocument | undefined {
    const document = this.documents.get(id);
    return document ? this.toPublicDocument(document) : undefined;
  }

  listDocuments(): PublicDocument[] {
    return [...this.documents.values()].map((document) =>
      this.toPublicDocument(document),
    );
  }

  listChunks(): PublicChunk[] {
    return [...this.chunks.values()]
      .sort((left, right) => {
        if (left.documentId === right.documentId) {
          return left.index - right.index;
        }
        return left.documentTitle.localeCompare(right.documentTitle);
      })
      .map((chunk) => this.toPublicChunk(chunk));
  }

  deleteDocument(id: string): boolean {
    const existed = this.documents.delete(id);
    for (const [chunkId, chunk] of this.chunks) {
      if (chunk.documentId === id) {
        this.chunks.delete(chunkId);
      }
    }
    return existed;
  }

  clear(): void {
    this.documents.clear();
    this.chunks.clear();
  }

  documentCount(): number {
    return this.documents.size;
  }

  chunkCount(): number {
    return this.chunks.size;
  }

  search(queryEmbedding: number[], limit: number): RankedChunk[] {
    return [...this.chunks.values()]
      .map((chunk) => ({
        ...this.toPublicChunk(chunk),
        score: Number(
          cosineSimilarity(queryEmbedding, chunk.embedding).toFixed(4),
        ),
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, limit);
  }

  private toPublicDocument(document: StoredDocument): PublicDocument {
    let chunkCount = 0;
    for (const chunk of this.chunks.values()) {
      if (chunk.documentId === document.id) {
        chunkCount += 1;
      }
    }

    return {
      id: document.id,
      title: document.title,
      content: document.content,
      metadata: document.metadata,
      chunkCount,
    };
  }

  private toPublicChunk(chunk: StoredChunk): PublicChunk {
    return {
      id: chunk.id,
      documentId: chunk.documentId,
      documentTitle: chunk.documentTitle,
      index: chunk.index,
      content: chunk.content,
      metadata: chunk.metadata,
    };
  }
}
