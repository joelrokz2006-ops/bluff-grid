import React from 'react';
import { DIFFS, fmt2 } from '../utils/constants';

export default function BettingRail({
  bet,
  onBetChange,
  onQuickBet,
  diff,
  onDiffChange,
  mult,
  multBump,
  multUp,
  multDown,
  gameState,
  balance,
  picks,
  hasHint,
  nextMult,
  onStart,
  onCashOut,
  onCallBluff,
  onTakeLoan,
}) {
  const isIdle = gameState === 'idle';
  const isPlaying = gameState === 'playing';
  const isLocked = !isIdle;

  const payout = bet * mult;
  const canCashOut = isPlaying && picks >= 1;
  const showLoan = isIdle && balance < 10;
  const canStart = isIdle && balance >= bet && bet >= 10;

  let multClasses = ['mult'];
  if (multBump) multClasses.push('bump');
  if (multUp) multClasses.push('up');
  if (multDown) multClasses.push('down');

  return (
    <section className={`rail ${isLocked ? 'locked' : ''}`} id="rail">
      {/* Bet Stake */}
      <div className="group bet">
        <div className="lbl">YOUR STAKE</div>
        <div className="stepper">
          <button
            id="betMinus"
            type="button"
            aria-label="Decrease bet"
            onClick={() => onBetChange(bet - 10)}
            disabled={isLocked}
          >
            &minus;
          </button>
          <div className="val" id="betVal">
            ${fmt2(bet)}
          </div>
          <button
            id="betPlus"
            type="button"
            aria-label="Increase bet"
            onClick={() => onBetChange(bet + 10)}
            disabled={isLocked}
          >
            +
          </button>
        </div>
        <div className="quick">
          <button
            type="button"
            data-op="half"
            onClick={() => onQuickBet('half')}
            disabled={isLocked}
          >
            ½
          </button>
          <button
            type="button"
            data-op="dbl"
            onClick={() => onQuickBet('dbl')}
            disabled={isLocked}
          >
            ×2
          </button>
          <button
            type="button"
            data-op="max"
            onClick={() => onQuickBet('max')}
            disabled={isLocked}
          >
            MAX
          </button>
        </div>
      </div>

      {/* Difficulty / Mines */}
      <div className="group mines">
        <div className="lbl">MINES ON THE GRID</div>
        <div className="seg" id="seg">
          {DIFFS.map((d, i) => (
            <button
              key={i}
              type="button"
              className={diff === i ? 'on' : ''}
              disabled={isLocked}
              onClick={() => onDiffChange(i)}
            >
              <b>{d.bombs}</b>
              <i>{d.label}</i>
            </button>
          ))}
        </div>
        <div className="note" id="segNote">
          sal lies {Math.round(DIFFS[diff].lie * 100)}% of the time he vouches
        </div>
      </div>

      {/* Multiplier & Payouts */}
      <div className="multblock">
        <div className="lbl">MULTIPLIER</div>
        <div className={multClasses.join(' ')} id="mult">
          {mult.toFixed(2)}
        </div>
        <div className="pays" id="pays">
          cashes <b>${fmt2(payout)}</b>
          {isPlaying && nextMult != null && ` · next ×${nextMult.toFixed(2)}`}
        </div>
      </div>

      {/* Action Buttons */}
      {showLoan && (
        <button
          className="btn btn-loan"
          id="loanBtn"
          type="button"
          onClick={onTakeLoan}
        >
          TAKE A $500 MARKER
        </button>
      )}

      {hasHint && isPlaying && (
        <button
          className="btn btn-call show"
          id="callBtn"
          type="button"
          onClick={onCallBluff}
        >
          CALL HIS BLUFF
        </button>
      )}

      <button
        className="btn btn-cash"
        id="cashBtn"
        type="button"
        disabled={!canCashOut}
        onClick={onCashOut}
      >
        CASH OUT
        <span className="amt" id="cashAmt">
          ${fmt2(payout)}
        </span>
      </button>

      <button
        className={`btn btn-primary ${isIdle && balance >= 10 ? 'pulse' : ''}`}
        id="startBtn"
        type="button"
        disabled={!canStart}
        onClick={onStart}
      >
        DEAL THE GRID
      </button>
    </section>
  );
}
