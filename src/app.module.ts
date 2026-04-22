import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { GroqModule } from './groq/groq.module.js';
import { RagModule } from './rag/rag.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    GroqModule,
    RagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
