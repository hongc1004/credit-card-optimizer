import { UserCardProfile, ScoredCard, CreditCardType, RecommendationResult } from "./types";

// Helper: get cards opened in the last N months
function countCardsOpenedInMonths(cards: Array<{ openDate: string }>, months: number, refDate: Date) {
  return cards.filter(card => {
    const opened = new Date(card.openDate);
    const diffMonths = (refDate.getFullYear() - opened.getFullYear()) * 12 + (refDate.getMonth() - opened.getMonth());
    return diffMonths < months;
  }).length;
}

// Utility: check if issuer (not Chase/Amex) has another card opened within 6 months
function violatesUnified6MonthRule(
  issuer: string,
  appHistory: (CreditCardType | null)[],
  appDates: (Date | null)[],
  plannedOpenDate: Date
): boolean {
  return appHistory.filter((c, idx) =>
    c && c.issuer === issuer && appDates[idx] &&
    (plannedOpenDate.getTime() - (appDates[idx] as Date).getTime()) / (1000*60*60*24) < 180
  ).length >= 1;
}

export function selectWithConstraints(
  scoredCards: ScoredCard[],
  maxCardsToOpen: number,
  existingCards: UserCardProfile[],
  eligibleCards: CreditCardType[],
  upcomingSpend: number
): RecommendationResult {
    // return {selectedCards: [], totalValue: 0, analysis: []};
  function addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  // Memoization cache
  const memo = new Map<string, number>();

  function getMemoKey(totalSpend: number): string {
    return String(totalSpend);
  }

  function dfs(
    schedule: { card: ScoredCard; month: number }[],
    used: boolean[],
    totalSpend: number,
    best: { schedule: { card: ScoredCard; month: number }[]; value: number },
    now: Date
  ) {
    const memoKey = getMemoKey(totalSpend);
    if (memo.has(memoKey) && memo.get(memoKey)! >= best.value) return;
    memo.set(memoKey, best.value);

    if (schedule.length >= maxCardsToOpen || used.every(Boolean)) {
      const totalValue = schedule.reduce((sum, s) => sum + s.card.details.netValue, 0);
      if (totalValue > best.value) {
        best.schedule = [...schedule];
        best.value = totalValue;
      }
      return;
    }
    const totalValue = schedule.reduce((sum, s) => sum + s.card.details.netValue, 0);
    if (totalValue > best.value) {
      best.schedule = [...schedule];
      best.value = totalValue;
    }
    for (let i = 0; i < scoredCards.length; ++i) {
      if (used[i]) continue;
      const card = scoredCards[i];
      const spend = card.details.offer?.spend || 0;
      if (totalSpend + spend > upcomingSpend) continue;
      let minMonth = 0;
      if (schedule.length > 0) {
        minMonth = schedule[schedule.length - 1].month + 3;
      }
      for (let month = minMonth; month < 12; ++month) {
        const plannedOpenDate = addMonths(now, month);
        const appDates = schedule.map(s => addMonths(now, s.month)).concat([plannedOpenDate]);
        const appHistory = schedule.map(s => s.card.card).concat([card.card]);
        if (card.card.issuer === "CHASE") {
          const allCards = [
            ...existingCards.map(card => ({ openDate: card.openDate })),
            ...appDates
              .map((date, idx) => date && appHistory[idx] ? { openDate: date.toISOString().slice(0, 10) } : null)
              .filter(Boolean) as { openDate: string }[]
          ];
          const openedIn24mo = countCardsOpenedInMonths(allCards, 24, plannedOpenDate);
          if (openedIn24mo >= 5) continue;
        } else if (violatesUnified6MonthRule(card.card.issuer, appHistory, appDates, plannedOpenDate)) continue;
        const newSchedule = [...schedule, { card, month }];
        const newUsed = [...used];
        newUsed[i] = true;
        dfs(newSchedule, newUsed, totalSpend + spend, best, now);
      }
    }
  }

  const best: { schedule: { card: ScoredCard; month: number }[]; value: number } = { schedule: [], value: -Infinity };
  const now = new Date();
  dfs([], Array(scoredCards.length).fill(false), 0, best, now);
  const selectedCards = best.schedule.map(s => ({
    card: s.card,
    openSchedule: addMonths(now, s.month).toISOString().slice(0, 10)
  }));
  return {
    selectedCards,
    totalValue: best.value,
    analysis: []
  } as RecommendationResult;
}