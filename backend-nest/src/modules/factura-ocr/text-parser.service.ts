import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Fuse from 'fuse.js';
import { TextParserHelper } from '../../factura-ocr/helpers/parse-text.helper';
import { RequestContext } from '../../common/context/request-context';
import { ScanResponseDto } from '../../factura-ocr/dto/scan-response.dto';

type GeminiResponse = { response: { text: () => string } };
type GeminiModel = {
  generateContent: (prompt: string) => Promise<GeminiResponse>;
};
type ParsedData = ScanResponseDto['parsed'];
type ParsedProduct = ParsedData['productos'][number];

@Injectable()
export class TextParserService {
  private readonly logger = new Logger(TextParserService.name);
  private geminiModel: GeminiModel | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.geminiModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
    }
  }

  async parseAndEnrich(
    rawText: string,
  ): Promise<{ parsed: ParsedData; usedFallbackParser: boolean }> {
    let parsedData: ParsedData = { productos: [] };
    let usedFallbackParser = false;

    try {
      parsedData = await this.parseWithAI(rawText);
    } catch (error) {
      this.logger.warn({
        msg: 'AI Parsing failed, switching to fallback regex',
        requestId: RequestContext.getRequestId(),
      });
      parsedData = {
        productos: this.normalizeProducts(TextParserHelper.fallbackParse(rawText)),
      };
      usedFallbackParser = true;
      this.logger.error({
        msg: 'AI parsing error',
        requestId: RequestContext.getRequestId(),
        error,
      });
    }

    if (parsedData.productos.length === 0) {
      if (!usedFallbackParser) {
        this.logger.warn('AI returned no products, trying fallback');
        parsedData.productos = this.normalizeProducts(
          TextParserHelper.fallbackParse(rawText),
        );
        usedFallbackParser = true;
      }
    }

    const enrichedProducts = await this.enrichProducts(parsedData.productos);
    return {
      parsed: {
        ...parsedData,
        productos: enrichedProducts,
      },
      usedFallbackParser,
    };
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
    return this.normalizeParsedData(JSON.parse(result.response.text()) as unknown);
  }

  private async enrichProducts(products: ParsedProduct[]): Promise<ParsedProduct[]> {
    const dbProducts = await this.prisma.producto.findMany({
      select: { id: true, nombre: true, codigo: true },
    });

    const fuse = new Fuse(dbProducts, {
      keys: ['nombre', 'codigo'],
      includeScore: true,
      threshold: 0.4,
    });

    return products.map((item) => {
      const upc = TextParserHelper.findUPC(item.nombreDetected);

      if (upc) {
        const exact = dbProducts.find((dp) => dp.codigo === upc);
        if (exact) {
          item.productId = exact.id;
          item.matchedBy = 'barcode';
          item.matchScore = 1.0;
          return item;
        }
      }

      const search = fuse.search(item.nombreDetected);
      if (search.length > 0) {
        const best = search[0];
        const score = 1 - (best.score || 1);

        if (score >= 0.8) {
          item.productId = best.item.id;
          item.matchedBy = 'fuzzy';
          item.matchScore = score;
        }
      }

      return item;
    });
  }

  private normalizeParsedData(raw: unknown): ParsedData {
    if (typeof raw !== 'object' || raw === null) {
      return { productos: [] };
    }

    const parsedCandidate = raw as Record<string, unknown>;
    const productos = this.normalizeProducts(parsedCandidate.productos);

    return {
      ...parsedCandidate,
      productos,
    } as ParsedData;
  }

  private normalizeProducts(products: unknown): ParsedProduct[] {
    if (!Array.isArray(products)) {
      return [];
    }

    return products.filter(
      (product): product is ParsedProduct =>
        typeof product === 'object' && product !== null,
    );
  }
}
