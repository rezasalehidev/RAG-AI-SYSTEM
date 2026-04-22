import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private client: OpenAI | null = null;

  readonly baseUrl: string;
  readonly embeddingModel: string;
  readonly chatModel: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('GROQ_BASE_URL') ??
      'https://api.groq.com/openai/v1';
    this.embeddingModel =
      this.config.get<string>('GROQ_EMBEDDING_MODEL') ??
      'nomic-embed-text-v1.5';
    this.chatModel =
      this.config.get<string>('GROQ_CHAT_MODEL') ?? 'openai/gpt-oss-20b';
  }

  isConfigured(): boolean {
    return Boolean(this.config.get<string>('GROQ_API_KEY'));
  }

  getClient(): OpenAI {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'GROQ_API_KEY is missing. Copy .env.example to .env and add a Groq key.',
      );
    }

    this.client ??= new OpenAI({
      apiKey: this.config.get<string>('GROQ_API_KEY'),
      baseURL: this.baseUrl,
    });

    return this.client;
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const response = await this.getClient().embeddings.create({
      model: this.embeddingModel,
      input: texts,
      encoding_format: 'float',
    });

    return [...response.data]
      .sort((left, right) => left.index - right.index)
      .map((item) => {
        if (!Array.isArray(item.embedding)) {
          throw new Error('Groq returned a non-float embedding');
        }
        return item.embedding;
      });
  }

  async chat(system: string, user: string): Promise<string> {
    const completion = await this.getClient().chat.completions.create({
      model: this.chatModel,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const message = completion.choices[0]?.message;
    const content = message?.content?.trim();
    if (content) {
      return content;
    }

    this.logger.warn('Groq chat returned an empty message');
    return '';
  }
}
