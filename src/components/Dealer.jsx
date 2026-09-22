import React from 'react';
import { fmt2 } from '../utils/constants';

export default function Dealer({
  mood,
  isTalking,
  isTelling,
  speechText,
  bubblePop,
  nextOdds,
  rec,
  session,
  historyDots,
}) {
  let dealerClasses = [];
  if (isTalking) dealerClasses.push('e-talk');
  if (isTelling) dealerClasses.push('e-tell');
  if (mood === 'smug') dealerClasses.push('e-smug');
  if (mood === 'angry') dealerClasses.push('e-angry');
  if (mood === 'happy') dealerClasses.push('e-happy');

  return (
    <section id="dealerBand">
      <div className="avatar-wrap">
        <svg
          id="dealer"
          className={dealerClasses.join(' ')}
          viewBox="0 0 220 240"
          aria-hidden="true"
        >
          {/* Suit body & shoulders */}
          <path
            d="M28 240 C34 192 66 168 110 168 C154 168 186 192 192 240 Z"
            fill="#262b33"
          />
          {/* Pocket square */}
          <path d="M146 202 l13 -8 l5 10 z" fill="#c9a355" opacity=".9" />
          {/* Shirt */}
          <path d="M94 240 L98 178 L110 172 L122 178 L126 240 Z" fill="#efe4cc" />
          {/* Bow tie */}
          <path
            d="M110 193 L92 183 L92 205 Z M110 193 L128 183 L128 205 Z"
            fill="#8e2430"
          />
          <circle cx="110" cy="193" r="6" fill="#6d1a24" />
          {/* Neck */}
          <rect x="96" y="142" width="28" height="34" rx="10" fill="#e0b489" />
          {/* Head & ears */}
          <ellipse cx="110" cy="92" rx="50" ry="58" fill="#ecc79a" />
          <ellipse cx="60" cy="98" rx="9" ry="13" fill="#e0b489" />
          <ellipse cx="160" cy="98" rx="9" ry="13" fill="#e0b489" />
          {/* Hat */}
          <path d="M60 56 Q110 40 160 56 L160 44 Q110 26 60 44 Z" fill="#1f4a36" />
          <circle cx="110" cy="38" r="4" fill="#16352a" />
          <path
            d="M58 58 Q110 76 162 58 L162 68 Q110 88 58 68 Z"
            fill="#2e6b4f"
            opacity=".93"
          />
          {/* Eyebrows */}
          <rect
            className="brow brow-l"
            x="74"
            y="82"
            width="28"
            height="6"
            rx="3"
            fill="#3a2b20"
          />
          <rect
            className="brow brow-r"
            x="118"
            y="82"
            width="28"
            height="6"
            rx="3"
            fill="#3a2b20"
          />
          {/* Left Eye */}
          <g className="eye">
            <ellipse cx="88" cy="104" rx="12.5" ry="9" fill="#fdfbf4" />
            <g className="pupil">
              <circle cx="88" cy="104" r="5.4" fill="#1c1512" />
              <circle cx="90" cy="102" r="1.8" fill="#fff" opacity=".9" />
            </g>
            <rect className="lid" x="75.5" y="95" width="25" height="18" fill="#ecc79a" />
          </g>
          {/* Right Eye */}
          <g className="eye">
            <ellipse cx="132" cy="104" rx="12.5" ry="9" fill="#fdfbf4" />
            <g className="pupil">
              <circle cx="132" cy="104" r="5.4" fill="#1c1512" />
              <circle cx="134" cy="102" r="1.8" fill="#fff" opacity=".9" />
            </g>
            <rect className="lid" x="119.5" y="95" width="25" height="18" fill="#ecc79a" />
          </g>
          {/* Nose */}
          <path
            d="M110 106 Q103 122 110 127"
            fill="none"
            stroke="#c99a6d"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Mustache */}
          <path
            className="mustache"
            d="M87 131 Q110 122 133 131 Q124 141 110 133 Q96 141 87 131 Z"
            fill="#3a2b20"
          />
          {/* Mouths */}
          <g className="mouths">
            <path
              className="m-neutral"
              d="M97 141 Q110 146 123 141"
              fill="none"
              stroke="#7c4a3a"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <ellipse className="m-talk" cx="110" cy="142" rx="8" ry="5.5" fill="#5d2f28" />
            <path
              className="m-smirk"
              d="M95 141 Q111 152 124 135"
              fill="none"
              stroke="#7c4a3a"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              className="m-frown"
              d="M97 148 Q110 138 123 148"
              fill="none"
              stroke="#7c4a3a"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              className="m-grin"
              d="M96 140 Q110 155 124 140 Q110 148 96 140 Z"
              fill="#5d2f28"
            />
          </g>
          {/* Tell effects: sweat & flush */}
          <path className="sweat" d="M148 84 q7 11 0 16 q-7 -5 0 -16" fill="#bfe3ef" />
          <ellipse className="flush" cx="78" cy="118" rx="10" ry="6" fill="#d96a5a" />
          <ellipse className="flush" cx="142" cy="118" rx="10" ry="6" fill="#d96a5a" />
        </svg>
      </div>
      <div className="speech">
        <div className="name">
          SAL “THE SNAKE” MALONE <em>· HOUSE DEALER · 30 YEARS</em>
        </div>
        <div className={`bubble ${bubblePop ? 'pop' : ''}`} id="bubble">
          {speechText}
        </div>
      </div>
      <div className="side-stats">
        <div>
          NEXT TILE <b id="nextOdds">{nextOdds}</b>
        </div>
        <hr />
        <div>
          SAL'S LEDGER{' '}
          <b>
            straight <span id="recT">{rec.t}</span> · snake{' '}
            <span id="recL">{rec.l}</span>
          </b>
        </div>
        <hr />
        <div>
          SESSION{' '}
          <b id="sessionStat">
            W{session.w} · L{session.l} · NET{' '}
            <span className={session.net >= 0 ? 'pos' : 'neg'}>
              {session.net < 0 ? '−' : '+'}${fmt2(Math.abs(session.net))}
            </span>
          </b>
          <span id="dots">
            {historyDots.map((win, idx) => (
              <span key={idx} className={`dot ${win ? 'w' : 'l'}`} />
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}
