import { Module } from '@nestjs/common';
import { WellsService } from './wells.service';
import { WellsController } from './wells.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WellsController],
  providers: [WellsService],
  exports: [WellsService],
})
export class WellsModule {}
