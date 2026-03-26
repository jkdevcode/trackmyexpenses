import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import puppeteer, { type Browser } from 'puppeteer';
import { RequestContext } from '../common/context/request-context';

@Injectable()
export class PdfService {
  constructor(private readonly logger: Logger) {}

  async generatePdf(html: string): Promise<Buffer> {
    let browser: Browser | null = null;

    try {
      browser = await puppeteer.launch({
        headless: true,
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const buffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      return Buffer.from(buffer);
    } catch (error: unknown) {
      this.logger.error({
        msg: 'Error al generar PDF',
        requestId: RequestContext.getRequestId(),
        error,
      });
      throw new InternalServerErrorException('Error al generar PDF');
    } finally {
      if (browser) {
        await browser.close().catch((closeError: unknown) => {
          this.logger.error({
            msg: 'Error al cerrar navegador PDF',
            requestId: RequestContext.getRequestId(),
            error: closeError,
          });
        });
      }
    }
  }
}
