import { useEffect, useState } from 'react';
import {
  tokenPosition, COLORS, PLAYER_NAMES, CELL,
  buildBoardCells, getSafeTrackCoords, getStartCoords, BASES,
} from '../games/ludoPath.js';

function PremiumToken({ x, y, color, clickable, onClick, pulse, inYard }) {
  const c = COLORS[color];
  const hitR = inYard ? 8 : 11;
  const [hovered, setHovered] = useState(false);
  const showRing = pulse || hovered;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={clickable ? (e) => { e.stopPropagation(); onClick?.(); } : undefined}
      onMouseEnter={clickable ? () => setHovered(true) : undefined}
      onMouseLeave={clickable ? () => setHovered(false) : undefined}
      style={{ cursor: clickable ? 'pointer' : 'default', pointerEvents: clickable ? 'auto' : 'none' }}
    >
      <circle r={hitR} fill="transparent" />
      <ellipse cx={0} cy={3.8} rx={7} ry={2.2} fill="rgba(0,0,0,0.28)" />
      {showRing && (
        <circle
          r={hovered ? 10.5 : 9.5}
          fill="none"
          stroke="#FBBF24"
          strokeWidth={hovered ? 2.4 : 1.8}
          opacity={hovered ? 1 : 0.85}
          style={{ pointerEvents: 'none' }}
        />
      )}
      <circle r={7.5} fill={c.dark} />
      <circle r={6.2} fill={c.fill} stroke="#fff" strokeWidth={hovered && clickable ? 2 : 1.4} />
      <circle cx={-1.2} cy={-1.8} r={2.2} fill="#fff" opacity="0.35" />
      <text y={2.2} textAnchor="middle" fontSize="6.5" fill="#fff" fontWeight="700" style={{ pointerEvents: 'none' }}>♔</text>
    </g>
  );
}

function StarIcon({ x, y }) {
  return (
    <text x={x} y={y + 1.5} textAnchor="middle" fontSize="5.5" fill="#64748B" style={{ pointerEvents: 'none' }}>★</text>
  );
}

function GlobeIcon({ x, y, color }) {
  const c = COLORS[color];
  return (
    <g style={{ pointerEvents: 'none' }}>
      <circle cx={x} cy={y} r={3.2} fill="#fff" opacity="0.35" />
      <circle cx={x} cy={y} r={2.4} fill="none" stroke="#fff" strokeWidth="0.7" />
      <path d={`M${x - 2.4},${y} H${x + 2.4} M${x},${y - 2.4} V${y + 2.4}`} stroke="#fff" strokeWidth="0.5" />
      <circle cx={x} cy={y} r={0.8} fill={c.dark} />
    </g>
  );
}

function DiceFace({ value, rolling }) {
  const [face, setFace] = useState(value || 1);
  useEffect(() => {
    if (!rolling) { setFace(value || 1); return; }
    const id = setInterval(() => setFace(Math.floor(Math.random() * 6) + 1), 70);
    return () => clearInterval(id);
  }, [rolling, value]);
  const dots = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [2, 0], [0, 2], [2, 2]],
    5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
    6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
  };
  const layout = dots[face] || dots[1];
  return (
    <div className={`ludo-dice-box${rolling ? ' rolling' : ''}`} aria-label={`Dice ${face}`}>
      <div className="ludo-dice-grid">
        {layout.map(([col, row], i) => (
          <span key={i} className="ludo-dice-dot" style={{ gridColumn: col + 1, gridRow: row + 1 }} />
        ))}
      </div>
    </div>
  );
}

function HomeBase({ x, y, color }) {
  const c = COLORS[color];
  const size = 6 * CELL;
  const inset = 8;
  const slots = [
    [inset + 12, inset + 12],
    [size - inset - 12, inset + 12],
    [inset + 12, size - inset - 12],
    [size - inset - 12, size - inset - 12],
  ];
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={x} y={y} width={size} height={size} fill={c.base} rx={4} />
      <rect
        x={x + inset}
        y={y + inset}
        width={size - inset * 2}
        height={size - inset * 2}
        fill="#FFFEF9"
        rx={3}
        stroke={c.dark}
        strokeWidth="1.2"
      />
      {slots.map(([sx, sy], i) => (
        <circle key={i} cx={x + sx} cy={y + sy} r={8} fill={c.soft} stroke={c.base} strokeWidth="1.5" />
      ))}
    </g>
  );
}

