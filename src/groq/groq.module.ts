import { Global, Module } from '@nestjs/common';
import { GroqService } from './groq.service.js';

@Global()
@Module({
  providers: [GroqService],
  exports: [GroqService],
})
export class GroqModule {}
