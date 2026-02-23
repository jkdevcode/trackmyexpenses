export class TextParserHelper {
  /**
   * Normalizes numeric strings to integers (COP).
   * Rules:
   * - Remove thousands separators (dots).
   * - Convert decimal comma to dot.
   * - If mostly integer-looking but has separators, assume dots are thousands.
   * - Parse as float first, then round to integer for currency.
   * Example: "26.980" -> 26980
   * Example: "10,50" -> 10.5 (Intermediate) -> 11 (if currency) or keep for weight.
   */
  static normalizeNumber(text: string): number {
    if (!text) return 0;

    // Clean currency symbols and spaces
    let clean = text.replace(/[$€COP\s]/g, '');

    // Check pattern: "1.234,56" or "1.234" (COP specific)
    // COP typically uses points for thousands and comma for cents, BUT mostly no cents in daily use except rarely.
    // However, scanner might read "26.980" as twenty-six point nine.
    // Context: "Facturas colombianas usan puntos para miles".

    // Strategy:
    // 1. If multiple dots present (1.234.567) -> Remove dots.
    // 2. If dot and comma present (1.234,56) -> Remove dot, replace comma with dot.
    // 3. If single dot (26.980) -> Usually thousands in Colombia. Remove match.
    // 4. If single absolute usage of 3 decimals (0.500 kg) -> keep dot.

    // This function focuses on CURRENCY (Integer output preferred).

    if (clean.match(/\d{1,3}(\.\d{3})+,\d+/)) {
      // 1.234,56 -> 1234.56
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.match(/\d{1,3}(\.\d{3})+/)) {
      // 1.234.567 -> 1234567
      clean = clean.replace(/\./g, '');
    } else if (clean.match(/^\d+,\d+$/)) {
      // 12,50 -> 12.50
      clean = clean.replace(',', '.');
    } else if (clean.match(/^\d+\.\d{3}$/)) {
      // 26.980 -> 26980 (Ambiguous, but in COP context usually thousands)
      clean = clean.replace('.', '');
    }

    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  }

  static normalizeCurrency(text: string): number {
    const val = this.normalizeNumber(text);
    return Math.round(val);
  }

  static normalizeQuantity(text: string): number {
    return this.normalizeNumber(text);
  }

  static findUPC(text: string): string | null {
    const match = text.match(/\b(\d{8}|\d{12,14})\b/);
    return match ? match[0] : null;
  }

  static detectWeightOrUnit(line: string): {
    cantidad: number;
    unidad: 'u' | 'kg' | 'g';
  } {
    // Regex for weight: number followed by kg/g/etc
    // "1.5 kg", "0,500 KG", "2 KILOS"
    const weightRegex =
      /(\d+[.,]?\d*)\s*(kg|kgs|kilos|kilogramos|g|gr|gramos|lb|libras)/i;
    const match = line.match(weightRegex);

    if (match) {
      // Normalize number first
      const qty = this.normalizeNumber(match[1]);
      // If regex matched "1.5" as qty, normalizeNumber might strip dot if treated as thousands separator under strict rules?
      // Wait, strict rules say "26.980" -> 26980. "1.5" -> ?
      // My normalizeNumber rules:
      // "1.234" -> 1234.
      // "1.5" -> clean="1.5". Matches nothing special. parseFloat("1.5") = 1.5. Correct.

      const unitRaw = match[2].toLowerCase();

      let unidad: 'u' | 'kg' | 'g' = 'u';
      if (unitRaw.startsWith('k')) unidad = 'kg';
      else if (unitRaw.startsWith('g')) unidad = 'g';

      return { cantidad: qty, unidad };
    }

    // Check for implicit quantity "2 x 5000"
    const qtyRegex = /^(\d+)\s*[xX]\s*/;
    const qtyMatch = line.match(qtyRegex);
    if (qtyMatch) {
      return { cantidad: parseInt(qtyMatch[1], 10), unidad: 'u' };
    }

    return { cantidad: 1, unidad: 'u' };
  }

  /**
   * Fallback regex parser for when AI fails.
   * Tries to identify lines that look like products (Desc...... Price)
   */
  static fallbackParse(text: string): unknown[] {
    const lines = text.split('\n');
    const products = [];

    // Heuristic: Line ending in number (amount)
    // Example: "LECHE ENTERA 1L      3.500"
    // Regex: ^(.+?)\s+(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)$

    const lineRegex = /^(.+?)\s+([$]?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)$/;

    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine.length < 5) continue;

      // Skip likely noise lines (Date, "Total", "NIT")
      if (
        cleanLine.match(
          /(fecha|total|subtotal|iva|cambio|efectivo|nit|factura)/i,
        )
      )
        continue;

      const match = cleanLine.match(lineRegex);
      if (match) {
        const nameRaw = match[1].trim();
        const priceRaw = match[2];

        // Check for potential UPC in name
        const upc = this.findUPC(nameRaw);
        const name = upc ? nameRaw.replace(upc, '').trim() : nameRaw;

        const unitInfo = this.detectWeightOrUnit(name);

        // Price normalizer
        const total = this.normalizeCurrency(priceRaw);

        // Heuristic to guess unit price
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
    }
    return products;
  }
}
