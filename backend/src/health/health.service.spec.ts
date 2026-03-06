import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';
import { access, mkdir } from 'fs/promises';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  access: jest.fn(),
  constants: { W_OK: 2 },
}));

describe('HealthService', () => {
  let service: HealthService;
  let prisma: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    prisma = { $queryRaw: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<HealthService>(HealthService);
    (mkdir as jest.Mock).mockResolvedValue(undefined);
    (access as jest.Mock).mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return status ok when database and storage checks pass', async () => {
    prisma.$queryRaw.mockResolvedValue([1]);

    const result = await service.check();

    expect(prisma.$queryRaw).toHaveBeenCalled();
    expect(mkdir).toHaveBeenCalled();
    expect(access).toHaveBeenCalled();
    expect(result.status).toBe('ok');
    expect(result.checks.database.status).toBe('ok');
    expect(result.checks.storage.status).toBe('ok');
  });

  it('should return degraded when database check fails', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('db down'));

    const result = await service.check();

    expect(result.status).toBe('degraded');
    expect(result.checks.database).toEqual({
      status: 'error',
      detail: 'Database check failed',
    });
  });
});
