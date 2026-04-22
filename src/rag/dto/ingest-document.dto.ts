import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class IngestDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}
