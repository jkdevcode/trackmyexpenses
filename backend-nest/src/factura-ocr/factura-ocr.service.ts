import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Fuse from 'fuse.js';

@Injectable()
export class FacturaOcrService {
  private readonly logger = new Logger(FacturaOcrService.name);
  private geminiModel: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    } else {
        this.logger.warn('GEMINI_API_KEY not found. AI parsing will fail.');
    }
  }

  async processImage(file: Express.Multer.File) {
    try {
      // 1. Pre-processing (Sharp)
      const processedBuffer = await sharp(file.buffer)
        .resize(2000, null, { withoutEnlargement: true }) // Max width 2000px
        .grayscale()
        .normalize() // Improve contrast
        .toBuffer();

      // 2. OCR (Tesseract.js)
      // Note: Creating worker per request is slow. In prod, use a pool or singleton worker.
      // For this task, local worker is fine.
      const worker = await createWorker('spa+eng');
      const { data: { text: rawText } } = await worker.recognize(processedBuffer);
      await worker.terminate();

      // 3. AI Parsing (Gemini)
      const parsedData = await this.parseWithAI(rawText);

      // 4. Fuzzy Matching (Fuse.js)
      const finalData = await this.matchProducts(parsedData);

      return {
        rawText,
        ...finalData
      };

    } catch (error) {
      this.logger.error('Error processing OCR', error);
      throw new InternalServerErrorException('Error procesando la imagen de la factura');
    }
  }

  private async parseWithAI(text: string) {
    if (!this.geminiModel) {
        throw new InternalServerErrorException('Servicio de IA no configurado');
    }

    const prompt = `
      Analiza el siguiente texto extraído de una factura mediante OCR.
      Extrae la información en JSON puro siguiendo estas reglas estrictas:

      1. Formato de Números: Las facturas colombianas usan puntos para miles (ej: 72.832). 
        DEBES eliminar los puntos y devolver números enteros (ej: 72832).
      2. Fecha: Devuelve en formato YYYY-MM-DD.
      3. Productos:
        - nombre: Descripción corta.
        - cantidad: Si hay peso (KGM), usa 1 o la unidad entera.
        - precioUnitario: El valor del artículo sin puntos.
        - total: cantidad * precioUnitario.

      Texto OCR:
      """
      ${text}
      """
      `;

    try {
        const result = await this.geminiModel.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        // Clean markdown code blocks if present
        const jsonString = textResponse.replace(/^```json\n|\n```$/g, '').trim();
        return JSON.parse(jsonString);
    } catch (e) {
        this.logger.error('AI Parsing failed', e);
        // Fallback or rethrow
        return { productos: [], total: 0 };
    }
  }

  private async matchProducts(parsedData: any) {
    const allProducts = await this.prisma.producto.findMany({
        select: { id: true, nombre: true, codigo: true, precioUnitario: true }
    });

    const options = {
        keys: ['nombre'],
        includeScore: true,
        threshold: 0.4 // 0.0 is perfect match, 1.0 is no match. 
        // User asked for > 80% match. This corresponds to score < 0.2 roughly?
        // Let's set basic threshold and strictly filter later.
    };

    const fuse = new Fuse(allProducts, options);

    const matchThreshold = 0.2; // Equivalent to > 80% similarity

    if (parsedData.productos && Array.isArray(parsedData.productos)) {
        parsedData.productos = parsedData.productos.map((item: any) => {
            const searchResult = fuse.search(item.nombre);
            
            // Take best match
            if (searchResult.length > 0) {
                const bestMatch = searchResult[0];
                if (bestMatch.score !== undefined && bestMatch.score <= matchThreshold) {
                    return {
                        ...item,
                        productId: bestMatch.item.id,
                        matchedName: bestMatch.item.nombre,
                        newProduct: false,
                        matchScore: bestMatch.score
                    };
                }
            }

            return {
                ...item,
                newProduct: true
            };
        });
    }

    return parsedData;
  }
}
