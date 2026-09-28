import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@nwis/database';
import {
  DataSourceType,
  IngestionJob,
  IngestionResult,
  IngestionError,
} from '@nwis/types';
import { CsvDataAdapter, JsonDataAdapter } from './adapters/data-adapters';
import { CsvDataParser, JsonDataParser } from './parsers/data-parsers';
import {
  WellDataMapper,
  WellDataNormalizer,
  WellDataValidator,
} from './pipeline/well-pipeline';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  async importData(body: {
    sourceName: string;
    sourceType: DataSourceType;
    entityType: string;
    payload: any;
  }): Promise<IngestionResult> {
    const { sourceName, sourceType, entityType, payload } = body;

    // 1. Create or get data source record
    let dataSource = await prisma.dataSource.findFirst({
      where: { name: sourceName },
    });
    if (!dataSource) {
      dataSource = await prisma.dataSource.create({
        data: {
          name: sourceName,
          type: sourceType,
          connectionType: 'API_IMPORT',
          active: true,
          description: `Ingestion data source for ${entityType}`,
        },
      });
    }

    // 2. Create Ingestion Job Record
    const jobRecord = await prisma.ingestionJobRecord.create({
      data: {
        sourceType,
        sourceIdentifier: sourceName,
        status: 'RUNNING',
        metadata: { entityType },
      },
    });

    try {
      // 3. Select Adapter & Parser
      let rawString = '';
      if (typeof payload === 'string') {
        const adapter = sourceType === DataSourceType.CSV ? new CsvDataAdapter() : new JsonDataAdapter();
        rawString = await adapter.fetchRawData({ rawContent: payload });
      } else {
        rawString = JSON.stringify(payload);
      }

      const parser = sourceType === DataSourceType.CSV ? new CsvDataParser() : new JsonDataParser();
      const rawRecords = parser.parse(rawString);

      const allErrors: IngestionError[] = [];
      const validEntities: any[] = [];

      // 4. Validate, Normalize, Map, and Insert
      if (entityType === 'WELL') {
        const validator = new WellDataValidator();
        const normalizer = new WellDataNormalizer();
        const mapper = new WellDataMapper();

        for (let i = 0; i < rawRecords.length; i++) {
          const raw = rawRecords[i];
          const normalized = normalizer.normalize(raw);
          const validation = validator.validate(normalized, i);

          if (!validation.isValid) {
            allErrors.push(...validation.errors);
            continue;
          }

          const dto = mapper.map(validation.record);

          // Upsert into database
          const savedWell = await prisma.well.upsert({
            where: { wellId: dto.wellId },
            update: {
              name: dto.name,
              field: dto.field,
              operator: dto.operator,
              wellType: dto.wellType,
              status: dto.status,
              spudDate: dto.spudDate ? new Date(dto.spudDate) : null,
              completionDate: dto.completionDate ? new Date(dto.completionDate) : null,
              totalDepth: dto.totalDepth,
              latitude: dto.latitude,
              longitude: dto.longitude,
              qualityStatus: dto.qualityStatus,
              qualityScore: dto.qualityScore,
              sourceId: dataSource.id,
            },
            create: {
              wellId: dto.wellId,
              name: dto.name,
              field: dto.field,
              operator: dto.operator,
              wellType: dto.wellType,
              status: dto.status,
              spudDate: dto.spudDate ? new Date(dto.spudDate) : null,
              completionDate: dto.completionDate ? new Date(dto.completionDate) : null,
              totalDepth: dto.totalDepth,
              latitude: dto.latitude,
              longitude: dto.longitude,
              qualityStatus: dto.qualityStatus,
              qualityScore: dto.qualityScore,
              sourceId: dataSource.id,
            },
          });

          validEntities.push(savedWell);
        }
      }

      const finalStatus =
        allErrors.length === 0
          ? 'COMPLETED'
          : validEntities.length > 0
          ? 'PARTIAL'
          : 'FAILED';

      // 5. Update Job Record
      await prisma.ingestionJobRecord.update({
        where: { id: jobRecord.id },
        data: {
          status: finalStatus,
          totalRecords: rawRecords.length,
          processedRecords: rawRecords.length,
          validRecords: validEntities.length,
          invalidRecords: allErrors.length,
          errors: allErrors.slice(0, 50) as any,
          completedAt: new Date(),
        },
      });

      return {
        success: finalStatus !== 'FAILED',
        jobId: jobRecord.id,
        processedCount: rawRecords.length,
        validCount: validEntities.length,
        errorCount: allErrors.length,
        errors: allErrors,
        data: validEntities,
      };
    } catch (err: any) {
      this.logger.error(`Ingestion Job ${jobRecord.id} failed: ${err.message}`, err.stack);
      await prisma.ingestionJobRecord.update({
        where: { id: jobRecord.id },
        data: {
          status: 'FAILED',
          errors: [{ message: err.message, severity: 'ERROR' }] as any,
          completedAt: new Date(),
        },
      });

      return {
        success: false,
        jobId: jobRecord.id,
        processedCount: 0,
        validCount: 0,
        errorCount: 1,
        errors: [{ message: err.message, severity: 'ERROR' }],
      };
    }
  }

  async getJobs(): Promise<IngestionJob[]> {
    const jobs = await prisma.ingestionJobRecord.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
    });

    return jobs.map((j) => ({
      id: j.id,
      sourceType: j.sourceType as any,
      sourceIdentifier: j.sourceIdentifier,
      status: j.status as any,
      totalRecords: j.totalRecords,
      processedRecords: j.processedRecords,
      validRecords: j.validRecords,
      invalidRecords: j.invalidRecords,
      errors: (j.errors as any) || [],
      startedAt: j.startedAt,
      completedAt: j.completedAt,
      metadata: (j.metadata as any) || {},
    }));
  }
}
