import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma } from '@nwis/database';
import { DocumentProcessingStatus } from '@nwis/types';
import Redis from 'ioredis';
import { KnowledgeService } from './knowledge.service';

export interface DocumentJob {
  jobId: string;
  documentId: string;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  lastAttemptAt?: Date;
  error?: string;
}

@Injectable()
export class DocumentQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DocumentQueueService.name);
  private redisClient: Redis | null = null;
  private isProcessing = false;
  private queueInterval: NodeJS.Timeout | null = null;
  private inMemoryQueue: DocumentJob[] = [];

  constructor(private readonly knowledgeService: KnowledgeService) {}

  async onModuleInit() {
    await this.initializeRedis();
    this.startWorker();
  }

  onModuleDestroy() {
    this.stopWorker();
  }

  private async initializeRedis() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        this.logger.log(`Attempting Redis connection for DocumentQueue: ${redisUrl}`);
        this.redisClient = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          connectTimeout: 3000,
          retryStrategy: () => null, // Do not infinite retry if unavailable in test/dev
        });

        this.redisClient.on('error', (err) => {
          this.logger.warn(`Redis connection unavailable: ${err.message}. Falling back to in-process async worker.`);
          this.redisClient = null;
        });

        await this.redisClient.ping();
        this.logger.log('Redis connected successfully for document queue pipeline.');
      } catch (err: any) {
        this.logger.warn(`Could not connect to Redis: ${err.message}. Operating in resilient in-process queue mode.`);
        this.redisClient = null;
      }
    } else {
      this.logger.log('No REDIS_URL configured; operating in resilient in-process async queue mode.');
    }
  }

  /**
   * Enqueues a document for async processing through the 8-state pipeline.
   */
  async enqueue(documentId: string): Promise<string> {
    const jobId = `doc-job-${documentId}-${Date.now()}`;
    const job: DocumentJob = {
      jobId,
      documentId,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
    };

    // Update document status to QUEUED
    await prisma.document.update({
      where: { id: documentId },
      data: {
        processingStatus: DocumentProcessingStatus.QUEUED,
        extractionStatus: 'QUEUED_FOR_PROCESSING',
      },
    });

    if (this.redisClient) {
      try {
        await this.redisClient.rpush('nwis:document:queue', JSON.stringify(job));
        this.logger.log(`Document job [${jobId}] pushed to Redis queue.`);
        return jobId;
      } catch (err: any) {
        this.logger.warn(`Failed to push to Redis: ${err.message}. Fallback to in-memory queue.`);
      }
    }

    this.inMemoryQueue.push(job);
    this.logger.log(`Document job [${jobId}] queued in-memory. Total in queue: ${this.inMemoryQueue.length}`);
    return jobId;
  }

  /**
   * Starts the background worker consumer.
   */
  startWorker() {
    this.queueInterval = setInterval(async () => {
      if (this.isProcessing) return;
      await this.processNextJob();
    }, 1000);
    this.logger.log('Document processing background worker started.');
  }

  stopWorker() {
    if (this.queueInterval) {
      clearInterval(this.queueInterval);
      this.queueInterval = null;
    }
    if (this.redisClient) {
      this.redisClient.disconnect();
      this.redisClient = null;
    }
    this.logger.log('Document processing background worker stopped.');
  }

  private async processNextJob() {
    let job: DocumentJob | null = null;

    if (this.redisClient) {
      try {
        const raw = await this.redisClient.lpop('nwis:document:queue');
        if (raw) job = JSON.parse(raw);
      } catch (err: any) {
        this.logger.warn(`Redis pop error: ${err.message}`);
      }
    }

    if (!job && this.inMemoryQueue.length > 0) {
      job = this.inMemoryQueue.shift() || null;
    }

    if (!job) return;

    this.isProcessing = true;
    job.attempts++;
    job.lastAttemptAt = new Date();

    this.logger.log(
      `Worker picked up job [${job.jobId}] for document [${job.documentId}] (Attempt ${job.attempts}/${job.maxAttempts})`,
    );

    try {
      await this.knowledgeService.processDocument(job.documentId);
      this.logger.log(`Worker completed job [${job.jobId}] successfully.`);
    } catch (err: any) {
      this.logger.error(`Job [${job.jobId}] failed on attempt ${job.attempts}: ${err.message}`);
      if (job.attempts < job.maxAttempts) {
        // Exponential backoff delay before re-enqueuing
        const delayMs = Math.pow(2, job.attempts) * 1000;
        this.logger.log(`Re-enqueuing job [${job.jobId}] with ${delayMs}ms delay.`);
        setTimeout(() => {
          this.inMemoryQueue.push(job!);
        }, delayMs);
      } else {
        // Dead-letter / Final failure state
        this.logger.error(`Job [${job.jobId}] exceeded max attempts. Marking document as FAILED.`);
        await prisma.document.update({
          where: { id: job.documentId },
          data: {
            processingStatus: DocumentProcessingStatus.FAILED,
            extractionStatus: `FAILED_AFTER_${job.maxAttempts}_ATTEMPTS: ${err.message}`,
          },
        }).catch(() => null);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  getQueueStatus() {
    return {
      connectedToRedis: !!this.redisClient,
      inMemoryQueueLength: this.inMemoryQueue.length,
      isWorkerActive: !!this.queueInterval,
      isCurrentlyProcessing: this.isProcessing,
    };
  }
}
