import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { WellsModule } from '../wells/wells.module';
import { DataQualityModule } from '../data-quality/data-quality.module';

@Module({
  imports: [WellsModule, DataQualityModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
