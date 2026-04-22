import { ChunkerService } from './chunker.service.js';

describe('ChunkerService', () => {
  const chunker = new ChunkerService();

  it('returns nothing for blank text', () => {
    expect(chunker.split('   \n')).toEqual([]);
  });

  it('keeps a short document as one chunk', () => {
    const chunks = chunker.split('LumenCloud nano instances have 1 vCPU.');
    expect(chunks).toHaveLength(1);
    expect(chunks[0].index).toBe(0);
    expect(chunks[0].content).toContain('nano instances');
  });

  it('splits a long document into overlapping chunks', () => {
    const paragraph =
      'LumenCloud virtual machines are called instances. The nano size is for staging. ';
    const text = Array.from({ length: 20 }, () => paragraph).join('');
    const chunks = chunker.split(text, { maxChars: 200, overlap: 40 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].content.length).toBeLessThanOrEqual(200);
    expect(chunks[1].content.length).toBeGreaterThan(0);
    expect(chunks[0].content.slice(-20)).toEqual(expect.stringMatching(/\S/));
  });
});
