import { CardCurrency, CreditCardType, UserCardProfile } from "./types";

// filter out cards that are already owned, discontinued
export function filterEligibleCards(availableCards: CreditCardType[], existingCards: UserCardProfile[], includeBusiness: boolean): CreditCardType[] {
  const existingCardIds = new Set(existingCards.map(card => card.cardId));
  return availableCards.filter(card => !existingCardIds.has(card.cardId) && card.discontinued !== true && (!card.isBusiness || includeBusiness));
}

export function getCardCurrencyFromExisting(availableCards: CreditCardType[], existingCards: UserCardProfile[]): CardCurrency[] {
  const currencies = new Set<CardCurrency>();
  for (const userCard of existingCards) {
    const match = availableCards.find(card => card.cardId === userCard.cardId);
    if (match && match.currency) {
      currencies.add(match.currency);
    }
  }
  console.log("getCardCurrencyFromExisting", Array.from(currencies));
  return Array.from(currencies);
}