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
  ],
})
export class AppModule {}
