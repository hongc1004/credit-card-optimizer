'use client';

import { getCreditCards } from "@/app/lib/data";
import { useRef, useState, useEffect } from "react";
import { RecommendationResult, RewardPreference, UserCardProfile } from "./card-optimization/types";
import { optimizeCards } from "./card-optimization";

export default function Home() {
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [userCards, setUserCards] = useState<UserCardProfile[]>([]);
  const [newCard, setNewCard] = useState<UserCardProfile | null>(null);
  const [cardList, setCardList] = useState<UserCardProfile[]>([]);
  const [spend, setSpend] = useState<number>(0);
  const [newOpenDate, setNewOpenDate] = useState<string>("");
  const [maxCards, setMaxCards] = useState<number>(4);
  const [includeBusiness, setIncludeBusiness] = useState<boolean>(false);
  const [rewardPreference, setRewardPreference] = useState<RewardPreference>(RewardPreference.Points);
  const [openDetailsCardId, setOpenDetailsCardId] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        detailsRef.current &&
        !detailsRef.current.contains(event.target as Node)
      ) {
        setOpenDetailsCardId(null);
      }
    }
    if (openDetailsCardId) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDetailsCardId]);

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
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 32, fontWeight: 700, fontSize: 28, color: '#111' }}>Credit Card Recommendation</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24, color: '#111' }}>
        <div>
          <label htmlFor="existing-cards" style={{ fontWeight: 600, color: '#111' }}>Your Existing Credit Cards:</label>
          <ul style={{ margin: '12px 0', padding: 0, listStyle: 'none' }}>
            {userCards.map((card) => (
              <li key={card.cardId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>{card.issuer} {card.name}</span>
                <button type="button" onClick={() => handleRemoveCard(card)} style={{ background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}>Remove</button>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
            <select
              id="existing-cards"
              value={newCard ? newCard.cardId : ""}
              onChange={(e) => {
                const selected = cardList.find(card => card.cardId === e.target.value);
                setNewCard(selected || null);
              }}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', minWidth: 180 }}
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
              style={{ minWidth: 140, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
              placeholder="Open Date (optional)"
            />
            <button
              type="button"
              disabled={!newCard}
              onClick={handleAddCard}
              style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 600, cursor: newCard ? 'pointer' : 'not-allowed' }}
            >
              Add Card
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="spend-amount" style={{ fontWeight: 600, color: '#111' }}>Planned Yearly Spend Amount ($): </label>
            <input
              id="spend-amount"
              type="number"
              min="0"
              step="1"
              value={spend}
              onChange={(e) => setSpend(Number(e.target.value))}
              required
              style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="max-cards" style={{ fontWeight: 600, color: '#111' }}>
              Max Cards to Open in a Year:
            </label>
            <input
              id="max-cards"
              type="number"
              min="1"
              max="12"
              step="1"
              value={maxCards}
              onChange={e => setMaxCards(Number(e.target.value))}
              required
              style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={includeBusiness}
              onChange={e => setIncludeBusiness(e.target.checked)}
              id="include-business"
              style={{ accentColor: '#1976d2' }}
            />
            <label htmlFor="include-business" style={{ fontWeight: 600, cursor: 'pointer', color: '#111' }}>Include Business Cards</label>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="reward-preference" style={{ fontWeight: 600, color: '#111' }}>Reward Preference: </label>
            <select
              id="reward-preference"
              value={rewardPreference}
              onChange={e => setRewardPreference(e.target.value as RewardPreference)}
              style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
            >
              <option value="points">Points</option>
              <option value="cashback">Cashback</option>
            </select>
          </div>
        </div>
        <button type="submit" style={{ marginTop: 24, background: '#43a047', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 0', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>
          Get Recommendation
        </button>
      </form>
      {recommendation && (
        <div style={{ marginTop: 40, background: '#f5f5f5', borderRadius: 8, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 16, color: '#111' }}>Recommended Cards</h2>
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {recommendation.selectedCards.map((card) => (
              <li key={card.card.card.cardId} style={{ marginBottom: 18, padding: 12, background: '#fff', borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 4, color: '#111', position: 'relative' }}>
                <span style={{ fontWeight: 600, fontSize: 16 }}>
                  <a
                    href={card.card.card.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1976d2', textDecoration: 'none' }}
                  >
                    {card.card.card.issuer} {card.card.card.name}
                  </a>
                </span>
                <span style={{ color: '#111' }}>Open Date: <b>{card.openSchedule}</b></span>
                <span style={{ color: '#111', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Spend: <b>${card.card.details.offer?.spend || 0}</b> | Net Value: <b>${card.card.details.netValue.toFixed(2)}</b>
                  <button
                    type="button"
                    aria-label="Show details"
                    onClick={() => setOpenDetailsCardId(openDetailsCardId === card.card.card.cardId ? null : card.card.card.cardId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1976d2',
                      cursor: 'pointer',
                      fontSize: 16,
                      marginLeft: 4,
                      padding: 0,
                      lineHeight: 1,
                      fontWeight: 700
                    }}
                  >
                    ?
                  </button>
                  {openDetailsCardId === card.card.card.cardId && (
                    <div
                      ref={detailsRef}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '100%',
                        transform: 'translateY(-50%)',
                        marginLeft: 12,
                        zIndex: 10,
                        background: '#fff',
                        color: '#111',
                        border: '1px solid #ccc',
                        borderRadius: 8,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                        padding: 16,
                        minWidth: 260,
                        maxWidth: 340,
                        fontSize: 15,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      <div style={{ marginTop: 8 }}>{card.details}</div>
                    </div>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
