'use client';

import { getCreditCards } from "@/app/lib/data";
import { useState, useEffect } from "react";
import { RecommendationResult, RewardPreference, UserCardProfile } from "./card-optimization/types";
import { optimizeCards } from "./card-optimization";

export default function Home() {
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [userCards, setUserCards] = useState<UserCardProfile[]>([]);
  const [newCard, setNewCard] = useState<UserCardProfile | null>(null);
  const [cardList, setCardList] = useState<UserCardProfile[]>([]);
  const [spend, setSpend] = useState<number>(0);
  const [newOpenDate, setNewOpenDate] = useState<string>("");
  const [maxCards, setMaxCards] = useState<number>(3);
  const [includeBusiness, setIncludeBusiness] = useState<boolean>(false);
  const [rewardPreference, setRewardPreference] = useState<RewardPreference>(RewardPreference.Points);

  // TODO: Fetch all card at once instead of in effect
  useEffect(() => {
    // Fetch all card names for the select list
    getCreditCards().then((cards) => {
      setCardList(cards.map((card) => ({
        cardId: card.cardId,
        name: card.name,
        issuer: card.issuer,
        openDate: '', // default for non-user cards
        isActive: true // default for selection
      })));
    });
  }, []);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const recommendation = await optimizeCards(userCards, spend, maxCards, includeBusiness, rewardPreference);
    setRecommendation(recommendation);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCard && !userCards.some(card => card.cardId === newCard.cardId)) {
      setUserCards([
        ...userCards,
        { ...newCard, openDate: newOpenDate || "" }
      ]);
      setNewCard(null);
      setNewOpenDate("");
    }
  };

  const handleRemoveCard = (card: UserCardProfile) => {
    setUserCards(userCards.filter((c) => c.cardId !== card.cardId));
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="existing-cards">Your Existing Credit Cards:</label>
          <ul>
            {userCards.map((card) => (
              <li key={card.cardId}>
                {card.issuer}{" "}{card.name}
                <button type="button" onClick={() => handleRemoveCard(card)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              id="existing-cards"
              value={newCard ? newCard.cardId : ""}
              onChange={(e) => {
                const selected = cardList.find(card => card.cardId === e.target.value);
                setNewCard(selected || null);
              }}
            >
              <option value="">Select a card to add</option>
              {cardList
                .filter((card) => !userCards.some(userCard => userCard.cardId === card.cardId))
                .map((card) => (
                  <option key={card.cardId} value={card.cardId}>
                    {card.issuer} {card.name}
                  </option>
                ))}
            </select>
            <input
              type="date"
              value={newOpenDate}
              onChange={e => setNewOpenDate(e.target.value)}
              style={{ minWidth: 140 }}
              placeholder="Open Date (optional)"
            />
            <button
              type="button"
              disabled={!newCard}
              onClick={handleAddCard}
            >
              Add Card
            </button>
          </div>
        </div>
        <div style={{ marginTop: "16px" }}>
          <label htmlFor="spend-amount">Planned Spend Amount ($): </label>
          <input
            id="spend-amount"
            type="number"
            min="0"
            step="1"
            value={spend}
            onChange={(e) => setSpend(Number(e.target.value))}
            required
          />
        </div>
        <div style={{ marginTop: "16px" }}>
          <label htmlFor="max-cards">Max Cards to Open in a Year: </label>
          <input
            id="max-cards"
            type="number"
            min="1"
            max="12"
            step="1"
            value={maxCards}
            onChange={e => setMaxCards(Number(e.target.value))}
            required
          />
        </div>
        <div style={{ marginTop: "16px" }}>
          <label>
            <input
              type="checkbox"
              checked={includeBusiness}
              onChange={e => setIncludeBusiness(e.target.checked)}
            />
            Include Business Cards
          </label>
        </div>
        <div style={{ marginTop: "16px" }}>
          <label htmlFor="reward-preference">Reward Preference: </label>
          <select
            id="reward-preference"
            value={rewardPreference}
            onChange={e => setRewardPreference(e.target.value as RewardPreference)}
          >
            <option value="points">Points</option>
            <option value="cashback">Cashback</option>
          </select>
        </div>
        {/* Inputs for category can go here */}
        <button type="submit" style={{ marginTop: "16px" }}>
          Get Recommendation
        </button>
      </form>
      {recommendation && (
        <div>
          Recommended Cards:
          <ul>
            {recommendation.selectedCards.map((card) => (
              <li key={card.card.card.cardId}>
                {card.card.card.issuer} {card.card.card.name} (Open Date: {card.openSchedule})(Spend: ${card.card.details.offer?.spend || 0} | Net Value: ${card.card.details.netValue.toFixed(2)})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
