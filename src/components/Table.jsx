import React, { forwardRef } from 'react';
import CardCell from './CardCell';

const Table = forwardRef(function Table(
  {
    cells,
    gameState,
    isShaking,
    banner,
    onCellClick,
    dealStyles,
  },
  ref
) {
  const isPlaying = gameState === 'playing';
  const isIdle = gameState === 'idle';

  return (
    <section className={`table ${isShaking ? 'shaking' : ''}`} ref={ref} id="table">
      <div className="board">
        <div className="corner-empty" />
        <div className="colLabels">
          <span>A</span>
          <span>B</span>
          <span>C</span>
          <span>D</span>
          <span>E</span>
        </div>
        <div className="rowLabels">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
        <div className={`grid ${isPlaying ? 'live' : ''} ${isIdle ? 'idle' : ''}`} id="grid">
          {cells.map((cell, idx) => (
            <CardCell
              key={idx}
              index={idx}
              cell={cell}
              tabIndex={isPlaying ? 0 : -1}
              onClick={onCellClick}
              dealStyle={dealStyles ? dealStyles[idx] : undefined}
            />
          ))}
        </div>
      </div>

      {banner && banner.visible && (
        <div className={`banner ${banner.showClass ? 'show' : ''}`} id="banner">
          <div className="sub">{banner.sub}</div>
          <div className="big">{banner.big}</div>
          <div className="meta">{banner.meta}</div>
        </div>
      )}

      <div className={`tableHint ${isIdle ? 'on' : ''}`} id="tableHint">
        PLACE A STAKE · DEAL THE GRID
      </div>
    </section>
  );
});

export default Table;
