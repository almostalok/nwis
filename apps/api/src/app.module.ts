import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { WellsModule } from './wells/wells.module';
import { FormationsModule } from './formations/formations.module';
import { EventsModule } from './events/events.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { DataQualityModule } from './data-quality/data-quality.module';
import { AuditModule } from './audit/audit.module';
import { StorageModule } from './storage/storage.module';
import { WitsmlModule } from './witsml/witsml.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { RealtimeModule } from './realtime/realtime.module';
import { HealthModule } from './health/health.module';
import { ModelsModule } from './models/models.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    AuthModule,
    WellsModule,
    FormationsModule,
    EventsModule,
    IngestionModule,
    DataQualityModule,
    AuditModule,
    StorageModule,
    WitsmlModule,
    KnowledgeModule,
    IntelligenceModule,
    RealtimeModule,
    HealthModule,
    ModelsModule,
    ReportsModule,
  ],
})
export class AppModule {}

