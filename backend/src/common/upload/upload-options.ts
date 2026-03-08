import {
  HttpStatus,
  ParseFilePipe,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_FILE_PATTERN = /(jpg|jpeg|png|webp)$/i;

const buildImageFilePipe = (fileIsRequired: boolean): ParseFilePipe =>
  new ParseFilePipeBuilder()
    .addMaxSizeValidator({
      maxSize: MAX_UPLOAD_FILE_SIZE,
      message: 'El archivo supera el limite de 5MB',
    })
    .addFileTypeValidator({
      fileType: IMAGE_FILE_PATTERN,
    })
    .build({
      fileIsRequired,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
    });

export const requiredImageFilePipe = buildImageFilePipe(true);
export const optionalImageFilePipe = buildImageFilePipe(false);

export const imageFileInterceptorOptions: MulterOptions = {
  limits: { fileSize: MAX_UPLOAD_FILE_SIZE },
};
