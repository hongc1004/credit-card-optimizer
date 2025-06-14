import { UserCardProfile, ScoredCard, CreditCardType, RecommendationResult } from "./types";

export function selectWithConstraints(
  scoredCards: ScoredCard[],
  maxCardsToOpen: number,
  existingCards: UserCardProfile[],
  eligibleCards: CreditCardType[],
  upcomingSpend: number
): RecommendationResult {
  const now = new Date();
  const GAP_MONTHS = 12 / maxCardsToOpen; // Minimum gap between card openings
  const MAX_MONTHS = 12;
  let totalSpend = 0;
  const schedule: { card: ScoredCard; month: number }[] = [];
  const used: boolean[] = Array(scoredCards.length).fill(false);
  const appDates: Date[] = [];
  const appHistory: CreditCardType[] = [];

  const sorted = [...scoredCards].sort((a, b) => b.score - a.score);

  let lastMonth = -GAP_MONTHS;
  for (let pick = 0; pick < maxCardsToOpen && schedule.length < maxCardsToOpen; ++pick) {
    let chosenIdx = -1;
    let chosenMonth = -1;
    for (let i = 0; i < sorted.length; ++i) {
      if (used[i]) continue;
      const card = sorted[i];
      const spend = card.details.offer?.spend || 0;
      if (totalSpend + spend > upcomingSpend) continue;
      // Find earliest valid month for this card
      const minMonth = lastMonth + GAP_MONTHS;
      let found = false;
      for (let month = minMonth; month < MAX_MONTHS; ++month) {
        const plannedOpenDate = new Date(now);
        plannedOpenDate.setMonth(now.getMonth() + month);
        const newAppDates = [...appDates, plannedOpenDate];
        const newAppHistory = [...appHistory, card.card];
        // Chase 5/12 rule
        if (card.card.issuer === "CHASE") {
          const allCards = [
            ...existingCards.map(card => ({ openDate: card.openDate })),
            ...newAppDates
              .map((date, idx) => date && newAppHistory[idx] ? { openDate: date.toISOString().slice(0, 10) } : null)
              .filter(Boolean) as { openDate: string }[]
          ];
          const openedIn24mo = countCardsOpenedInMonths(allCards, 24, plannedOpenDate);
          if (openedIn24mo >= 5) continue;
        } else if (isEligibleForIssuer(card.card.issuer, existingCards, appHistory, appDates, plannedOpenDate)) continue;
        // If all constraints pass, pick this card/month
        chosenIdx = i;
        chosenMonth = month;
        found = true;
        break;
      }
      if (found) break;
    }
    if (chosenIdx === -1) break; // No more valid cards
    // Schedule the chosen card
    const card = sorted[chosenIdx];
    const spend = card.details.offer?.spend || 0;
    totalSpend += spend;
    used[chosenIdx] = true;
    lastMonth = chosenMonth;
    const plannedOpenDate = new Date(now);
    plannedOpenDate.setMonth(now.getMonth() + chosenMonth);
    schedule.push({ card, month: chosenMonth });
    appDates.push(plannedOpenDate);
    appHistory.push(card.card);
  }
  const selectedCards = schedule.map(s => ({
    card: s.card,
    openSchedule: new Date(now.getFullYear(), now.getMonth() + s.month, now.getDate()).toISOString().slice(0, 10),
    details: generateDetailsForCard(s.card),
  }));
  return {
    selectedCards,
    totalValue: schedule.reduce((sum, s) => sum + s.card.details.netValue, 0),
    analysis: []
  } as RecommendationResult;
}

// Helper: get cards opened in the last N months
function countCardsOpenedInMonths(cards: Array<{ openDate: string }>, months: number, refDate: Date) {
  return cards.filter(card => {
    const opened = new Date(card.openDate);
    const diffMonths = (refDate.getFullYear() - opened.getFullYear()) * 12 + (refDate.getMonth() - opened.getMonth());
    return diffMonths < months;
  }).length;
}

// Utility: check if issuer (not Chase) has another card opened within 6 months
function isEligibleForIssuer(
  issuer: string,
  existingCards: UserCardProfile[],
  appHistory: (CreditCardType | null)[],
  appDates: (Date | null)[],
  plannedOpenDate: Date
): boolean {
    const combinedAppDates = [
      ...existingCards.filter(card => card.issuer === issuer).map(card => new Date(card.openDate)),
      ...appHistory.filter(card => card && card.issuer === issuer).map((card, idx) => card ? appDates[idx] as Date : null).filter(Boolean)
    ];
  return combinedAppDates.filter((c) =>
    c && (plannedOpenDate.getTime() - c.getTime()) / (1000*60*60*24) < 180
  ).length >= 1;
}

function generateDetailsForCard(card: ScoredCard): string {
  const { offer, offerValue, creditsValue, spendingValue } = card.details;
  const annualFee = card.card.isAnnualFeeWaived ? 0 : card.card.annualFee;
  let offerAmount = 0;
  let offerCurrency = card.card.currency;
  if (offer && Array.isArray(offer.amount) && offer.amount.length > 0) {
    offerAmount = offer.amount[0].amount ?? 0;
    offerCurrency = offer.amount[0].currency || card.card.currency;
  }

  let details = `Annual Fee: $${annualFee}\n`;
  if (offer) {
    details += `Offer: ${offerAmount} ${offerCurrency !== 'USD' ? 'points' : 'dollars'} from Signup Bonus\n`;
    details += `\n`;
  }
  details += `Offer Value: $${offerValue.toFixed(2)}\n`;
  details += `Credits Value: $${creditsValue.toFixed(2)}\n`;
  details += `Spending Value: $${spendingValue.toFixed(2)}\n`;
  return details;
}

