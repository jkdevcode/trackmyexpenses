import { InternalServerErrorException } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { LocalStorageAdapter } from './local-storage.adapter';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockReturnValue('./uploads'),
    } as unknown as ConfigService;
    adapter = new LocalStorageAdapter(configService);
    (mkdir as jest.Mock).mockResolvedValue(undefined);
    (writeFile as jest.Mock).mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should save file and return public path', async () => {
    const result = await adapter.upload(
      Buffer.from('abc'),
      'profile/avatar.jpg',
      'users',
    );

    expect(mkdir).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalled();
    expect(result).toBe('/uploads/users/profile/avatar.jpg');
  });

  it('should throw InternalServerErrorException on filesystem error', async () => {
    (writeFile as jest.Mock).mockRejectedValue(new Error('io error'));

    await expect(
      adapter.upload(Buffer.from('abc'), 'avatar.jpg'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
