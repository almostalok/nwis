import { Module } from '@nestjs/common';
import { WitsmlService } from './witsml.service';
import { WitsmlController } from './witsml.controller';

@Module({
  controllers: [WitsmlController],
  providers: [WitsmlService],
  exports: [WitsmlService],
})
export class WitsmlModule {}
