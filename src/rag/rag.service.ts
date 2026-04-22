import { Injectable } from '@nestjs/common';
import { GroqService } from '../groq/groq.service.js';
import { RankedChunk } from './stored-chunk.js';
import { VectorStoreService } from './vector-store.service.js';

const SYSTEM_PROMPT =
  'You answer using only the supplied LumenCloud knowledge snippets. Cite sources as [n] matching the snippet numbers. If the snippets do not contain the answer, say you do not know. Keep the reply short.';

@Injectable()
export class RagService {
  constructor(
    private readonly groq: GroqService,
    private readonly store: VectorStoreService,
  ) {}

  async retrieve(query: string, limit = 4): Promise<RankedChunk[]> {
    const [embedding] = await this.groq.embed([query]);
    return this.store.search(embedding, limit);
  }

  async ask(question: string, limit = 4) {
    const matches = await this.retrieve(question, limit);
    const context = matches
      .map(
        (match, index) =>
          `[${index + 1}] ${match.documentTitle} (chunk ${match.index})\n${match.content}`,
      )
      .join('\n\n');

    const answer = await this.groq.chat(
      SYSTEM_PROMPT,
      `Question: ${question}\n\nSnippets:\n${context || 'None'}`,
    );

    return {
      question,
      answer,
      sources: matches,
    };
  }
}
