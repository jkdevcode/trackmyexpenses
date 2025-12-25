import { Injectable, InternalServerErrorException, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import sharp from 'sharp';
import { createWorker, Worker } from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Fuse from 'fuse.js';
import { TextParserHelper } from './helpers/parse-text.helper';
import { ScanResponseDto } from './dto/scan-response.dto';

@Injectable()
export class FacturaOcrService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FacturaOcrService.name);
  private geminiModel: any;
  private tesseractWorker: Worker | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Using gemini-1.5-flash as it is faster and cheaper, or fallback to pro. 
      // User specific code had 2.5-flash? Maybe typo. Sticking to valid models or config.
      // Assuming 'gemini-pro' or 'gemini-1.5-flash' is available.
      this.geminiModel = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: "application/json" } // Force JSON
      });
    }
  }

  async onModuleInit() {
    this.logger.log('Initializing Tesseract Worker...');
    try {
        this.tesseractWorker = await createWorker('spa+eng');
        this.logger.log('Tesseract Worker ready.');
    } catch (e) {
        this.logger.error('Failed to init Tesseract', e);
    }
  }

  async onModuleDestroy() {
      if (this.tesseractWorker) {
          await this.tesseractWorker.terminate();
      }
  }

  async processImage(file: Express.Multer.File): Promise<ScanResponseDto> {
    try {
      // 1. Pre-processing (Sharp)
      const processedBuffer = await sharp(file.buffer)
        .resize(2000, null, { withoutEnlargement: true })
        .grayscale()
        .normalize()
        //.threshold(150) // Optional, can be noisy. normalize() acts well enough usually.
        .toBuffer();

      // 2. OCR (Tesseract.js)
      if (!this.tesseractWorker) await this.onModuleInit();
      const { data: { text: rawText } } = await this.tesseractWorker!.recognize(processedBuffer);

      // 3. AI Parsing (Gemini) with Fallback
      let parsedData: any = {};
      let usedFallbackParser = false;

      try {
          parsedData = await this.parseWithAI(rawText);
      } catch (e) {
          this.logger.warn('AI Parsing failed, switching to fallback regex', e);
          parsedData = { products: TextParserHelper.fallbackParse(rawText) };
          usedFallbackParser = true;
      }

      // Validate basic structure
      if (!parsedData.productos || !Array.isArray(parsedData.productos) || parsedData.productos.length === 0) {
           if (!usedFallbackParser) {
               this.logger.warn('AI returned no products, trying fallback');
               parsedData.productos = TextParserHelper.fallbackParse(rawText);
               usedFallbackParser = true;
           }
      }

      // 4. Match & Enrich (UPC + Fuzzy)
      if (!parsedData.productos) parsedData.productos = [];

      const enrichedProducts = await this.enrichProducts(parsedData.productos, rawText);
      
      return {
        rawText,
        parsed: {
            ...parsedData,
            productos: enrichedProducts
        },
        usedFallbackParser
      };

    } catch (error) {
      this.logger.error('Error processing OCR', error);
      throw new InternalServerErrorException('Error procesando la imagen de la factura');
    }
  }

  private async parseWithAI(text: string) {
    if (!this.geminiModel) throw new Error('AI not configured');

    const prompt = `
      Analiza el texto OCR de una factura comercial.
      Extrae datos en JSON estricto:
      {
        "empresa": { "nombre": string, "nit": string },
        "fecha": "YYYY-MM-DD",
        "totalDetectado": integer (sin puntos),
        "productos": [
          {
            "nombreDetected": string,
            "cantidad": number,
            "unidad": "u" | "kg" | "g",
            "precioUnitario": integer (COP sans points),
            "precioTotal": integer (COP sans points),
            "confidence": { "nombre": 0.0-1.0, "cantidad": 0.0-1.0, "precio": 0.0-1.0 }
          }
        ]
      }
      
      Reglas:
      1. Normaliza montos a enteros (elimina puntos miles).
      2. Detecta unidades (kg/g) en descripción.
      3. "confidence" estimado (1.0 si es claro, 0.5 si dudoso).

      Texto OCR:
      """
      ${text}
      """
    `;

    const result = await this.geminiModel.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  private async enrichProducts(products: any[], fullText: string) {
    // Load local DB cache (could be large, optimization: search individually if > 1000 products, but for now load all)
    const dbProducts = await this.prisma.producto.findMany({
        select: { id: true, nombre: true, codigo: true }
    });

    const fuse = new Fuse(dbProducts, {
        keys: ['nombre', 'codigo'],
        includeScore: true,
        threshold: 0.4
    });

    return products.map(p => {
        const item = { ...p };
        
        // 1. Try UPC Match from Line Text or detected Name
        const upc = TextParserHelper.findUPC(item.nombreDetected);
        if (upc) {
            const exact = dbProducts.find(dp => dp.codigo === upc);
            if (exact) {
                item.productId = exact.id;
                item.matchedBy = 'barcode';
                item.matchScore = 1.0;
                return item;
            }
        }

        // 2. Fuzzy Match
        const search = fuse.search(item.nombreDetected);
        if (search.length > 0) {
            const best = search[0];
            const score = 1 - (best.score || 1); // Invert score (0 is bad in my output logic, 1 is good)
            
            if (score >= 0.8) {
                item.productId = best.item.id;
                item.matchedBy = 'fuzzy';
                item.matchScore = score;
            }
        }

        return item;
    });
  }
}
