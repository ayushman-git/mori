import { useCallback, useEffect, useRef, useState } from 'react';
import QuoteDisplay from './QuoteDisplay.jsx';
import { THEME_STORAGE_KEY, applyDocumentTheme } from './theme.js';
import { useDailyQuote } from './useDailyQuote.js';

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

function App() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
  );
  const [copyFeedback, setCopyFeedback] = useState(false);
  const copyFeedbackRef = useRef(null);
  const themeChangedByUserRef = useRef(false);
  const quoteTextRef = useRef('');

  const { quote, visible, showNextQuote } = useDailyQuote();
  quoteTextRef.current = quote.text;

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

  useEffect(
    () => () => {
      if (copyFeedbackRef.current !== null) {
        window.clearTimeout(copyFeedbackRef.current);
      }
    },
    [],
  );

  const handleCopyQuote = useCallback(async () => {
    const text = quoteTextRef.current;
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
  }, []);

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
            <p id="quote-keyboard-hint" className="visually-hidden">
              When focus is not on a button, link, or text field, press Space to show another quote.
            </p>
            <div id="quote-live" className="quote-live" aria-live="polite" aria-atomic="true">
              <QuoteDisplay text={quote.text} author={quote.author} />
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
          <button
            type="button"
            className="new-quote-btn"
            onClick={showNextQuote}
            aria-controls="quote-live"
            aria-describedby="quote-keyboard-hint"
          >
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
          aria-label={
            theme === 'dark'
              ? 'Dark theme on; switch to light theme'
              : 'Light theme on; switch to dark theme'
          }
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
