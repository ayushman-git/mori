import { useCallback, useEffect, useRef, useState } from 'react';

const quotes = [
  { text: 'You are what you do repeatedly.', author: 'Aristotle' },
  { text: 'He who has a why can bear almost any how.', author: 'Friedrich Nietzsche' },
  { text: 'No one is coming. That is the point.', author: '' },
  { text: 'Become the person you keep waiting for.', author: '' },
  { text: 'Your habits are your real ambition.', author: '' },
  { text: 'Standards beat motivation.', author: '' },
  { text: 'The work knows when you lied.', author: '' },
  { text: 'Comfort is a slow contract with regret.', author: '' },
  { text: 'Discipline is self-respect in action.', author: '' },
  { text: 'Do it tired. Do it unsure. Do it anyway.', author: '' },
  { text: 'You do not need more time. You need fewer excuses.', author: '' },
  { text: 'Your future is built when no one is watching.', author: '' },
  { text: 'Win the morning. Earn the night.', author: '' },
  { text: 'The version of you that wins is already watching.', author: '' },
  { text: 'Be harder to kill than your excuses.', author: '' },
  { text: 'Every skipped rep becomes evidence.', author: '' },
  { text: 'You are one decision from momentum.', author: '' },
  { text: 'Show up until showing up becomes identity.', author: '' },
  { text: 'Your potential is offended by your comfort.', author: '' },
  { text: 'The gap is not talent. The gap is consistency.', author: '' },
  { text: 'Act like your standards are watching.', author: '' },
  { text: 'Small promises kept become a different life.', author: '' },
  { text: 'You cannot become elite casually.', author: '' },
  { text: 'The hard thing is usually the honest thing.', author: '' },
  { text: 'Make discipline louder than doubt.', author: '' },
  { text: 'Your life follows what you repeat.', author: '' },
  { text: 'If it matters, it gets scheduled.', author: '' },
  { text: 'The body keeps receipts.', author: '' },
  { text: 'Do not negotiate with the weaker version of you.', author: '' },
  { text: 'You are training your future self right now.', author: '' },
  { text: 'Results prefer obsession to interest.', author: '' },
  { text: 'The best version of you is not convenient.', author: '' },
  { text: 'Earn confidence by keeping promises alone.', author: '' },
  { text: 'Your ceiling moves when your standards do.', author: '' },
  { text: 'Stop asking for easy. Ask for useful.', author: '' },
  { text: 'The work is the shortcut.', author: '' },
  { text: 'Be the proof you keep looking for.', author: '' },
  { text: 'You either build yourself or drift.', author: '' },
  { text: 'Make today hard enough to make tomorrow lighter.', author: '' },
  { text: 'The mirror does not care about intention.', author: '' },
  { text: 'Your discipline is your private reputation.', author: '' },
];

function App() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const quoteTransitionRef = useRef(null);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => setVisible(true), 30);
    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    return () => {
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
    }, 200);
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
