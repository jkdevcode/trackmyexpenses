import {
  assertValidFacturaItems,
  calculateFacturaTotal,
  calculateDiscountedTotal,
  calculateSpendingTrend,
  FacturaDomainValidationError,
  getPeriodWindow,
  normalizeAndValidateOcrItem,
  roundCurrency,
} from './factura.domain';
import { FACTURA_ERROR_CODES } from './errors/factura-error-codes';

describe('factura.domain', () => {
  describe('calculateFacturaTotal', () => {
    it('should calculate total from item totals', () => {
      const result = calculateFacturaTotal([1000, 2500.5, 499.5]);

      expect(result).toBe(4000);
    });

    it('should return 0 for empty items', () => {
      const result = calculateFacturaTotal([]);

      expect(result).toBe(0);
    });

    it('should return NaN for invalid price values', () => {
      const result = calculateFacturaTotal([1000, Number.NaN]);

      expect(Number.isNaN(result)).toBe(true);
    });
  });

  describe('assertValidFacturaItems', () => {
    it('should validate valid factura items', () => {
      expect(() =>
        assertValidFacturaItems([
          { productoId: 1, cantidad: 1.5, unidad: 'kg', descuento: 10 },
          { productoId: 2, cantidad: 1 },
        ]),
      ).not.toThrow();
    });

    it('should throw on empty items', () => {
      expect(() => assertValidFacturaItems([])).toThrow(
        FacturaDomainValidationError,
      );
    });

    it('should throw on invalid cantidad', () => {
      expect(() =>
        assertValidFacturaItems([{ productoId: 1, cantidad: 0 }]),
      ).toThrow(FacturaDomainValidationError);
    });

    it('should reject decimal cantidad when unidad is not kg', () => {
      expect(() =>
        assertValidFacturaItems([
          { productoId: 1, cantidad: 1.5, unidad: 'u' },
        ]),
      ).toThrow(FacturaDomainValidationError);
    });

    it('should throw on duplicate productoId', () => {
      try {
        assertValidFacturaItems([
          { productoId: 1, cantidad: 1 },
          { productoId: 1, cantidad: 2 },
        ]);
        fail('Expected duplicate item validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(FacturaDomainValidationError);
        expect(error).toMatchObject({
          code: FACTURA_ERROR_CODES.ITEM_DUPLICATE,
          details: [
            expect.objectContaining({
              field: 'items[1]',
              code: FACTURA_ERROR_CODES.ITEM_DUPLICATE,
            }),
          ],
        });
      }
    });

    it('should throw on invalid descuento', () => {
      expect(() =>
        assertValidFacturaItems([
          { productoId: 1, cantidad: 1, descuento: -1 },
        ]),
      ).toThrow(FacturaDomainValidationError);
    });

    it('should throw on invalid productoId', () => {
      expect(() =>
        assertValidFacturaItems([{ productoId: 0, cantidad: 1 }]),
      ).toThrow(FacturaDomainValidationError);
    });
  });

  describe('calculateDiscountedTotal', () => {
    it('should apply discount correctly', () => {
      const result = calculateDiscountedTotal(10000, 2, 10);

      expect(result).toBe(18000);
    });

    it('should aggregate item total without rounding when requested', () => {
      const result = calculateDiscountedTotal(3333.33, 3, 0, false);

      expect(result).toBeCloseTo(9999.99, 2);
    });

    it('should return negative total for negative unit price edge case', () => {
      const result = calculateDiscountedTotal(-1000, 2, 0);

      expect(result).toBe(-2000);
    });
  });

  describe('normalizeAndValidateOcrItem', () => {
    it('should normalize valid OCR item', () => {
      const result = normalizeAndValidateOcrItem({
        nombreDetectado: '  leche entera ',
        cantidadDetectada: '1.5',
        unidadDetectada: 'kg',
        descuentoDetectado: '5',
        precioUnitario: '4000',
      });

      expect(result).toEqual({
        nombreDetectado: 'LECHE ENTERA',
        cantidad: 1.5,
        descuento: 5,
        precioUnitario: 4000,
        unidad: 'kg',
      });
    });

    it('should throw when nombreDetectado is missing', () => {
      try {
        normalizeAndValidateOcrItem({
          cantidadDetectada: 1,
          precioUnitario: 1000,
        });
        fail('Expected OCR item validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(FacturaDomainValidationError);
        expect(error).toMatchObject({
          code: FACTURA_ERROR_CODES.OCR_ITEM_NAME_MISSING,
          details: [
            expect.objectContaining({
              field: 'items[0]',
              code: FACTURA_ERROR_CODES.OCR_ITEM_NAME_MISSING,
            }),
          ],
        });
      }
    });

    it('should throw when cantidadDetectada is invalid', () => {
      expect(() =>
        normalizeAndValidateOcrItem({
          nombreDetectado: 'PAN',
          cantidadDetectada: 1.5,
          unidadDetectada: 'u',
          precioUnitario: 1000,
        }),
      ).toThrow(FacturaDomainValidationError);
    });
  });

  describe('roundCurrency', () => {
    it('should round to 2 decimals', () => {
      expect(roundCurrency(10.005)).toBe(10.01);
    });
  });

  describe('getPeriodWindow', () => {
    const now = new Date('2026-03-06T15:30:00.000Z');

    it('should build day window', () => {
      const result = getPeriodWindow('day', now);

      expect(result.startDate.getHours()).toBe(0);
      expect(result.startDate.getMinutes()).toBe(0);
      expect(result.startDate.getDate()).toBe(6);
      expect(result.prevStartDate.getDate()).toBe(5);
    });

    it('should build month window by default', () => {
      const result = getPeriodWindow('month', now);

      expect(result.startDate.getDate()).toBe(1);
      expect(result.prevEndDate.getDate()).toBe(28);
      expect(result.prevEndDate.getHours()).toBe(23);
      expect(result.prevEndDate.getMinutes()).toBe(59);
    });

    it('should build year window', () => {
      const result = getPeriodWindow('year', now);

      expect(result.startDate.getMonth()).toBe(0);
      expect(result.startDate.getDate()).toBe(1);
      expect(result.prevStartDate.getFullYear()).toBe(2025);
      expect(result.prevStartDate.getMonth()).toBe(0);
      expect(result.prevStartDate.getDate()).toBe(1);
    });
  });

  describe('calculateSpendingTrend', () => {
    it('should calculate trend percentage when previous spending exists', () => {
      expect(calculateSpendingTrend(150, 100)).toBe(50);
    });

    it('should return 100 when previous spending is zero and current > 0', () => {
      expect(calculateSpendingTrend(200, 0)).toBe(100);
    });

    it('should return 0 when both periods are zero', () => {
      expect(calculateSpendingTrend(0, 0)).toBe(0);
    });
  });
});
