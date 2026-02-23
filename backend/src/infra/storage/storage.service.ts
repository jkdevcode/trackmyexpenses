import { Injectable } from '@nestjs/common';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { IStorageAdapter } from './storage.interface';

@Injectable()
export class StorageService {
  private readonly adapter: IStorageAdapter;

  constructor() {
    this.adapter = new LocalStorageAdapter();
  }

  async upload(buffer: Buffer, filename?: string): Promise<string> {
    return this.adapter.upload(buffer, filename);
  }
}
