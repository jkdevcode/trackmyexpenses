import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type ExchangeRateResult = {
  rate: number;
  source: string;
  fetchedAt: Date;
};

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);

  constructor(private readonly configService: ConfigService) {}

  async getRate(from: string, to: string): Promise<ExchangeRateResult> {
    const apiKey = this.configService.get<string>('EXCHANGE_RATE_API_KEY');
    const baseUrl = this.configService.get<string>(
      'EXCHANGE_RATE_API_URL',
      'https://v6.exchangerate-api.com/v6',
    );

    if (!apiKey) {
      throw new Error('EXCHANGE_RATE_API_KEY is not configured');
    }

    const fromCode = from.trim().toUpperCase();
    const toCode = to.trim().toUpperCase();
    const url = `${baseUrl}/${apiKey}/latest/${fromCode}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
    } catch (error: unknown) {
      this.logger.error({ msg: 'Exchange rate API request failed', error });
      throw new Error('Failed to connect to exchange rate API');
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error({
        msg: 'Exchange rate API returned non-200',
        status: response.status,
        body,
      });
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const payload = (await response.json()) as {
      result?: string;
      conversion_rates?: Record<string, number>;
      time_last_update_unix?: number;
    };

    if (!payload.conversion_rates || payload.result !== 'success') {
      this.logger.error({ msg: 'Invalid exchange rate API payload', payload });
      throw new Error('Invalid exchange rate API response');
    }

    const rate = payload.conversion_rates[toCode];
    if (!rate || !Number.isFinite(rate)) {
      throw new Error(`Exchange rate not found for ${toCode}`);
    }

    const fetchedAt = payload.time_last_update_unix
      ? new Date(payload.time_last_update_unix * 1000)
      : new Date();

    return {
      rate,
      source: 'EXCHANGE_RATE_API',
      fetchedAt,
    };
  }
}
