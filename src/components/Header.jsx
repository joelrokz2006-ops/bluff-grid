import React from 'react';
import { fmt2 } from '../utils/constants';

export default function Header({ balance, sound, onToggleSound, onOpenHelp, bumpBalance }) {
  return (
    <header>
      <div className="brand">
        <h1>
          <span className="sm">♠&#xFE0E;</span> BLUFF GRID{' '}
          <span className="sm">♣&#xFE0E;</span>
        </h1>
        <div className="tag">READ THE TELL · BEAT THE HOUSE</div>
      </div>
      <div className="hud">
        <div className={`bankroll ${bumpBalance ? 'bump' : ''}`}>
          <div className="lbl">BANKROLL</div>
          <strong>${fmt2(balance)}</strong>
        </div>
        <button
          className={`icon-btn ${!sound ? 'off' : ''}`}
          type="button"
          aria-label="Toggle sound"
          onClick={onToggleSound}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 5 L6 9 H3 v6 h3 l5 4 z" fill="currentColor" stroke="none" />
            {sound ? (
              <g className="on-ico">
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18 6a8.5 8.5 0 0 1 0 12" />
              </g>
            ) : (
              <g className="off-ico">
                <path d="M16 9l6 6M22 9l-6 6" />
              </g>
            )}
          </svg>
        </button>
        <button
          className="icon-btn"
          type="button"
          aria-label="How to play"
          onClick={onOpenHelp}
        >
          ?
        </button>
      </div>
    </header>
  );
}
