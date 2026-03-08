import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { IStorageAdapter } from '../storage.interface';

@Injectable()
export class LocalStorageAdapter implements IStorageAdapter {
  private readonly uploadsRoot: string;

  constructor(private readonly configService: ConfigService) {
    const uploadsDir =
      this.configService.get<string>('UPLOADS_DIR') ?? './uploads/users';
    this.uploadsRoot = join(process.cwd(), uploadsDir);
  }

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
