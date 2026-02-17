import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly uploadsRoot = join(process.cwd(), 'uploads');

  async upload(buffer: Buffer, filename?: string): Promise<string> {
    const normalizedFilename =
      filename && filename.trim().length > 0
        ? filename.replace(/\\/g, '/')
        : `${Date.now()}-${randomUUID()}`;

    const absolutePath = join(this.uploadsRoot, normalizedFilename);

    try {
      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, buffer);
    } catch {
      throw new InternalServerErrorException('Error al guardar el archivo');
    }

    return `/uploads/${normalizedFilename}`;
  }
}
