import { CardCurrency, CreditCardType, SimpleCardType, getCreditCards } from "@/app/lib/data";

export type OfferType = CreditCardType['offers'][number];
export type recommendationType = {
  name: string;
  netValue: number;}

function calculateMaxBonus(offers: OfferType[], upcomingSpend: number, defaultCurrency: CardCurrency): number {
    let maxBonus = 0;
    
    for (const offer of offers) {
        if (upcomingSpend >= offer.spend) {
            const offerAmountOptions = offer.amount.map((amount) => {
                const currency = amount.currency || defaultCurrency;
                if (currency === 'USD') {
                    // If the currency is USD or not specified, return the amount
                    return amount.amount;
                } else {
                    // TODO: Assign points value based on currency
                    return amount.amount / 100;
                }
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
        (card) => !currentCardIds.includes(card.cardId)
    );
    // for each card, check the offers to see if there's signup bonus and rewards that can be earned
    const recommendations = eligibleCards.map((card) => {
        const signupBonus =
            calculateMaxBonus(card.offers, upcomingSpend, card.currency);
        const netValue = signupBonus - card.annualFee;
    return { name: card.name, netValue};
  });

  recommendations.sort((a, b) => b.netValue - a.netValue);
  return recommendations[0] || null;
}