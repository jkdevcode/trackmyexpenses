import { Injectable, InternalServerErrorException, Logger, OnModuleInit, OnModuleDestroy, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import sharp from 'sharp';
import { createWorker, Worker } from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Fuse from 'fuse.js';
import { TextParserHelper } from './helpers/parse-text.helper';
import { ScanResponseDto } from './dto/scan-response.dto';
import { ConfirmFacturaDto } from './dto/confirm-factura.dto';
import { Prisma } from '@prisma/client';

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

  // --- Confirmation Logic ---

  async confirmarFactura(userId: number, dto: ConfirmFacturaDto) {
    const { factura, productos } = dto;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Create Factura Header
        // Generate a random code if not provided or just use timestamp
        const codigoFactura = `OCR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const nuevaFactura = await tx.factura.create({
          data: {
            usuarioId: userId,
            codigoFactura: codigoFactura,
            fechaHoraCompra: new Date(factura.fechaHoraCompra),
            metodoPago: factura.metodoPago as any,
            lugarCompra: factura.lugarCompra,
            nitProveedor: factura.nitProveedor,
            totalPagar: 0, // Will be updated
          }
        });

        let totalCalculado = 0;

        // 2. Process Products
        for (const item of productos) {
          // Normalize inputs
          const nombreClean = item.nombreDetectado.trim().toUpperCase();
          const cantidad = Number(item.cantidadDetectada);
          const precioUnitario = Number(item.precioUnitario);
          const descuento = Number(item.descuentoDetectado || 0);
          
          // Requirement: "Guardar cantidad numérica + unidad textual"
          // "unidadDetectada" e.g. "g", "ml", "u".
          // "pesoDetectado" e.g. "200" if "200g".
          // The schema supports `cantidad` (Int) and `unidad` (String).
          // If 200g is the "item size", but user bought 2 yogurts of 200g...
          // Usually: cantidad=2, Producto="Yogurt 200g".
          // But Input says "cantidadDetectada":2, "pesoDetectado": 200, "unidadDetectada": "g".
          // Maybe store 'unidad' = '200g' or just 'g'?
          // Schema `FacturaProducto` has `unidad String`.
          // Let's store `unidad: item.unidadDetectada`.
          // And put the weight in the NAME of the product if creating new one.
          
          if (cantidad <= 0) continue;

          // 3. Find or Create Product
          // "Un producto NO se reutiliza entre facturas? => new registry"
          // We interpret this as: Independent FacturaProducto record.
          // But we need a parent `Producto`.
          // Strategy: Try to find by Exact Name/Code. If not, create.
          // BUT prompt says "Cada factura tiene su propia evidencia histórica... Crear registros independientes...".
          // If we create a new `Producto` with same `codigo` it fails (@unique).
          // We assume we reuse `Producto` (catalog) if exists, create if not.
          
          // Generate a pseudo-code if we create it.
          // Use name as base for code if new.
          
          let producto = await tx.producto.findFirst({
            where: { nombre: nombreClean } // Simple name match logic
          });

          if (!producto) {
            // Create new Product
            // Generate Code: PROD-{UUID}
            const uniqueCode = `PROD-${Date.now()}-${Math.floor(Math.random()*10000)}`;
            producto = await tx.producto.create({
              data: {
                nombre: nombreClean,
                codigo: uniqueCode,
                precioUnitario: precioUnitario // Initial price
              }
            });
          }

          // 4. Create FacturaProducto (The Independent Record)
          const precioTotalItem = (precioUnitario * cantidad) - descuento;
          totalCalculado += precioTotalItem;

          await tx.facturaProducto.create({
            data: {
              facturaId: nuevaFactura.id,
              productoId: producto.id,
              cantidad: cantidad,
              unidad: item.unidadDetectada || 'u',
              descuento: new Prisma.Decimal(descuento),
              precioTotal: new Prisma.Decimal(precioTotalItem)
            }
          });
        }

        // 5. Update Factura Total
        const facturaActualizada = await tx.factura.update({
          where: { id: nuevaFactura.id },
          data: { totalPagar: totalCalculado },
          include: {
            productos: {
              include: { producto: true }
            }
          }
        });

        return facturaActualizada;
      });

      return {
        status: 201,
        message: 'Factura OCR confirmada exitosamente',
        data: { factura: result }
      };

    } catch (error) {
      this.logger.error('Error confirming factura', error);
      throw new InternalServerErrorException('Error al confirmar factura');
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
