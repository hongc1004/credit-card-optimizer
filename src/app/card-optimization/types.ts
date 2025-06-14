
import type { components } from '@/types/api.d.ts';

export type CreditCardType = components['schemas']['CreditCard'];
export type OfferAmount = components['schemas']['OfferAmount'];
export type CardCurrency = components['schemas']['CurrenciesEnum'];
export type OfferType = CreditCardType['offers'][number];
export type CreditType = CreditCardType['credits'][number];

export type SimpleCardType = {
  cardId: string;
  name: string;
  issuer: string;
};

export type UserCardProfile = {
    cardId: string,
    name: string;
    issuer: string;
    openDate: string;
    isActive: boolean;
}

export interface RecommendationResult {
  selectedCards: {
    card: ScoredCard;
    openSchedule: string;
    details: string;
  }[];
  totalValue: number;
  analysis: string[];
}

export interface ScoredCard {
  card: CreditCardType;
  score: number;
  details: {
    offer: OfferType | null;
    netValue: number;
    offerValue: number;
    creditsValue: number;
    spendingValue: number;
  };
}

export enum RewardPreference {
  Points = 'points',
  Cashback = 'cashback',
}