import { useCallback, useEffect, useRef, useState } from 'react';
import { quotes } from './quotes.js';
import { THEME_STORAGE_KEY, applyDocumentTheme } from './theme.js';

function getThemeFromDocument() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

const STORAGE_KEY = 'mori.quoteOfDay.v1';
const QUOTE_TRANSITION_MS = 200;
const COPY_FEEDBACK_MS = 2000;

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(ta);
  }
}

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
    if (
      parsed?.date === today &&
      typeof parsed.index === 'number' &&
      Number.isInteger(parsed.index)
    ) {
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
  const [copyFeedback, setCopyFeedback] = useState(false);
  const quoteTransitionRef = useRef(null);
  const copyFeedbackRef = useRef(null);
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
      if (copyFeedbackRef.current !== null) {
        window.clearTimeout(copyFeedbackRef.current);
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
      setCopyFeedback(false);
      if (copyFeedbackRef.current !== null) {
        window.clearTimeout(copyFeedbackRef.current);
        copyFeedbackRef.current = null;
      }
      setIndex((current) => {
        if (quotes.length <= 1) return 0;
        return (current + 1) % quotes.length;
      });
      setVisible(true);
    }, QUOTE_TRANSITION_MS);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code !== 'Space' || event.repeat) return;
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('button, a[href], input, select, textarea, [contenteditable="true"]')
      ) {
        return;
      }
      event.preventDefault();
      showNextQuote();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNextQuote]);

  const quote = quotes[index] ?? quotes[0];

  const handleCopyQuote = useCallback(async () => {
    const text = quote?.text ?? '';
    if (!text) return;
    try {
      await copyTextToClipboard(text);
      setCopyFeedback(true);
      if (copyFeedbackRef.current !== null) {
        window.clearTimeout(copyFeedbackRef.current);
      }
      copyFeedbackRef.current = window.setTimeout(() => {
        copyFeedbackRef.current = null;
        setCopyFeedback(false);
      }, COPY_FEEDBACK_MS);
    } catch {
      // Clipboard denied or unavailable; avoid console noise
    }
  }, [quote]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to quote
      </a>
      <main id="main-content" className="quote-screen" tabIndex={-1}>
        <div className="quote-stack">
          <section
            className={`quote-block ${visible ? 'is-visible' : ''}`}
            aria-labelledby="quote-heading"
          >
            <h1 id="quote-heading" className="visually-hidden">
              Quote of the day
            </h1>
            <div className="quote-live" aria-live="polite" aria-atomic="true">
              <blockquote className="quote">
                <span className="quote-mark" aria-hidden="true">
                  &ldquo;
                </span>
                {quote.text}
                <span className="quote-mark" aria-hidden="true">
                  &rdquo;
                </span>
              </blockquote>
              {quote.author ? (
                <footer className="author">
                  <cite className="author-cite">{quote.author}</cite>
                </footer>
              ) : (
                <footer className="author is-empty" aria-hidden="true" />
              )}
            </div>
            <div className="quote-copy-row">
              <button
                type="button"
                className="quote-copy-btn"
                onClick={handleCopyQuote}
                aria-label="Copy quote to clipboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </button>
              <span className="quote-copy-feedback" role="status">
                {copyFeedback ? 'Copied to clipboard' : ''}
              </span>
            </div>
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
          role="switch"
          aria-checked={theme === 'dark'}
          aria-label="Dark mode"
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
