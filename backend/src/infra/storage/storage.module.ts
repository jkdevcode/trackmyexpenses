import { Module } from '@nestjs/common';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { StorageService } from './storage.service';
import { STORAGE_ADAPTER } from './storage.interface';

@Module({
  providers: [
    LocalStorageAdapter,
    {
      provide: STORAGE_ADAPTER,
      useExisting: LocalStorageAdapter,
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
