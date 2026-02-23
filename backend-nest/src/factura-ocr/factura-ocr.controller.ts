import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
  UsePipes,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FacturaOcrService } from './factura-ocr.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { ConfirmFacturaDto } from './dto/confirm-factura.dto';

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
      throw new BadRequestException(
        'Solo se permiten imágenes (JPEG, PNG, WEBP)',
      );
    }

    return this.ocrService.processImage(file);
  }

  @Post('confirmar')
  @UsePipes(ZodValidationPipe)
  async confirmar(
    @Request() req: { user: { id: number } },
    @Body() dto: ConfirmFacturaDto,
  ) {
    return this.ocrService.confirmarFactura(req.user.id, dto);
  }
}
