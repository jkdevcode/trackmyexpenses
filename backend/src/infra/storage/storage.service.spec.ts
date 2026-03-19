import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { STORAGE_ADAPTER } from './storage.interface';

describe('StorageService', () => {
  let service: StorageService;
  let adapter: { upload: jest.Mock };

  beforeEach(async () => {
    adapter = { upload: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: STORAGE_ADAPTER,
          useValue: adapter,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call adapter.upload and return result', async () => {
    adapter.upload.mockResolvedValue('/uploads/users/test.png');
    const buffer = Buffer.from('img');

    const result = await service.upload(buffer, 'test.png', 'users');

    expect(adapter.upload).toHaveBeenCalledWith(buffer, 'test.png', 'users');
    expect(result).toBe('/uploads/users/test.png');
  });

  it('should propagate adapter errors', async () => {
    adapter.upload.mockRejectedValue(new Error('storage failed'));

    await expect(service.upload(Buffer.from('img'), 'x.png')).rejects.toThrow(
      'storage failed',
    );
  });
});
