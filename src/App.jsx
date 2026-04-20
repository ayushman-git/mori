import { useCallback, useEffect, useRef, useState } from 'react';
import { quotes } from './quotes.js';
import {
  THEME_STORAGE_KEY,
  applyDocumentTheme,
} from './theme.js';

function getThemeFromDocument() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

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
  const [theme, setTheme] = useState(getThemeFromDocument);
  const [index, setIndex] = useState(initialQuoteIndex);
  const [visible, setVisible] = useState(true);
  const quoteTransitionRef = useRef(null);
  const themeChangedByUserRef = useRef(false);

  useEffect(() => {
    applyDocumentTheme(theme);
    if (!themeChangedByUserRef.current) return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore quota / private mode
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    themeChangedByUserRef.current = true;
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

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

  const themeLabel =
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <>
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
      <div className="theme-toggle-wrap">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={themeLabel}
        >
          {theme === 'dark' ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}

export default App;
