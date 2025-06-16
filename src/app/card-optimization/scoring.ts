import { bonusValueForCurrency, currencyValueInCents, spendingPoints } from "../lib/currencyValueInCents";
import { CardCurrency, CreditCardType, CreditType, OfferType, RewardPreference, ScoredCard } from "./types";

// consider annual fee, spending requirements, signup bonus, preferred currency
export function scoreCards(cards: CreditCardType[], upcomingSpend: number, rewardPreference: RewardPreference, preferredCurrency: CardCurrency[]): ScoredCard[] {
    return cards.map((card) => {
        return scoreCard(card, upcomingSpend, card.currency, rewardPreference, preferredCurrency);
    });
}

function scoreCard(card: CreditCardType, upcomingSpend: number, defaultCurrency: CardCurrency, rewardPreference: RewardPreference, preferredCurrency: CardCurrency[]): ScoredCard {
  const {bestOffer, offerValue} = getSignupBonusValue(card.offers, upcomingSpend, defaultCurrency, rewardPreference, card.universalCashbackPercent);
  const creditsValue = getValueFromCredits(card.credits || [], defaultCurrency);
  const annualFee = card.isAnnualFeeWaived ? 0 : card.annualFee;
  const spendingValue = getOfferSpendingValue(bestOffer, defaultCurrency, rewardPreference, card.universalCashbackPercent);
  const netValue = offerValue + creditsValue + spendingValue - annualFee;
  const score = rewardPreference === RewardPreference.Points ? netValue * getBonusValueFromCurrency(defaultCurrency, preferredCurrency) : netValue;

  return {card, score, details: {offer: bestOffer, netValue, offerValue, spendingValue, creditsValue}};
}

function getSignupBonusValue(offers: OfferType[], upcomingSpend: number, defaultCurrency: CardCurrency, rewardPreference: RewardPreference, cashbackPercent: number): {bestOffer: OfferType | null, offerValue: number} {
    let offerValue = 0;
    let bestOffer = null;
    
    for (const offer of offers) {
        if (offer.spend == 0.01) {
            offer.spend = 0; // Treat 0.01 as no spending requirements
        }
        if (upcomingSpend >= offer.spend) {
            for (const amount of offer.amount) {
                const currency = amount.currency || defaultCurrency;
                const baseValue = amount.amount * getCurrencyValueInCents(rewardPreference, currency, cashbackPercent) / 100;
                const credits = getValueFromCredits(offer.credits || [], currency);
                if (baseValue + credits > offerValue) {
                    bestOffer = offer;
                    offerValue = baseValue + credits;;
                }
            }

        }
    }

    return { bestOffer, offerValue,};
}

function getValueFromCredits(credits: CreditType[], defaultCurrency: CardCurrency): number {
    let totalValue = 0;

    for (const credit of credits) {
        const currency = credit.currency || defaultCurrency;
        totalValue += credit.value * credit.weight * currencyValueInCents[currency] / 100;
    }

    return totalValue;
}

function getOfferSpendingValue(offer: OfferType | null, defaultCurrency: CardCurrency, rewardPreference: RewardPreference, cashbackPercent: number): number {
    if (!offer) return 0;
    if (defaultCurrency === "USD" && rewardPreference === RewardPreference.Points) {
        return offer.spend * cashbackPercent / 100; // USD is always points
    }
    const amortizedPoints = offer.spend * spendingPoints;
    return amortizedPoints * currencyValueInCents[defaultCurrency] / 100;
}

function getCurrencyValueInCents(rewardPreference: RewardPreference, currency: CardCurrency, cashbackPercent: number): number {
    return rewardPreference === RewardPreference.Points ? currencyValueInCents[currency] : cashbackPercent;
}

function getBonusValueFromCurrency(currency: CardCurrency, preferredCurrency: CardCurrency[]): number {
    return preferredCurrency.includes(currency) ? bonusValueForCurrency : 1;
}