export interface IStorageAdapter {
  upload(buffer: Buffer, filename?: string): Promise<string>;
}

export const STORAGE_ADAPTER = Symbol('STORAGE_ADAPTER');
