import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FacturaOcrService } from './factura-ocr.service';
import { ZodValidationPipe } from 'nestjs-zod'; // Useful if validating output, but usually for input.
// Creating a guard for output? No, just returning DTO.

@Controller('facturas/ocr')
@UseGuards(JwtAuthGuard)
export class FacturaOcrController {
  constructor(private readonly ocrService: FacturaOcrService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
        throw new BadRequestException('Se requiere una imagen (field: image)');
    }
    
    // Validate mimetype basic
    if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
        throw new BadRequestException('Solo se permiten imágenes (JPEG, PNG, WEBP)');
    }

    return this.ocrService.processImage(file);
  }
}
