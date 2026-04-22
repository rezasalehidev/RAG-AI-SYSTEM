export type DocumentMetadata = Record<string, string>;

export interface StoredDocument {
  id: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
}

export interface StoredChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  index: number;
  content: string;
  metadata: DocumentMetadata;
  embedding: number[];
}

export interface PublicDocument {
  id: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  chunkCount: number;
}

export interface PublicChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  index: number;
  content: string;
  metadata: DocumentMetadata;
}

export interface RankedChunk extends PublicChunk {
  score: number;
}
