import { Test, TestingModule } from '@nestjs/testing';
import { GroqService } from '../groq/groq.service.js';
import { ChunkerService } from './chunker.service.js';
import { IngestService } from './ingest.service.js';
import { RagService } from './rag.service.js';
import { VectorStoreService } from './vector-store.service.js';

describe('RagService', () => {
  let rag: RagService;
  let ingest: IngestService;
  let store: VectorStoreService;

  const groq = {
    embed: async (texts: string[]) =>
      texts.map((text) =>
        text.toLowerCase().includes('spot') ||
        text.toLowerCase().includes('instance')
          ? [1, 0]
          : [0, 1],
      ),
    chat: async () => 'Do not run stateful databases on spot instances. [1]',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagService,
        IngestService,
        ChunkerService,
        VectorStoreService,
        { provide: GroqService, useValue: groq },
      ],
    }).compile();

    rag = module.get(RagService);
    ingest = module.get(IngestService);
    store = module.get(VectorStoreService);
    store.clear();
  });

  it('retrieves the closest chunk first', async () => {
    await ingest.addMany([
      {
        title: 'Compute instances',
        content:
          'Spot instances can be reclaimed. Do not run databases on spot.',
      },
      {
        title: 'Billing',
        content: 'Monthly invoices are emailed to billing admins as PDF.',
      },
    ]);

    const results = await rag.retrieve(
      'can I put a database on a cheap reclaimed instance',
      2,
    );

    expect(results[0].documentTitle).toBe('Compute instances');
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });

  it('asks the model using retrieved snippets', async () => {
    await ingest.addDocument({
      title: 'Compute instances',
      content: 'Spot instances can be reclaimed. Do not run databases on spot.',
    });

    const result = await rag.ask('Can I run a database on spot?');

    expect(result.answer).toContain('spot');
    expect(result.sources[0].documentTitle).toBe('Compute instances');
  });
});
