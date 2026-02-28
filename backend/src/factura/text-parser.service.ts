import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Fuse from 'fuse.js';
import { PrismaService } from '../prisma/prisma.service';
import { RequestContext } from '../common/context/request-context';
import { ScanResponseDto } from './dto/scan-response.dto';

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
    } catch (error: unknown) {
      this.logger.warn({
        msg: 'AI parsing failed. Switching to fallback parser',
        requestId: RequestContext.getRequestId(),
      });
      parsedData = {
        productos: this.normalizeProducts(
          TextParserHelper.fallbackParse(rawText),
        ),
      };
      usedFallbackParser = true;
      this.logger.error({
        msg: 'AI parsing error',
        requestId: RequestContext.getRequestId(),
        error,
      });
    }

    if (parsedData.productos.length === 0 && !usedFallbackParser) {
      this.logger.warn('AI returned no products. Trying fallback parser.');
      parsedData.productos = this.normalizeProducts(
        TextParserHelper.fallbackParse(rawText),
      );
      usedFallbackParser = true;
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

  private async parseWithAI(text: string): Promise<ParsedData> {
    if (!this.geminiModel) {
      throw new Error('AI not configured');
    }

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
      1. Normaliza montos a enteros (elimina puntos de miles).
      2. Detecta unidades (kg/g) en descripcion.
      3. "confidence" estimado (1.0 si es claro, 0.5 si dudoso).

      Texto OCR:
      """
      ${text}
      """
    `;

    const result = await this.geminiModel.generateContent(prompt);
    return this.normalizeParsedData(
      JSON.parse(result.response.text()) as unknown,
    );
  }

  private async enrichProducts(
    products: ParsedProduct[],
  ): Promise<ParsedProduct[]> {
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

class TextParserHelper {
  static normalizeNumber(text: string): number {
    if (!text) return 0;

    let clean = text.replace(/[$COP\s]/g, '');

    if (clean.match(/\d{1,3}(\.\d{3})+,\d+/)) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.match(/\d{1,3}(\.\d{3})+/)) {
      clean = clean.replace(/\./g, '');
    } else if (clean.match(/^\d+,\d+$/)) {
      clean = clean.replace(',', '.');
    } else if (clean.match(/^\d+\.\d{3}$/)) {
      clean = clean.replace('.', '');
    }

    const value = parseFloat(clean);
    return isNaN(value) ? 0 : value;
  }

  static normalizeCurrency(text: string): number {
    return Math.round(this.normalizeNumber(text));
  }

  static findUPC(text: string): string | null {
    const match = text.match(/\b(\d{8}|\d{12,14})\b/);
    return match ? match[0] : null;
  }

  static detectWeightOrUnit(line: string): {
    cantidad: number;
    unidad: 'u' | 'kg' | 'g';
  } {
    const weightRegex =
      /(\d+[.,]?\d*)\s*(kg|kgs|kilos|kilogramos|g|gr|gramos|lb|libras)/i;
    const match = line.match(weightRegex);

    if (match) {
      const qty = this.normalizeNumber(match[1]);
      const unitRaw = match[2].toLowerCase();

      let unidad: 'u' | 'kg' | 'g' = 'u';
      if (unitRaw.startsWith('k')) unidad = 'kg';
      else if (unitRaw.startsWith('g')) unidad = 'g';

      return { cantidad: qty, unidad };
    }

    const qtyRegex = /^(\d+)\s*[xX]\s*/;
    const qtyMatch = line.match(qtyRegex);
    if (qtyMatch) {
      return { cantidad: parseInt(qtyMatch[1], 10), unidad: 'u' };
    }

    return { cantidad: 1, unidad: 'u' };
  }

  static fallbackParse(text: string): unknown[] {
    const lines = text.split('\n');
    const products = [];
    const lineRegex = /^(.+?)\s+([$]?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)$/;

    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine.length < 5) continue;

      if (
        cleanLine.match(
          /(fecha|total|subtotal|iva|cambio|efectivo|nit|factura)/i,
        )
      ) {
        continue;
      }

      const match = cleanLine.match(lineRegex);
      if (!match) continue;

      const nameRaw = match[1].trim();
      const priceRaw = match[2];
      const upc = this.findUPC(nameRaw);
      const name = upc ? nameRaw.replace(upc, '').trim() : nameRaw;
      const unitInfo = this.detectWeightOrUnit(name);
      const total = this.normalizeCurrency(priceRaw);
      const unitPrice =
        unitInfo.cantidad > 0 ? Math.round(total / unitInfo.cantidad) : total;

      products.push({
        nombreDetected: name,
        cantidad: unitInfo.cantidad,
        unidad: unitInfo.unidad,
        precioUnitario: unitPrice,
        precioTotal: total,
        matchedBy: 'fallback-regex',
        confidence: { nombre: 0.5, cantidad: 0.5, precio: 0.5 },
      });
    }

    return products;
  }
}
