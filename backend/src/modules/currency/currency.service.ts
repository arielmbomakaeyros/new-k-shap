import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  // Static exchange rates with XAF as base currency
  // XAF (CFA Franc BEAC) is pegged to EUR at 655.957
  private rates: Record<string, number> = {
    XAF: 1,
    EUR: 655.957,
    USD: 600,
    GBP: 760,
    CHF: 670,
    CAD: 445,
    NGN: 0.39,
    GHS: 39,
    KES: 3.8,
    ZAR: 32,
    XOF: 1, // CFA Franc BCEAO (parity with XAF)
  };

  /**
   * Convert an amount from one currency to another
   */
  convert(amount: number, from: string, to: string): number {
    if (from === to) return amount;

    const fromRate = this.rates[from];
    const toRate = this.rates[to];

    if (!fromRate || !toRate) {
      this.logger.warn(`Unsupported currency pair: ${from} → ${to}`);
      return amount; // Return original amount if conversion not possible
    }

    // Convert: amount in 'from' currency → XAF → 'to' currency
    const amountInXAF = amount * fromRate;
    return Math.round((amountInXAF / toRate) * 100) / 100;
  }

  /**
   * Get the exchange rate between two currencies
   */
  getRate(from: string, to: string): number | null {
    const fromRate = this.rates[from];
    const toRate = this.rates[to];

    if (!fromRate || !toRate) return null;

    return fromRate / toRate;
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): string[] {
    return Object.keys(this.rates);
  }

  /**
   * Update exchange rates (for future external API integration)
   */
  updateRates(newRates: Record<string, number>): void {
    this.rates = { ...this.rates, ...newRates };
    this.logger.log(`Exchange rates updated: ${Object.keys(newRates).join(', ')}`);
  }
}
