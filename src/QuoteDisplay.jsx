import { memo } from 'react';

function QuoteDisplay({ text, author }) {
  return (
    <>
      <blockquote className="quote">
        <span className="quote-mark" aria-hidden="true">
          &ldquo;
        </span>
        {text}
        <span className="quote-mark" aria-hidden="true">
          &rdquo;
        </span>
      </blockquote>
      {author ? (
        <footer className="author">
          <cite className="author-cite">{author}</cite>
        </footer>
      ) : (
        <footer className="author is-empty" aria-hidden="true" />
      )}
    </>
  );
}

export default memo(QuoteDisplay);
