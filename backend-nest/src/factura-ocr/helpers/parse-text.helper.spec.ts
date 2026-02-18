import { TextParserHelper } from '../helpers/parse-text.helper';

describe('TextParserHelper', () => {
  describe('normalizeNumber', () => {
    it('should handle thousand dots', () => {
       expect(TextParserHelper.normalizeNumber('26.980')).toBe(26980);
       expect(TextParserHelper.normalizeNumber('72.832')).toBe(72832);
       expect(TextParserHelper.normalizeNumber('1.234.567')).toBe(1234567);
    });

    it('should handle decimals with comma', () => {
       expect(TextParserHelper.normalizeNumber('12,50')).toBe(12.5);
       expect(TextParserHelper.normalizeNumber('0,695')).toBe(0.695);
    });

    it('should handle mixed format', () => {
        expect(TextParserHelper.normalizeNumber('1.234,56')).toBe(1234.56);
    });
  });

  describe('extractUPC', () => {
      it('should find 8-14 digit codes', () => {
          expect(TextParserHelper.findUPC('PROD 7701234567890 BOTELLA')).toBe('7701234567890');
          expect(TextParserHelper.findUPC('ITEM 12345678 END')).toBe('12345678');
      });
  });
  
  describe('detectWeightOrUnit', () => {
      it('should detect kg', () => {
          const r = TextParserHelper.detectWeightOrUnit('MANZANA ROJA 1.5 KG');
          expect(r).toEqual({ cantidad: 1.5, unidad: 'kg' });
      });

      it('should detect implicit units X', () => {
           const r = TextParserHelper.detectWeightOrUnit('3 X 5000 JABON');
           expect(r.cantidad).toBe(3);
      });
  });
});
