import React, { useEffect } from 'react';

export default function RulesModal({ isOpen, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal"
      id="modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="paper" role="dialog" aria-modal="true" aria-labelledby="mTitle">
        <h2 id="mTitle">THE HOUSE RULES</h2>
        <div className="msub">BLUFF GRID · BACK ROOM · EST. 1931</div>
        <ol>
          <li>
            <span>
              Stake your credits and flip tiles on a 5×5 grid. Every safe tile lifts
              your multiplier — true combinatorial odds with a slim 3% house cut. Hit
              a mine and the stake is gone.
            </span>
          </li>
          <li>
            <span>
              Cash out any time after your first safe tile. Reveal every safe tile and
              the grid pays out automatically.
            </span>
          </li>
          <li>
            <span>
              Sal <b>vouches</b> for tiles while you play. He is not bound by honesty
              — the riskier the grid, the more he lies (30% · 45% · 60%). Flip a vouched
              tile to trust him, or press <b className="key">CALL HIS BLUFF</b> if you
              smell a lie.
            </span>
          </li>
          <li>
            <span>
              <b>The tell:</b> when he's lying, his eyes dart and a sweat drop falls.{' '}
              <i>Usually.</i> Keep your eyes on him while he speaks — his ledger tracks
              how often he's been straight with you.
            </span>
          </li>
          <li>
            <span>
              Catch him lying and the mine is <b>defused</b> — ×1.6 to your
              multiplier. Call it wrong and your multiplier is <b>halved</b> and the
              tile burns.
            </span>
          </li>
        </ol>
        <footer>
          <span className="fine">The felt is fair. Sal isn't.</span>
          <button
            className="btn btn-primary"
            id="closeModal"
            type="button"
            onClick={onClose}
          >
            DEAL ME IN
          </button>
        </footer>
      </div>
    </div>
  );
}
