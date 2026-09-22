import React from 'react';

export default function Toasts({ toasts }) {
  return (
    <div id="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type === 'bad' ? 'bad' : ''} ${t.out ? 'out' : ''}`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
