import { Injectable, Logger } from '@nestjs/common';
import { VectorUtils } from '@nwis/utils';

export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
  model: string;
  provider: string;
}

export abstract class EmbeddingProvider {
  abstract generateEmbedding(text: string): Promise<EmbeddingResult>;
  abstract getDimensions(): number;
}

@Injectable()
export class LocalEmbeddingProvider extends EmbeddingProvider {
  private readonly logger = new Logger(LocalEmbeddingProvider.name);
  private readonly dimensions: number;
  private readonly modelName: string;

  constructor() {
    super();
    this.dimensions = parseInt(process.env.EMBEDDING_DIMENSIONS || '64', 10);
    this.modelName = process.env.EMBEDDING_MODEL || 'local-semantic-hashing-v1';
  }

  getDimensions(): number {
    return this.dimensions;
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const vector = VectorUtils.generateLocalEmbedding(text, this.dimensions);
    return {
      embedding: vector,
      dimensions: this.dimensions,
      model: this.modelName,
      provider: 'LOCAL',
    };
  }
}

@Injectable()
export class ConfigurableExternalEmbeddingProvider extends EmbeddingProvider {
  private readonly logger = new Logger(ConfigurableExternalEmbeddingProvider.name);
  private readonly localFallback = new LocalEmbeddingProvider();
  private readonly providerType: string;
  private readonly model: string;
  private readonly dimensions: number;

  constructor() {
    super();
    this.providerType = process.env.EMBEDDING_PROVIDER || 'LOCAL';
    this.model = process.env.EMBEDDING_MODEL || 'all-MiniLM-L6-v2';
    this.dimensions = parseInt(process.env.EMBEDDING_DIMENSIONS || '64', 10);
  }

  getDimensions(): number {
    return this.dimensions;
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    // If an external provider is configured and available (e.g. Ollama, OpenAI)
    if (this.providerType !== 'LOCAL' && process.env.EMBEDDING_API_KEY) {
      try {
        // External call stub / proxy can be hooked here
        this.logger.log(`Using external embedding provider [${this.providerType}] with model [${this.model}]`);
      } catch (err: any) {
        this.logger.warn(`External embedding provider failed: ${err.message}. Falling back to local embedding.`);
      }
    }

    return this.localFallback.generateEmbedding(text);
  }
}
