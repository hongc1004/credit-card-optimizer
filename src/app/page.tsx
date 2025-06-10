'use client';

import { SimpleCardType, getCreditCards } from "@/app/lib/data";
import { useState, useEffect } from "react";
import { recommendationType, recommendCreditCard } from "./recommendCard";

export default function Home() {
  const [recommendation, setRecommendation] = useState<recommendationType | null>(null);
  const [userCards, setUserCards] = useState<SimpleCardType[]>([]);
  const [newCard, setNewCard] = useState<SimpleCardType | null>(null);
  const [cardList, setCardList] = useState<SimpleCardType[]>([]);
  const [spend, setSpend] = useState<number>(0);

  // TODO: Fetch all card at once instead of in effect
  useEffect(() => {
    // Fetch all card names for the select list
    getCreditCards().then((cards) => {
      setCardList(cards.map((card) => ({ cardId: card.cardId, name: card.name, issuer: card.issuer,  })));
    });
  }, []);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const recommended = await recommendCreditCard(userCards, spend);
    setRecommendation(recommended);
  };

  const handleAddCard = (e: React.FormEvent) => {
      e.preventDefault();
      if (newCard && !userCards.some(card => card.cardId === newCard.cardId)) {
        setUserCards([...userCards, newCard]);
        setNewCard(null);
      }
    };

  const handleRemoveCard = (card: SimpleCardType) => {
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
        {/* Inputs for category can go here */}
        <button type="submit" style={{ marginTop: "16px" }}>
          Get Recommendation
        </button>
      </form>
      {recommendation && (
        <div>
          Recommended Card: {recommendation.name} (Net Value: ${recommendation.netValue.toFixed(2)})
        </div>
      )}
    </div>
  );
}
