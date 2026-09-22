import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { soundEngine } from '../utils/audio';
import { pick } from '../utils/constants';

const FXOverlay = forwardRef(function FXOverlay(props, ref) {
  const flashRef = useRef(null);
  const fxRef = useRef(null);
  const chipsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    flashAt(x, y) {
      const f = flashRef.current;
      if (!f) return;
      f.style.setProperty('--fx', `${x}px`);
      f.style.setProperty('--fy', `${y}px`);
      f.classList.remove('go');
      void f.offsetWidth;
      f.classList.add('go');
    },

    particles(cx, cy, type, count) {
      const layer = fxRef.current;
      if (!layer) return;
      const golds = ['#e8c76a', '#f5e2a4', '#c9a355'];

      for (let n = 0; n < count; n++) {
        const el = document.createElement('div');
        el.className = 'pt';
        let sz;
        if (type === 'gold') {
          el.style.background = pick(golds);
          sz = 3 + Math.random() * 4;
        } else {
          el.style.background = n % 3 ? '#2a2a2e' : '#ff9a3d';
          sz = 4 + Math.random() * 8;
        }
        el.style.width = el.style.height = `${sz}px`;
        layer.appendChild(el);

        const ang = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 70;
        const dx = Math.cos(ang) * dist;
        const dy = Math.sin(ang) * dist;
        const dur = 420 + Math.random() * 280;
        const t0 = performance.now();

        (function step(t) {
          const p = Math.min(1, (t - t0) / dur);
          el.style.transform = `translate(${cx + dx * p}px, ${
            cy + dy * p - (type === 'boom' ? p * p * 50 : 0)
          }px) scale(${1 - p * 0.6})`;
          el.style.opacity = String(1 - p);
          if (p < 1) {
            requestAnimationFrame(step);
          } else {
            el.remove();
          }
        })(t0);
      }

      if (type === 'boom') {
        const ring = document.createElement('div');
        ring.className = 'ring';
        ring.style.left = `${cx}px`;
        ring.style.top = `${cy}px`;
        layer.appendChild(ring);
        setTimeout(() => ring.remove(), 520);
      }
    },

    chipsFly(x0, y0, x1, y1, count) {
      const layer = chipsRef.current;
      if (!layer) return Promise.resolve();

      const proms = [];
      for (let n = 0; n < count; n++) {
        proms.push(
          new Promise((res) => {
            const el = document.createElement('div');
            el.className = 'chip';
            el.style.opacity = '0';
            layer.appendChild(el);

            const cx = x0 + (Math.random() * 160 - 80);
            const cy = y0 - 120 - Math.random() * 80;
            const delay = n * 90 + Math.random() * 60;
            const dur = 650 + Math.random() * 180;
            const t0 = performance.now() + delay;

            (function step(t) {
              const p = (t - t0) / dur;
              if (p < 0) {
                requestAnimationFrame(step);
                return;
              }
              if (p >= 1) {
                el.remove();
                soundEngine.clink();
                res();
                return;
              }
              const q = 1 - p;
              const x = q * q * x0 + 2 * q * p * cx + p * p * x1;
              const y = q * q * y0 + 2 * q * p * cy + p * p * y1;
              const s = 0.6 + Math.sin(p * Math.PI) * 0.5;
              el.style.transform = `translate(${x - 13}px, ${y - 13}px) scale(${s}) rotate(${
                p * 360
              }deg)`;
              el.style.opacity = p > 0.85 ? String((1 - p) / 0.15) : '1';
              requestAnimationFrame(step);
            })(performance.now());
          })
        );
      }
      return Promise.all(proms);
    },
  }));

  return (
    <>
      <div id="flash" ref={flashRef} />
      <div id="fx" ref={fxRef} />
      <div id="chips" ref={chipsRef} />
    </>
  );
});

export default FXOverlay;
