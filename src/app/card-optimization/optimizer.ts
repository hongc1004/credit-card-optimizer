
import { getCreditCards } from "../lib/data";
import { filterEligibleCards, getCardCurrencyFromExisting } from "./filters";
import { scoreCards } from "./scoring";
import { selectWithConstraints } from "./selection";
import { CardCurrency, RecommendationResult, RewardPreference, UserCardProfile } from "./types";

export async function optimizeCards(
  existingCards: UserCardProfile[],
  upcomingSpend: number,
  maxCardsToOpen: number = 4,
  includeBusiness: boolean = false,
  rewardPreference: RewardPreference,
  preferredCurrency?: CardCurrency[],
): Promise<RecommendationResult> {
    const availableCards = await getCreditCards();

    const eligibleCards = filterEligibleCards(availableCards, existingCards, includeBusiness);
    const scoredCards = scoreCards(eligibleCards, upcomingSpend, rewardPreference, preferredCurrency ?? getCardCurrencyFromExisting(availableCards, existingCards));
    const selectedCards = selectWithConstraints(scoredCards, maxCardsToOpen, existingCards, eligibleCards, upcomingSpend);

    return selectedCards;
}