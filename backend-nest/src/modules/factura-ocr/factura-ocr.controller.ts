import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ConfirmFacturaDto } from '../../factura-ocr/dto/confirm-factura.dto';
import { FacturaOcrOrchestrator } from './factura-ocr-orchestrator.service';

interface RequestWithUser extends Request {
  user: {
    id: number;
  };
}

@Controller('facturas/ocr')
@UseGuards(JwtAuthGuard)
export class FacturaOcrController {
  constructor(private readonly orchestrator: FacturaOcrOrchestrator) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Se requiere una imagen (field: image)');
    }

    if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
      throw new BadRequestException(
        'Solo se permiten imágenes (JPEG, PNG, WEBP)',
      );
    }

    return this.orchestrator.processImage(file);
  }

  @Post('confirmar')
  @UsePipes(ZodValidationPipe)
  async confirmar(
    @Request() req: RequestWithUser,
    @Body() dto: ConfirmFacturaDto,
  ) {
    return this.orchestrator.confirmarFactura(req.user.id, dto);
  }
}
