import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class ImageProcessorService {
  async process(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(2000, null, { withoutEnlargement: true })
      .grayscale()
      .normalize()
      .toBuffer();
  }
}
