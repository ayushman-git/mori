import { useCallback, useEffect, useRef, useState } from 'react';

/** Clears `window.setTimeout` id held in `ref` and sets the ref to `null`. */
function clearTimeoutRef(ref) {
  if (ref.current !== null) {
    window.clearTimeout(ref.current);
    ref.current = null;
  }
}

/** Fade timings should match `.quote-block` in `styles.css`. Space advances the quote. */
export function useQuoteRotator(quotes, options = {}) {
  const { initialFadeInMs = 30, transitionMs = 200 } = options;

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => setVisible(true), initialFadeInMs);
    return () => {
      window.clearTimeout(loadTimer);
      clearTimeoutRef(transitionTimeoutRef);
    };
  }, [initialFadeInMs]);

  const showNextQuote = useCallback(() => {
    clearTimeoutRef(transitionTimeoutRef);
    setVisible(false);

    transitionTimeoutRef.current = window.setTimeout(() => {
      transitionTimeoutRef.current = null;
      setIndex((current) => (current + 1) % quotes.length);
      setVisible(true);
    }, transitionMs);
  }, [quotes, transitionMs]);

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

  return { quote, visible };
}
