import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Fuse from 'fuse.js';
import { PrismaService } from '../prisma/prisma.service';
import { RequestContext } from '../common/context/request-context';
import { ScanResponseDto } from './dto/scan-response.dto';

type GeminiResponse = { response: { text: () => string } };
type GeminiPromptPart =
  | string
  | { inlineData: { data: string; mimeType: string } };
type GeminiPrompt = string | GeminiPromptPart[];
type GeminiModel = {
  generateContent: (prompt: GeminiPrompt) => Promise<GeminiResponse>;
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
    userId?: number,
  ): Promise<{ parsed: ParsedData; usedFallbackParser: boolean }> {
    let parsedData: ParsedData = { productos: [] };
    let usedFallbackParser = false;

    try {
      parsedData = await this.parseWithAI({ text: rawText });
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

    const enriched = await this.finalizeParsedData(parsedData, rawText, userId);
    return { parsed: enriched, usedFallbackParser };
  }

  async finalizeParsedData(
    parsedData: ParsedData,
    rawText?: string,
    userId?: number,
  ): Promise<ParsedData> {
    const enrichedProducts = await this.enrichProducts(
      parsedData.productos,
      userId,
    );
    const monedaDetectada =
      parsedData.monedaDetectada ??
      (rawText ? TextParserHelper.detectCurrency(rawText) : null);
    const lowConfidence = this.hasLowConfidence(parsedData);

    return {
      ...parsedData,
      productos: enrichedProducts,
      monedaDetectada: monedaDetectada ?? undefined,
      lowConfidence,
    };
  }

  /**
   * Parses a receipt using Gemini AI.
   *
   * The input accepts either pre-extracted OCR text or a base64-encoded image.
   *
   * @param input.text        - Cleaned OCR text extracted from Tesseract
   * @param input.imageBase64 - Base64 image for multimodal parsing
   */
  async parseWithAI(input: {
    text?: string;
    imageBase64?: string;
  }): Promise<ParsedData> {
    if (!this.geminiModel) {
      throw new Error('AI not configured');
    }

    const { text, imageBase64 } = input;

    const prompt = `You are an expert system for extracting structured data from receipts.

Return ONLY valid JSON.

## OUTPUT SCHEMA
{
  "empresa": { "nombre": string | null, "nit": string | null },
  "fecha": string | null,
  "monedaDetectada": string | null,
  "totalDetectado": number | null,
  "productos": [
    {
      "nombreDetected": string,
      "cantidad": number,
      "unidad": "u" | "kg" | "g",
      "precioUnitario": number,
      "precioTotal": number,
      "confidence": {
        "nombre": number,
        "cantidad": number,
        "precio": number
      }
    }
  ],
  "notes": string[]
}

## RULES

1. NEVER include TOTAL, SUBTOTAL, IVA, TAX as products.
2. Detect columns visually if image is provided.
3. Merge multi-line product rows.
4. Normalize prices:
   "12.500" -> 12500
5. Default cantidad = 1
6. If unclear, set price = 0 and confidence.precio = 0.0

## EXAMPLE
LECHE ENTERA
2 x 3.200 -> 6400

Output:
{
  "nombreDetected": "LECHE ENTERA",
  "cantidad": 2,
  "precioUnitario": 3200,
  "precioTotal": 6400
}
`;

    try {
      let result: GeminiResponse;

      if (imageBase64) {
        result = await this.geminiModel.generateContent([
          prompt,
          {
            inlineData: {
              data: imageBase64,
              mimeType: 'image/jpeg',
            },
          },
        ]);
      } else {
        result = await this.geminiModel.generateContent(
          `${prompt}

${text ?? ''}`,
        );
      }

      const raw = result.response.text();
      return this.normalizeParsedData(JSON.parse(raw) as unknown);
    } catch (error: unknown) {
      this.logger.warn('AI parsing failed, fallback will be used', error);
      throw error;
    }
  }

  private async enrichProducts(
    products: ParsedProduct[],
    userId?: number,
  ): Promise<ParsedProduct[]> {
    const dbProducts = await this.prisma.producto.findMany({
      where:
        userId !== undefined
          ? {
              facturas: {
                some: { factura: { usuarioId: userId } },
              },
            }
          : {},
      select: { id: true, nombre: true, codigo: true },
      take: 500,
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
    if (!Array.isArray(products)) return [];

    return products.reduce<ParsedProduct[]>((acc, product) => {
      if (typeof product !== 'object' || product === null) return acc;

      const p = product as Record<string, unknown>;

      const nombre =
        typeof p.nombreDetected === 'string' ? p.nombreDetected.trim() : '';
      if (!nombre) return acc;

      const cantidad =
        typeof p.cantidad === 'number' && p.cantidad > 0 ? p.cantidad : 1;

      const precioUnitario =
        typeof p.precioUnitario === 'number' && isFinite(p.precioUnitario)
          ? Math.round(p.precioUnitario)
          : 0;

      const precioTotal =
        typeof p.precioTotal === 'number' && isFinite(p.precioTotal)
          ? Math.round(p.precioTotal)
          : Math.round(precioUnitario * cantidad);

      const unidad = (['u', 'kg', 'g'] as const).includes(
        p.unidad as 'u' | 'kg' | 'g',
      )
        ? (p.unidad as 'u' | 'kg' | 'g')
        : 'u';

      const rawConf = (p.confidence ?? {}) as Record<string, unknown>;
      const confidence = {
        nombre: typeof rawConf.nombre === 'number' ? rawConf.nombre : 0.5,
        cantidad: typeof rawConf.cantidad === 'number' ? rawConf.cantidad : 0.5,
        precio: typeof rawConf.precio === 'number' ? rawConf.precio : 0.5,
      };

      acc.push({
        nombreDetected: nombre,
        cantidad,
        unidad,
        precioUnitario,
        precioTotal,
        confidence,
      });

      return acc;
    }, []);
  }

  private hasLowConfidence(parsed: ParsedData): boolean {
    return (
      parsed.productos?.some(
        (p) =>
          (p.confidence?.precio ?? 1) < 0.5 ||
          (p.confidence?.nombre ?? 1) < 0.5,
      ) ?? false
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

  static detectCurrency(text: string): string | null {
    const upper = text.toUpperCase();

    if (upper.includes('USD') || upper.includes('US$')) {
      return 'USD';
    }
    if (upper.includes('EUR')) {
      return 'EUR';
    }
    if (upper.includes('COP') || upper.includes('COL')) {
      return 'COP';
    }
    if (upper.includes('MXN')) {
      return 'MXN';
    }
    if (upper.includes('CLP')) {
      return 'CLP';
    }

    return null;
  }

  static fallbackParse(text: string): unknown[] {
    const lines = text.split('\n');
    const products = [];
    const lineRegex =
      /^(.+?)\s+(?:COP\s*|\$\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)$/i;

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
