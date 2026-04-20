import { useCallback, useEffect, useRef, useState } from 'react';
import { quotes } from './quotes.js';

const STORAGE_KEY = 'mori.quoteOfDay.v1';
const QUOTE_TRANSITION_MS = 200;

function dayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dailyIndexForDate(dateStr) {
  let h = 0;
  for (let i = 0; i < dateStr.length; i += 1) {
    h = (h * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return quotes.length ? h % quotes.length : 0;
}

function readStoredDailyIndex(today) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.date === today && typeof parsed.index === 'number') {
      const { index } = parsed;
      if (index >= 0 && index < quotes.length) return index;
    }
  } catch {
    // ignore
  }
  return null;
}

function writeStoredDailyIndex(today, index) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, index }));
  } catch {
    // ignore quota / private mode
  }
}

function initialQuoteIndex() {
  const today = dayKey();
  const stored = readStoredDailyIndex(today);
  if (stored !== null) return stored;
  const index = dailyIndexForDate(today);
  writeStoredDailyIndex(today, index);
  return index;
}

function App() {
  const [index, setIndex] = useState(initialQuoteIndex);
  const [visible, setVisible] = useState(true);
  const quoteTransitionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (quoteTransitionRef.current !== null) {
        window.clearTimeout(quoteTransitionRef.current);
      }
    };
  }, []);

  const showNextQuote = useCallback(() => {
    if (quotes.length === 0) return;

    if (quoteTransitionRef.current !== null) {
      window.clearTimeout(quoteTransitionRef.current);
    }

    setVisible(false);

    quoteTransitionRef.current = window.setTimeout(() => {
      quoteTransitionRef.current = null;
      setIndex((current) => {
        if (quotes.length <= 1) return 0;
        return (current + 1) % quotes.length;
      });
      setVisible(true);
    }, QUOTE_TRANSITION_MS);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        showNextQuote();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNextQuote]);

  const quote = quotes[index] ?? quotes[0];

  return (
    <main className="quote-screen">
      <div className="quote-stack">
        <section className={`quote-block ${visible ? 'is-visible' : ''}`} aria-live="polite">
          <p className="quote">
            <span className="quote-mark" aria-hidden="true">
              &ldquo;
            </span>
            {quote.text}
            <span className="quote-mark" aria-hidden="true">
              &rdquo;
            </span>
          </p>
          <p className={`author ${quote.author ? '' : 'is-empty'}`}>{quote.author || 'Silent'}</p>
        </section>
        <button type="button" className="new-quote-btn" onClick={showNextQuote}>
          New quote
        </button>
      </div>
    </main>
  );
}

export default App;
