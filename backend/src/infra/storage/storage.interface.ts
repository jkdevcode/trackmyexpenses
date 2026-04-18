export interface IStorageAdapter {
  upload(buffer: Buffer, filename?: string, folder?: string): Promise<string>;
}

export const STORAGE_ADAPTER = Symbol('STORAGE_ADAPTER');
