import { Injectable } from '@nestjs/common';
import { mkdir, access, constants } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const [database, storage] = await Promise.all([
      this.checkDatabase(),
      this.checkStorage(),
    ]);

    const status =
      database.status === 'ok' && storage.status === 'ok' ? 'ok' : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database,
        storage,
      },
    };
  }

  private async checkDatabase(): Promise<{
    status: 'ok' | 'error';
    detail?: string;
  }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch {
      return { status: 'error', detail: 'Database check failed' };
    }
  }

  private async checkStorage(): Promise<{
    status: 'ok' | 'error';
    detail?: string;
  }> {
    const uploadsDir = join(
      process.cwd(),
      process.env.UPLOADS_DIR || './uploads',
    );

    try {
      await mkdir(uploadsDir, { recursive: true });
      await access(uploadsDir, constants.W_OK);
      return { status: 'ok' };
    } catch {
      return { status: 'error', detail: 'Storage directory is not writable' };
    }
  }
}
