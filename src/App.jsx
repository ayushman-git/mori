import { quotes } from './quotes.js';
import { useQuoteRotator } from './useQuoteRotator.js';

function App() {
  const { quote, visible } = useQuoteRotator(quotes);

  return (
    <main className="quote-screen" aria-label="Quote">
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
