import { CardCurrency, CreditCardType, UserCardProfile } from "./types";

// filter out cards that are already owned, discontinued
export function filterEligibleCards(availableCards: CreditCardType[], existingCards: UserCardProfile[], includeBusiness: boolean): CreditCardType[] {
  const existingCardIds = new Set(existingCards.map(card => card.cardId));
  return availableCards.filter(card => !existingCardIds.has(card.cardId) && card.discontinued !== true && (includeBusiness? card.isBusiness: !card.isBusiness) && !hasCardFromSameGroup(existingCards, card));
}

// Check if the card belongs to the same group as any existing card
export function hasCardFromSameGroup(existingCards: UserCardProfile[], card: CreditCardType): boolean {
  const groupFilter: Record<string, string> = { 'CHASE': 'Sapphire', 'WELLS_FARGO': 'Autograph' };
  
  const groupName = groupFilter[card.issuer];
  if (!groupName) {
    return false; // No group filter for this issuer
  }
  if (card.name.includes(groupName)) {
    return existingCards.some(userCard => userCard.issuer == card.issuer && card.name.includes(groupName));
  }
  
  return false;
}

export function getCardCurrencyFromExisting(availableCards: CreditCardType[], existingCards: UserCardProfile[]): CardCurrency[] {
  const currencies = new Set<CardCurrency>();
  for (const userCard of existingCards) {
    const match = availableCards.find(card => card.cardId === userCard.cardId);
    if (match && match.currency) {
      currencies.add(match.currency);
    }
  }
  return Array.from(currencies);
}