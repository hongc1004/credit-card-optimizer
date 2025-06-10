
import type { components } from '@/types/api.d.ts';

// Example: type for GET /cards
export type CreditCardType = components['schemas']['CreditCard'];
export type OfferAmount = components['schemas']['OfferAmount'];
export type CardCurrency = components['schemas']['CurrenciesEnum'];

export type SimpleCardType = {
  cardId: string;
  name: string;
  issuer: string;
};

// Fetch data and parse with type
export async function getCreditCards(): Promise<CreditCardType[]> {
   const res = await fetch('https://raw.githubusercontent.com/andenacitelli/credit-card-bonuses-api/main/exports/data.json')
  if (!res.ok) throw new Error('Failed to fetch cards');
  return await res.json();
}