import { Module } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';

@Module({
  providers: [
    {
      provide: 'STORAGE_PROVIDER',
      useClass: LocalStorageService,
    },
    LocalStorageService,
  ],
  exports: ['STORAGE_PROVIDER', LocalStorageService],
})
export class StorageModule {}