export default function LudoBoard({
  displayTokens,
  session,
  rolling,
  onTokenClick,
  selectable,
  showDice,
  diceValue,
}) {
  const tokens = displayTokens || session?.tokens || [];
  const currentTurn = session?.currentTurn ?? 0;
  const legalIds = new Set((session?.legalMoves || []).map(m => m.tokenId));
  const cells = buildBoardCells();
  const safes = getSafeTrackCoords();
  const starts = getStartCoords();

  const defaultTokens = ['green', 'red', 'yellow', 'blue'].flatMap((color, player) =>
    [0, 1, 2, 3].map(i => ({
      id: `${color}-${i}`,
      color,
      player,
      distance: -1,
      finished: false,
    })),
  );

  const shown = tokens.length ? tokens : defaultTokens;
  // Draw clickable tokens last (on top)
  const ordered = [
    ...shown.filter(t => !legalIds.has(t.id)),
    ...shown.filter(t => legalIds.has(t.id)),
  ];

  return (
    <div className="ludo-board-premium">
      <svg viewBox="0 0 150 150" className="ludo-board-svg" aria-label="Ludo board">
        <defs>
          <filter id="board-shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.35" />
          </filter>
        </defs>

        <rect x="0" y="0" width="150" height="150" fill="#FFFEF7" rx="6" stroke="#78350F" strokeWidth="2.5" filter="url(#board-shadow)" />

        <HomeBase x={BASES.green.x} y={BASES.green.y} color="green" />
        <HomeBase x={BASES.red.x} y={BASES.red.y} color="red" />
        <HomeBase x={BASES.yellow.x} y={BASES.yellow.y} color="yellow" />
        <HomeBase x={BASES.blue.x} y={BASES.blue.y} color="blue" />

        {cells.map((cell, i) => (
          <rect
            key={`c-${i}`}
            x={cell.x}
            y={cell.y}
            width={cell.w}
            height={cell.h}
            fill={cell.fill}
            stroke={cell.stroke}
            strokeWidth="0.4"
            style={{ pointerEvents: 'none' }}
          />
        ))}

        {/* Center — match home approach sides: top=red, right=blue, bottom=yellow, left=green */}
        <polygon points="60,60 90,60 75,75" fill={COLORS.red.base} />
        <polygon points="90,60 90,90 75,75" fill={COLORS.blue.base} />
        <polygon points="90,90 60,90 75,75" fill={COLORS.yellow.base} />
        <polygon points="60,90 60,60 75,75" fill={COLORS.green.base} />
        <circle cx="75" cy="75" r="3" fill="#FFFEF7" stroke="#78350F" strokeWidth="0.6" />

        {safes.filter(s => ![0, 13, 26, 39].includes(s.i)).map(s => (
          <StarIcon key={`safe-${s.i}`} x={s.x} y={s.y} />
        ))}

        {Object.entries(starts).map(([color, [x, y]]) => (
          <GlobeIcon key={`start-${color}`} x={x} y={y} color={color} />
        ))}

        {ordered.map(token => {
          const { x, y } = tokenPosition(token);
          const canClick = selectable && legalIds.has(token.id);
          return (
            <PremiumToken
              key={token.id}
              x={x}
              y={y}
              color={token.color}
              clickable={canClick}
              pulse={canClick}
              inYard={token.distance === -1}
              onClick={canClick ? () => onTokenClick?.(token.id) : undefined}
            />
          );
        })}
      </svg>

      {showDice && (
        <div className="ludo-dice-slot">
          <DiceFace value={diceValue} rolling={rolling} />
        </div>
      )}

      {[
        { cls: 'tl', pi: 0, av: 'G', col: 'green' },
        { cls: 'tr', pi: 1, av: 'R', col: 'red' },
        { cls: 'br', pi: 2, av: 'B', col: 'blue' },
        { cls: 'bl', pi: 3, av: 'Y', col: 'yellow' },
      ].map(({ cls, pi, av, col }) => (
        <div key={cls} className={`ludo-player-badge ${cls}`} aria-hidden="true">
          <span className={`ludo-avatar ${col} ${currentTurn === pi ? 'turn' : ''}`}>{av}</span>
          <span className="ludo-pname">{PLAYER_NAMES[pi]}</span>
        </div>
      ))}
    </div>
  );
}
