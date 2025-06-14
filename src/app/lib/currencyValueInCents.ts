import type { CardCurrency } from "@/app/card-optimization/types";

// mapping from CardCurrency enum to point value in cents
export const currencyValueInCents: Record<CardCurrency, number> = {
  "BEST_WESTERN": 0.6,
  "BREEZE": 1.0,
  "HILTON": 0.5,
  "HYATT": 1.7,
  "IHG": 0.5,
  "MARRIOTT": 0.7,
  "RADISSON": 0.3,
  "WYNDHAM": 1.1,
  "CHOICE": 0.6,
  "AEROPLAN": 1.4,
  "ALASKA": 1.5,
  "AMERICAN": 1.5,
  "ANA": 1.4,
  "AVIANCA": 1.4,
  "AVIOS": 1.4,
  "CATHAY_PACIFIC": 1.3,
  "DELTA": 1.25,
  "EMIRATES": 1.2,
  "FRONTIER": 1.1,
  "FLYING_BLUE": 1.3,
  "HAWAIIAN": 1.5,
  "JETBLUE": 1.35,
  "KOREAN": 1.7,
  "LATAM": 1.4,
  "LUFTHANSA": 1.4,
  "SOUTHWEST": 1.3,
  "SPIRIT": 1.1,
  "UNITED": 1.35,
  "VIRGIN": 1.4,
  "AMERICAN_EXPRESS": 2.0,
  "BANK_OF_AMERICA": 1.0,
  "BARCLAYS": 1.0,
  "BILT": 2.05,
  "BREX": 1.0,
  "CHASE": 2.05,
  "CITI": 1.8,
  "CAPITAL_ONE": 1.85,
  "DISCOVER": 1.0,
  "US_BANK": 1.5,
  "WELLS_FARGO": 1.6,
  "CARNIVAL": 1.0,
  "AMTRAK": 2.5,
  "PENFED": 1.5,
  "EXPEDIA": 1.0,
  "USD": 100.0, // 1 point = $1 USD
};

export const bonusValueForCurrency = 5; // 5x value if it's preferred currency

export const spendingPoints = 1; // 1 point per dollar spent