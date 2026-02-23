export interface IStorageAdapter {
  upload(buffer: Buffer, filename?: string): Promise<string>;
}
