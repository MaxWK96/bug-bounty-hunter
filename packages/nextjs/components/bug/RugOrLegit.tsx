"use client";

import { useEffect, useState } from "react";
import { TOKEN_PROFILES, TokenProfile, Verdict } from "./rugOrLegitProfiles";

// fisher-yates
const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

type Props = {
  onAnswer: (correct: boolean) => void;
};

export const RugOrLegit = ({ onAnswer }: Props) => {
  const [deck, setDeck] = useState<TokenProfile[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Verdict | null>(null);

  // shuffle on the client, otherwise hydration error
  useEffect(() => {
    setDeck(shuffle(TOKEN_PROFILES));
  }, []);

  const card = deck.length > 0 ? deck[index % deck.length] : undefined;

  const answer = (verdict: Verdict) => {
    if (!card || picked) return;
    setPicked(verdict);
    onAnswer(verdict === card.verdict);
  };

  const next = () => {
    setPicked(null);
    setIndex(i => i + 1);
  };

  if (!card) return null;

  const correct = picked !== null && picked === card.verdict;
  const borderColor = picked === null ? "border-transparent" : correct ? "border-success" : "border-error";

  return (
    <div className="my-4 text-left">
      <p className="text-center text-sm opacity-70 mb-3">
        While you wait: is this token a <span className="font-bold">rug or legit?</span>
      </p>

      <div className={`card bg-base-300 p-5 font-mono border-2 transition-colors ${borderColor}`}>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{card.emoji}</span>
          <div>
            <p className="text-lg font-bold">{card.name}</p>
            <p className="text-sm opacity-70">${card.ticker}</p>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {card.facts.map(fact => (
            <li key={fact} className="text-sm">
              • {fact}
            </li>
          ))}
        </ul>

        {picked !== null && (
          <div className="mt-4">
            <p className={`font-bold ${correct ? "text-success" : "text-error"}`}>
              {correct ? "✅ Correct!" : "❌ Wrong!"} Verdict: {card.verdict === "rug" ? "RUG 🚩" : "LEGIT ✅"}
            </p>
            <p className="text-sm mt-1">{card.why}</p>
          </div>
        )}
      </div>

      {picked === null ? (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button className="btn btn-error" onClick={() => answer("rug")}>
            🚩 Rug
          </button>
          <button className="btn btn-success" onClick={() => answer("legit")}>
            ✅ Legit
          </button>
        </div>
      ) : (
        <button className="btn btn-primary w-full mt-4" onClick={next}>
          Next token →
        </button>
      )}
    </div>
  );
};
