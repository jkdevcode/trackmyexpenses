import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: { check: jest.Mock };

  beforeEach(async () => {
    healthService = { check: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: healthService }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health response from service', async () => {
    const healthResponse = {
      status: 'ok',
      timestamp: '2026-03-04T00:00:00.000Z',
      checks: { database: { status: 'ok' }, storage: { status: 'ok' } },
    };
    healthService.check.mockResolvedValue(healthResponse);

    const result = await controller.check();

    expect(healthService.check).toHaveBeenCalled();
    expect(result).toEqual(healthResponse);
  });
});
