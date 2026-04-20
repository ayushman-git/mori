import { useCallback, useEffect, useRef, useState } from 'react';
import { quotes } from './quotes.js';

const INITIAL_FADE_IN_MS = 30;
const QUOTE_TRANSITION_MS = 200;

function App() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const quoteTransitionRef = useRef(null);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => setVisible(true), INITIAL_FADE_IN_MS);
    return () => {
      window.clearTimeout(loadTimer);
      if (quoteTransitionRef.current !== null) {
        window.clearTimeout(quoteTransitionRef.current);
      }
    };
  }, []);

  const showNextQuote = useCallback(() => {
    if (quoteTransitionRef.current !== null) {
      window.clearTimeout(quoteTransitionRef.current);
    }
    setVisible(false);

    quoteTransitionRef.current = window.setTimeout(() => {
      quoteTransitionRef.current = null;
      setIndex((current) => (current + 1) % quotes.length);
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

  const quote = quotes[index];

  return (
    <main className="quote-screen">
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
    </main>
  );
}

export default App;
