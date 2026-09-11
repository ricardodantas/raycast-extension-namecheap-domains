import type { DomainCheckResult, PricingTable } from "../namecheap/types";
import { splitDomain } from "./normalize";

export interface DomainPrice {
  amount: number;
  currency: string;
  /** Namecheap's regular price, when it is higher than the current one. */
  regular?: number;
  premium: boolean;
  /** ICANN fee, already excluded from `amount`. */
  icannFee: number;
}

export function formatPrice(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: amount >= 1000 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/**
 * Registration price for a domain: the premium price Namecheap quotes for premium names,
 * otherwise the standard price of its TLD for the requested term.
 */
export function priceForDomain(
  domain: string,
  pricing: PricingTable,
  years = 1,
  check?: DomainCheckResult,
): DomainPrice | undefined {
  const { tld } = splitDomain(domain, Object.keys(pricing));
  const entry = pricing[tld];
  const currency = entry?.currency ?? "USD";

  if (check?.isPremium && check.premiumRegistrationPrice > 0) {
    return { amount: check.premiumRegistrationPrice, currency, premium: true, icannFee: check.icannFee };
  }

  const amount = entry?.byYears[years];
  if (amount === undefined) return undefined;
  const regular = entry?.regularByYears[years];
  return {
    amount,
    currency,
    regular: regular !== undefined && regular > amount ? regular : undefined,
    premium: false,
    icannFee: check?.icannFee ?? 0,
  };
}

/**
 * Human label for a price. Namecheap quotes a per-year rate for each term, so a multi-year
 * term reads as a yearly rate; the exact total is confirmed at checkout.
 */
export function priceLabel(price: DomainPrice, years: number): string {
  const formatted = formatPrice(price.amount, price.currency);
  if (price.premium) return `${formatted} premium`;
  return years === 1 ? `${formatted}/yr` : `${formatted}/yr for ${years} years`;
}
