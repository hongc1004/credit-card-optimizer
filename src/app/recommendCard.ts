import { getCreditCards } from "@/app/lib/data";
import { currencyValueInCents } from "./lib/currencyValueInCents";
import { CardCurrency, CreditCardType, SimpleCardType } from "./card-optimization/types";

export type OfferType = CreditCardType['offers'][number];
export type CreditType = CreditCardType['credits'][number];
export type recommendationType = {
  name: string;
  netValue: number;}

function getValueFromCredits(credits: CreditType[], defaultCurrency: CardCurrency): number {
    let totalValue = 0;

    for (const credit of credits) {
        const currency = credit.currency || defaultCurrency;
        totalValue += credit.value * credit.weight * currencyValueInCents[currency] / 100;
    }

    return totalValue;
}

function getMaxValueFromOffers(offers: OfferType[], upcomingSpend: number, defaultCurrency: CardCurrency): number {
    let maxBonus = 0;
    
    for (const offer of offers) {
        if (upcomingSpend >= offer.spend) {
            const offerAmountOptions = offer.amount.map((amount) => {
                const currency = amount.currency || defaultCurrency;
                const baseValue = amount.amount * currencyValueInCents[currency] / 100;
                return baseValue + getValueFromCredits(offer.credits || [], currency);
            });
            maxBonus = Math.max(maxBonus, Math.max(...offerAmountOptions));
        }
    }

    return maxBonus;
}

export async function recommendCreditCard(currentCards: SimpleCardType[], upcomingSpend: number): Promise<recommendationType | null> {
    const creditCards = await getCreditCards();

    const currentCardIds = currentCards.map(card => card.cardId);
    const eligibleCards = creditCards.filter(
        (card) => !currentCardIds.includes(card.cardId) && card.discontinued !== true
    );
    // for each card, check the offers to see if there's signup bonus and rewards that can be earned
    const recommendations = eligibleCards.map((card) => {
        const signupBonus =
            getMaxValueFromOffers(card.offers, upcomingSpend, card.currency);
        const creditsValue = getValueFromCredits(card.credits || [], card.currency);
        const netValue = signupBonus + creditsValue - (card.isAnnualFeeWaived ? 0 : card.annualFee);
    return { name: card.name, netValue};
  });

  recommendations.sort((a, b) => b.netValue - a.netValue);
  return recommendations[0] || null;
}