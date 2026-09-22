import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Dealer from './components/Dealer';
import Table from './components/Table';
import BettingRail from './components/BettingRail';
import RulesModal from './components/RulesModal';
import FXOverlay from './components/FXOverlay';
import Toasts from './components/Toasts';
import {
  N,
  DIFFS,
  HINT_CHANCE,
  SUITS,
  RANKS,
  DIALOGUES,
  cellName,
  pick,
  fill,
  multAfter,
} from './utils/constants';
import { load, save } from './utils/storage';
import { soundEngine } from './utils/audio';

const createEmptyCells = () =>
  Array.from({ length: N }, () => ({
    revealed: false,
    kind: null,
    suit: pick(SUITS),
    rank: pick(RANKS),
    marked: false,
    dim: false,
    winpulse: false,
  }));

export default function App() {
  // Persistence states
  const [balance, setBalance] = useState(() => load('bg_balance', 1000));
  const [bet, setBet] = useState(() => load('bg_bet', 50));
  const [diff, setDiff] = useState(() => {
    const d = load('bg_diff', 1);
    return Math.min(2, Math.max(0, d));
  });
  const [loans, setLoans] = useState(() => load('bg_loans', 0));
  const [sound, setSound] = useState(() => load('bg_sound', true));
  const [rec, setRec] = useState(() => load('bg_rec', { t: 0, l: 0 }) || { t: 0, l: 0 });
  const [session, setSession] = useState({ w: 0, l: 0, net: 0 });
  const [historyDots, setHistoryDots] = useState([]);

  // Game flow states
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'dealing' | 'playing' | 'bust' | 'cashed'
  const [cells, setCells] = useState(createEmptyCells);
  const [mult, setMult] = useState(1);
  const [picks, setPicks] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [burnedCount, setBurnedCount] = useState(0);
  const [defusedCount, setDefusedCount] = useState(0);
  const [hint, setHint] = useState(null); // { idx, lie }

  // UI animation / visual feedback states
  const [bumpBalance, setBumpBalance] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [banner, setBanner] = useState({ visible: false, showClass: false, sub: '', big: '', meta: '' });
  const [toasts, setToasts] = useState([]);
  const [dealStyles, setDealStyles] = useState(null);
  const [multAnim, setMultAnim] = useState({ bump: false, up: false, down: false });

  // Dealer interaction states
  const [speechText, setSpeechText] = useState('Sit down. Mind the tells — mine especially.');
  const [isTalking, setIsTalking] = useState(false);
  const [isTelling, setIsTelling] = useState(false);
  const [dealerMood, setDealerMood] = useState('neutral');
  const [bubblePop, setBubblePop] = useState(false);

  // Modal state
  const [isHelpOpen, setIsHelpOpen] = useState(() => {
    const seen = load('bg_seen', false);
    if (!seen) {
      save('bg_seen', true);
      return true;
    }
    return false;
  });

  // Refs for background logic & animations
  const fxRef = useRef(null);
  const tableRef = useRef(null);
  const bombSetRef = useRef(new Set());
  const tellTimersRef = useRef([]);
  const typewriterRef = useRef(null);
  const bannerTimerRef = useRef(null);
  const busyRef = useRef(false);

  // Initialize sound settings
  useEffect(() => {
    soundEngine.setEnabled(sound);
  }, [sound]);

  // Handle first user gesture to unlock Web Audio context
  useEffect(() => {
    const handleGesture = () => {
      soundEngine.init();
      window.removeEventListener('pointerdown', handleGesture);
    };
    window.addEventListener('pointerdown', handleGesture);
    return () => window.removeEventListener('pointerdown', handleGesture);
  }, []);

  // Toast notification helper
  const addToast = useCallback((text, type = 'normal') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      const next = [...prev, { id, text, type, out: false }];
      return next.slice(-4);
    });

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, out: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 350);
    }, 2400);
  }, []);

  // Dealer speaking animation helper
  const dealerSay = useCallback((text, mood = 'neutral') => {
    setDealerMood(mood);
    setBubblePop(true);
    setTimeout(() => setBubblePop(false), 250);
    soundEngine.blip();

    clearInterval(typewriterRef.current);
    setIsTalking(true);
    let i = 0;
    setSpeechText('');

    typewriterRef.current = setInterval(() => {
      i++;
      setSpeechText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(typewriterRef.current);
        setIsTalking(false);
      }
    }, 17);
  }, []);

  // Trigger dealer's tell (sweat + darting eyes)
  const triggerTell = useCallback(() => {
    setIsTelling(true);
    setTimeout(() => setIsTelling(false), 980);
  }, []);

  // Animate multiplier change
  const triggerMultAnim = useCallback((newMult, isUp = false, isDown = false) => {
    setMult(newMult);
    setMultAnim({ bump: true, up: isUp, down: isDown });
    setTimeout(() => {
      setMultAnim({ bump: false, up: false, down: false });
    }, 600);
  }, []);

  // Clear active hint & tells
  const clearHint = useCallback(() => {
    setHint(null);
    setCells((prev) =>
      prev.map((c) => (c.marked ? { ...c, marked: false } : c))
    );
    tellTimersRef.current.forEach(clearTimeout);
    tellTimersRef.current = [];
  }, []);

  // Issue a vouch from Sal
  const issueHint = useCallback(
    (currentCells, currentBombSet) => {
      const unrev = currentCells
        .map((c, i) => (c.revealed ? -1 : i))
        .filter((i) => i >= 0);
      if (unrev.length < 3) return;

      const bombsLeft = unrev.filter((i) => currentBombSet.has(i)).length;
      const safesLeft = unrev.length - bombsLeft;
      if (!bombsLeft && !safesLeft) return;

      const lie = bombsLeft > 0 ? Math.random() < DIFFS[diff].lie : false;
      const pool = lie
        ? unrev.filter((i) => currentBombSet.has(i))
        : unrev.filter((i) => !currentBombSet.has(i));
      if (!pool.length) return;

      const idx = pick(pool);
      setHint({ idx, lie });
      setCells((prev) =>
        prev.map((c, i) => (i === idx ? { ...c, marked: true } : c))
      );

      dealerSay(fill(pick(DIALOGUES.hint), cellName(idx)));

      const tellP = lie ? 0.8 : 0.15;
      if (Math.random() < tellP) {
        const timer = setTimeout(
          triggerTell,
          900 + Math.random() * 1300
        );
        tellTimersRef.current.push(timer);
      }
    },
    [diff, dealerSay, triggerTell]
  );

  // Show big victory/cashout banner
  const showBanner = useCallback((sub, big, meta) => {
    clearTimeout(bannerTimerRef.current);
    setBanner({ visible: true, showClass: true, sub, big, meta });
    bannerTimerRef.current = setTimeout(() => {
      setBanner((prev) => ({ ...prev, visible: false, showClass: false }));
    }, 2600);
  }, []);

  // Start new round
  const handleStartRound = async () => {
    if (gameState !== 'idle' || busyRef.current) return;
    if (bet < 10) {
      addToast('Minimum stake is $10');
      return;
    }
    if (balance < bet) {
      addToast(`Insufficient bankroll — you hold $${balance.toFixed(2)}`, 'bad');
      return;
    }

    busyRef.current = true;
    const newBal = balance - bet;
    setBalance(newBal);
    save('bg_balance', newBal);
    save('bg_bet', bet);

    soundEngine.shuffle();

    // Generate bombs
    const B = DIFFS[diff].bombs;
    const idxs = [...Array(N).keys()];
    const bombSet = new Set();
    for (let i = 0; i < B; i++) {
      bombSet.add(idxs.splice((Math.random() * idxs.length) | 0, 1)[0]);
    }
    bombSetRef.current = bombSet;

    // Reset grid
    const freshCells = Array.from({ length: N }, () => ({
      revealed: false,
      kind: null,
      suit: pick(SUITS),
      rank: pick(RANKS),
      marked: false,
      dim: false,
      winpulse: false,
    }));
    setCells(freshCells);
    clearHint();
    setPicks(0);
    setRevealedCount(0);
    setBurnedCount(0);
    setDefusedCount(0);
    setMult(1);

    setGameState('dealing');

    // Dealing animation calculation
    const gridEl = document.getElementById('grid');
    let delays = {};
    if (gridEl) {
      const gr = gridEl.getBoundingClientRect();
      const cx = gr.left + gr.width / 2;
      const cy = gr.top - 30;

      const cellEls = gridEl.querySelectorAll('.cell');
      cellEls.forEach((el, idx) => {
        const r = el.getBoundingClientRect();
        const dx = cx - (r.left + r.width / 2);
        const dy = cy - (r.top + r.height / 2);
        delays[idx] = {
          transform: `translate(${dx}px, ${dy}px) rotate(${((Math.random() * 50 - 25) | 0)}deg) scale(0.4)`,
          opacity: 0,
          transition: 'none',
        };
      });
      setDealStyles(delays);

      // Trigger deal in
      setTimeout(() => {
        const activeStyles = {};
        for (let i = 0; i < N; i++) {
          activeStyles[i] = {
            transitionDelay: `${i * 36}ms`,
          };
        }
        setDealStyles(activeStyles);
      }, 50);
    }

    let n = 0;
    const tickInt = setInterval(() => {
      soundEngine.tick();
      if (++n > 8) clearInterval(tickInt);
    }, 110);

    setTimeout(() => {
      clearInterval(tickInt);
      setDealStyles(null);
      setGameState('playing');
      busyRef.current = false;
      dealerSay(pick(DIALOGUES.open));
    }, 36 * N + 700);
  };

  // Reset board back to idle
  const resetBoard = useCallback(async () => {
    for (let i = 0; i < N; i++) {
      setTimeout(() => {
        setCells((prev) =>
          prev.map((c, idx) =>
            idx === i ? { ...c, revealed: false, dim: false, winpulse: false } : c
          )
        );
      }, i * 14);
    }

    setTimeout(() => {
      setCells(createEmptyCells());
      setPicks(0);
      setRevealedCount(0);
      setBurnedCount(0);
      setDefusedCount(0);
      setMult(1);
      setGameState('idle');
      busyRef.current = false;
    }, N * 14 + 520);
  }, []);

  // Cash Out
  const handleCashOut = useCallback(
    async (auto = false) => {
      if (gameState !== 'playing' || picks < 1 || busyRef.current) return;
      busyRef.current = true;
      setGameState('cashed');
      clearHint();

      const payout = bet * mult;
      soundEngine.cash();

      // Win pulse animation on safe cells
      setCells((prev) =>
        prev.map((c) =>
          c.kind === 'safe' ? { ...c, winpulse: true } : c
        )
      );

      dealerSay(pick(auto ? DIALOGUES.cleared : DIALOGUES.cashed), 'happy');
      showBanner(
        auto ? 'GRID CLEARED' : 'CASHED OUT',
        `+$${payout.toFixed(2)}`,
        `×${mult.toFixed(2)} on a $${bet.toFixed(2)} stake`
      );

      // Flying chips
      const gridEl = document.getElementById('grid');
      const bankrollEl = document.getElementById('bankroll');
      if (gridEl && bankrollEl && fxRef.current) {
        const gr = gridEl.getBoundingClientRect();
        const tr = bankrollEl.getBoundingClientRect();
        await fxRef.current.chipsFly(
          gr.left + gr.width / 2,
          gr.top + gr.height / 2,
          tr.left + tr.width / 2,
          tr.top + tr.height / 2,
          Math.min(12, 4 + Math.round(mult))
        );
      }

      const newBal = balance + payout;
      setBalance(newBal);
      save('bg_balance', newBal);
      setBumpBalance(true);
      setTimeout(() => setBumpBalance(false), 500);

      setSession((prev) => ({
        w: prev.w + 1,
        l: prev.l,
        net: prev.net + (payout - bet),
      }));
      setHistoryDots((prev) => [...prev.slice(-14), true]);

      // Reveal remaining tiles
      let d = 150;
      cells.forEach((cc, j) => {
        if (!cc.revealed) {
          setTimeout(() => {
            setCells((prev) =>
              prev.map((c, idx) =>
                idx === j
                  ? {
                      ...c,
                      revealed: true,
                      kind: bombSetRef.current.has(j) ? 'bomb' : 'safe',
                      dim: true,
                    }
                  : c
              )
            );
          }, d);
          d += 60;
        }
      });

      setTimeout(() => {
        resetBoard();
      }, d + 1000);
    },
    [gameState, picks, bet, mult, balance, showBanner, dealerSay, clearHint, cells, resetBoard]
  );

  // Bust sequence when clicking a bomb
  const handleBust = useCallback(
    async (cellIndex, lineOverride) => {
      setGameState('bust');
      busyRef.current = true;

      setTimeout(async () => {
        const gridEl = document.getElementById('grid');
        if (gridEl && fxRef.current) {
          const cellEl = gridEl.querySelectorAll('.cell')[cellIndex];
          if (cellEl) {
            const r = cellEl.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            fxRef.current.flashAt(cx, cy);
            fxRef.current.particles(cx, cy, 'boom', 20);
          }
        }

        soundEngine.boom();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);

        setSession((prev) => ({
          w: prev.w,
          l: prev.l + 1,
          net: prev.net - bet,
        }));
        setHistoryDots((prev) => [...prev.slice(-14), false]);

        let d = 280;
        cells.forEach((cc, j) => {
          if (j !== cellIndex && !cc.revealed) {
            const kind = bombSetRef.current.has(j) ? 'bomb' : 'safe';
            setTimeout(() => {
              setCells((prev) =>
                prev.map((c, idx) =>
                  idx === j ? { ...c, revealed: true, kind, dim: true } : c
                )
              );
              if (kind === 'bomb') soundEngine.pop();
            }, d);
            d += 85;
          }
        });

        dealerSay(lineOverride || pick(DIALOGUES.busted), 'smug');
        addToast(`Busted — the house keeps $${bet.toFixed(2)}`, 'bad');

        setTimeout(() => {
          resetBoard();
        }, d + 1400);
      }, 420);
    },
    [bet, cells, dealerSay, addToast, resetBoard]
  );

  // Safe reveal logic
  const handleSafeReveal = useCallback(
    (cellIndex, wasMarked, nextPicks) => {
      const B = DIFFS[diff].bombs;
      const newMult = multAfter(nextPicks, B);
      triggerMultAnim(newMult, true, false);
      soundEngine.safe(nextPicks);

      const gridEl = document.getElementById('grid');
      if (gridEl && fxRef.current) {
        const cellEl = gridEl.querySelectorAll('.cell')[cellIndex];
        if (cellEl) {
          const r = cellEl.getBoundingClientRect();
          fxRef.current.particles(r.left + r.width / 2, r.top + r.height / 2, 'gold', 7);
        }
      }

      if (wasMarked) {
        setRec((prev) => {
          const n = { ...prev, t: prev.t + 1 };
          save('bg_rec', n);
          return n;
        });
        if (Math.random() < 0.65) {
          dealerSay(pick(DIALOGUES.trustedTruth), 'happy');
        }
      }

      if (nextPicks + burnedCount >= N - B) {
        handleCashOut(true);
        return;
      }

      if (!hint && (nextPicks === 1 || Math.random() < HINT_CHANCE)) {
        // Need current updated cells
        const updatedCells = cells.map((c, idx) =>
          idx === cellIndex ? { ...c, revealed: true, kind: 'safe' } : c
        );
        issueHint(updatedCells, bombSetRef.current);
      } else if (!wasMarked && Math.random() < 0.25) {
        dealerSay(pick(DIALOGUES.safe));
      }
    },
    [diff, burnedCount, hint, cells, triggerMultAnim, dealerSay, handleCashOut, issueHint]
  );

  // Cell Click handler
  const handleCellClick = useCallback(
    (cellIndex) => {
      if (gameState !== 'playing' || busyRef.current) return;
      const currentCell = cells[cellIndex];
      if (currentCell.revealed) return;

      soundEngine.flip();
      const wasMarked = !!(hint && hint.idx === cellIndex);
      if (hint) clearHint();

      setRevealedCount((prev) => prev + 1);

      if (bombSetRef.current.has(cellIndex)) {
        if (wasMarked) {
          setRec((prev) => {
            const n = { ...prev, l: prev.l + 1 };
            save('bg_rec', n);
            return n;
          });
        }
        setCells((prev) =>
          prev.map((c, idx) =>
            idx === cellIndex ? { ...c, revealed: true, kind: 'bomb' } : c
          )
        );
        handleBust(cellIndex, wasMarked ? pick(DIALOGUES.trustedLie) : undefined);
      } else {
        const nextPicks = picks + 1;
        setPicks(nextPicks);
        setCells((prev) =>
          prev.map((c, idx) =>
            idx === cellIndex ? { ...c, revealed: true, kind: 'safe' } : c
          )
        );
        handleSafeReveal(cellIndex, wasMarked, nextPicks);
      }
    },
    [gameState, cells, hint, picks, clearHint, handleBust, handleSafeReveal]
  );

  // Call Sal's Bluff
  const handleCallBluff = useCallback(async () => {
    if (gameState !== 'playing' || busyRef.current || !hint) return;
    const { idx, lie } = hint;
    clearHint();
    soundEngine.flip();

    setRevealedCount((prev) => prev + 1);

    if (lie) {
      setDefusedCount((prev) => prev + 1);
      setCells((prev) =>
        prev.map((c, i) => (i === idx ? { ...c, revealed: true, kind: 'defused' } : c))
      );
      soundEngine.sting();

      const gridEl = document.getElementById('grid');
      if (gridEl && fxRef.current) {
        const cellEl = gridEl.querySelectorAll('.cell')[idx];
        if (cellEl) {
          const r = cellEl.getBoundingClientRect();
          fxRef.current.particles(r.left + r.width / 2, r.top + r.height / 2, 'gold', 16);
        }
      }

      setRec((prev) => {
        const n = { ...prev, l: prev.l + 1 };
        save('bg_rec', n);
        return n;
      });

      const bonus = mult * 1.6;
      triggerMultAnim(bonus, true, false);
      dealerSay(pick(DIALOGUES.caught), 'angry');
      addToast('Mine defused — multiplier boosted ×1.6');
    } else {
      const nextBurned = burnedCount + 1;
      setBurnedCount(nextBurned);
      setCells((prev) =>
        prev.map((c, i) => (i === idx ? { ...c, revealed: true, kind: 'burned' } : c))
      );

      setRec((prev) => {
        const n = { ...prev, t: prev.t + 1 };
        save('bg_rec', n);
        return n;
      });

      const cut = Math.max(1, mult * 0.5);
      triggerMultAnim(cut, false, true);
      dealerSay(pick(DIALOGUES.wrongCall), 'smug');
      addToast('False call — multiplier halved', 'bad');

      const B = DIFFS[diff].bombs;
      if (picks + nextBurned >= N - B) {
        setTimeout(() => handleCashOut(true), 600);
      }
    }
  }, [
    gameState,
    hint,
    mult,
    burnedCount,
    picks,
    diff,
    clearHint,
    triggerMultAnim,
    dealerSay,
    addToast,
    handleCashOut,
  ]);

  // Take Marker Loan ($500)
  const handleTakeLoan = useCallback(() => {
    const newBal = balance + 500;
    const newLoans = loans + 1;
    setBalance(newBal);
    setLoans(newLoans);
    save('bg_balance', newBal);
    save('bg_loans', newLoans);
    setBumpBalance(true);
    setTimeout(() => setBumpBalance(false), 500);

    dealerSay(pick(DIALOGUES.loan), 'smug');
    addToast(`$500 marker taken — markers so far: ${newLoans}`);
  }, [balance, loans, dealerSay, addToast]);

  // Betting adjustments
  const handleBetChange = (newBet) => {
    const bounded = Math.max(
      10,
      Math.min(Math.round(newBet), Math.max(10, Math.floor(balance)), 100000)
    );
    setBet(bounded);
    save('bg_bet', bounded);
  };

  const handleQuickBet = (op) => {
    if (op === 'half') handleBetChange(bet / 2);
    else if (op === 'dbl') handleBetChange(bet * 2);
    else if (op === 'max') handleBetChange(balance);
  };

  const handleDiffChange = (newDiff) => {
    if (gameState !== 'idle') return;
    setDiff(newDiff);
    save('bg_diff', newDiff);
  };

  const handleToggleSound = () => {
    const nextSound = !sound;
    setSound(nextSound);
    save('bg_sound', nextSound);
    if (nextSound) {
      soundEngine.init();
      soundEngine.clink();
    }
  };

  // Odds calculation for side stats
  const B = DIFFS[diff].bombs;
  const safeLeft = N - B - picks - burnedCount;
  const totalLeft = N - revealedCount;
  const nextOdds =
    gameState === 'playing' && totalLeft > 0
      ? `${safeLeft}/${totalLeft} · ${Math.round((safeLeft / totalLeft) * 100)}%`
      : '—';

  const nextMult =
    gameState === 'playing' && picks + 1 <= N - B
      ? multAfter(picks + 1, B)
      : null;

  return (
    <div className="wrap">
      <Header
        balance={balance}
        sound={sound}
        onToggleSound={handleToggleSound}
        onOpenHelp={() => setIsHelpOpen(true)}
        bumpBalance={bumpBalance}
      />

      <Dealer
        mood={dealerMood}
        isTalking={isTalking}
        isTelling={isTelling}
        speechText={speechText}
        bubblePop={bubblePop}
        nextOdds={nextOdds}
        rec={rec}
        session={session}
        historyDots={historyDots}
      />

      <Table
        ref={tableRef}
        cells={cells}
        gameState={gameState}
        isShaking={isShaking}
        banner={banner}
        onCellClick={handleCellClick}
        dealStyles={dealStyles}
      />

      <BettingRail
        bet={bet}
        onBetChange={handleBetChange}
        onQuickBet={handleQuickBet}
        diff={diff}
        onDiffChange={handleDiffChange}
        mult={mult}
        multBump={multAnim.bump}
        multUp={multAnim.up}
        multDown={multAnim.down}
        gameState={gameState}
        balance={balance}
        picks={picks}
        hasHint={!!hint}
        nextMult={nextMult}
        onStart={handleStartRound}
        onCashOut={() => handleCashOut(false)}
        onCallBluff={handleCallBluff}
        onTakeLoan={handleTakeLoan}
      />

      <div className="foot">
        VIRTUAL CREDITS · NO REAL WAGERING · TRUE COMBINATORIAL ODDS · 3% HOUSE CUT
      </div>

      <Toasts toasts={toasts} />
      <FXOverlay ref={fxRef} />
      <RulesModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
