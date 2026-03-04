import { Inject, Injectable } from '@nestjs/common';
import { STORAGE_ADAPTER } from './storage.interface';
import type { IStorageAdapter } from './storage.interface';

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_ADAPTER) private readonly adapter: IStorageAdapter,
  ) {}

  async upload(buffer: Buffer, filename?: string): Promise<string> {
    return this.adapter.upload(buffer, filename);
  }
}
