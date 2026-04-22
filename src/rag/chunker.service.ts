import { Injectable } from '@nestjs/common';

export interface TextChunk {
  index: number;
  content: string;
}

export interface ChunkOptions {
  maxChars?: number;
  overlap?: number;
}

const DEFAULT_MAX_CHARS = 650;
const DEFAULT_OVERLAP = 80;

@Injectable()
export class ChunkerService {
  split(text: string, options: ChunkOptions = {}): TextChunk[] {
    const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;
    const overlap = options.overlap ?? DEFAULT_OVERLAP;
    const cleaned = text.replace(/\r\n/g, '\n').trim();

    if (!cleaned) {
      return [];
    }

    return this.window(cleaned, maxChars, overlap).map((content, index) => ({
      index,
      content,
    }));
  }

  private window(text: string, maxChars: number, overlap: number): string[] {
    if (text.length <= maxChars) {
      return [text];
    }

    const parts: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = Math.min(start + maxChars, text.length);

      if (end < text.length) {
        end = this.findBreak(text, start, end);
      }

      if (end <= start) {
        end = Math.min(start + maxChars, text.length);
      }

      const slice = text.slice(start, end).trim();
      if (slice) {
        parts.push(slice);
      }

      if (end >= text.length) {
        break;
      }

      const nextStart = end - overlap;
      start = nextStart > start ? nextStart : end;
    }

    return parts;
  }

  private findBreak(text: string, start: number, end: number): number {
    const slice = text.slice(start, end);
    const minKeep = Math.floor(slice.length * 0.4);

    const paragraph = slice.lastIndexOf('\n\n');
    if (paragraph >= minKeep) {
      return start + paragraph;
    }

    const sentence = Math.max(
      slice.lastIndexOf('. '),
      slice.lastIndexOf('? '),
      slice.lastIndexOf('! '),
    );
    if (sentence >= minKeep) {
      return start + sentence + 1;
    }

    const space = slice.lastIndexOf(' ');
    if (space >= minKeep) {
      return start + space;
    }

    return end;
  }
}
