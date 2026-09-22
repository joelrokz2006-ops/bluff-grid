import React from 'react';
import { cellName } from '../utils/constants';

const BOMB_SVG = (
  <svg viewBox="0 0 64 64" className="bombart" aria-hidden="true">
    <path
      className="fuse"
      d="M44 19 Q54 8 56 12"
      stroke="#c9a355"
      strokeWidth="3.2"
      fill="none"
      strokeLinecap="round"
    />
    <rect
      x="38"
      y="17"
      width="9"
      height="8"
      rx="2.5"
      fill="#7a5a2a"
      transform="rotate(20 42 21)"
    />
    <circle cx="28" cy="38" r="17" fill="#1a1b20" />
    <ellipse
      cx="22"
      cy="33"
      rx="6.5"
      ry="4.5"
      fill="#3a3d46"
      transform="rotate(-32 22 33)"
    />
    <g className="spark">
      <circle cx="56" cy="12" r="3.2" fill="#ffcf6e" />
      <path
        d="M56 5v4M56 15v4M49 12h4M59 12h4M51 7l2.8 2.8M58.2 14.2l2.8 2.8M51 17l2.8-2.8M58.2 9.8l2.8-2.8"
        stroke="#ffb84d"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

export default function CardCell({
  index,
  cell,
  onClick,
  tabIndex,
  dealStyle,
}) {
  const { revealed, kind, suit, rank, marked, dim, winpulse } = cell;
  const isRed = suit === '\u2665\uFE0E' || suit === '\u2666\uFE0E';
  const redClass = isRed ? ' red' : '';
  const cName = cellName(index);

  let cellClasses = ['cell'];
  if (revealed) cellClasses.push('flipped');
  if (dim) cellClasses.push('dim');
  if (marked) cellClasses.push('marked');
  if (winpulse) cellClasses.push('winpulse');

  return (
    <button
      type="button"
      className={cellClasses.join(' ')}
      tabIndex={tabIndex}
      aria-label={`Tile ${cName}`}
      onClick={() => onClick(index)}
    >
      <div className="card" style={dealStyle}>
        <div className="face back">
          <div className="pat" />
        </div>
        <div className="face front">
          {kind === 'safe' && (
            <>
              <div className={`corner tl${redClass}`}>
                <span>{rank}</span>
                <span>{suit}</span>
              </div>
              <div className={`glyph${redClass}`}>{suit}</div>
              <div className={`corner br${redClass}`}>
                <span>{rank}</span>
                <span>{suit}</span>
              </div>
            </>
          )}

          {kind === 'bomb' && BOMB_SVG}

          {kind === 'defused' && (
            <>
              <div className="defu">{BOMB_SVG}</div>
              <div className="stamp">DEFUSED</div>
            </>
          )}

          {kind === 'burned' && (
            <>
              <div className="burned">
                <div className={`corner tl${redClass}`}>
                  <span>{rank}</span>
                  <span>{suit}</span>
                </div>
                <div className={`glyph${redClass}`}>{suit}</div>
                <div className={`corner br${redClass}`}>
                  <span>{rank}</span>
                  <span>{suit}</span>
                </div>
              </div>
              <div className="stamp grey">BURNED</div>
            </>
          )}
        </div>
      </div>
      {marked && (
        <div className="pick-tag">
          SAL VOUCHES · {cName}
        </div>
      )}
    </button>
  );
}
