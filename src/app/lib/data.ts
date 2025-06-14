import { CreditCardType } from "../card-optimization/types";

// Fetch data and parse with type
export async function getCreditCards(): Promise<CreditCardType[]> {
   const res = await fetch('https://raw.githubusercontent.com/andenacitelli/credit-card-bonuses-api/main/exports/data.json')
  if (!res.ok) throw new Error('Failed to fetch cards');
  return await res.json();
}