import { InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { IStorageAdapter } from '../storage.interface';

export class LocalStorageAdapter implements IStorageAdapter {
  private readonly uploadsRoot = join(
    process.cwd(),
    process.env.UPLOADS_DIR || './uploads/users',
  );

  async upload(buffer: Buffer, filename?: string): Promise<string> {
    const normalizedFilename =
      filename && filename.trim().length > 0
        ? filename.replace(/\\/g, '/')
        : randomUUID();

    const absolutePath = join(this.uploadsRoot, normalizedFilename);

    try {
      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, buffer);
    } catch {
      throw new InternalServerErrorException('Error al guardar el archivo');
    }

    return `/uploads/users/${normalizedFilename}`;
  }
}
