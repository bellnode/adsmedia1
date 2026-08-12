/** Classic Ludo — 15×15 grid, cell = 10px, viewBox 0 0 150 150 */

export const CELL = 10;

/** Absolute track start indices (clockwise from green) */
const START = { green: 0, red: 13, blue: 26, yellow: 39 };
const SAFE_IDX = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

function c(col, row) {
  return [col * CELL + CELL / 2, row * CELL + CELL / 2];
}

/**
 * 52-cell track clockwise from Green start (1,6).
 * After 51 steps a token is on the cell before its start, then enters home.
 * Home stretches aim from that pre-start cell toward the center.
 */
const TRACK_RC = [
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  [7, 0],
  [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
  [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
  [14, 7],
  [14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
  [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
  [7, 14],
  [6, 14], [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
  [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  [0, 7],
  [0, 6],
];

export const TRACK = TRACK_RC.map(([col, row]) => c(col, row));

/**
 * Home stretch must continue from (START+51)%52 toward center:
 *   green ends (0,6) → right along row 7
 *   red   ends (8,0) → down along col 7
 *   blue  ends (14,8) → left along row 7
 *   yellow ends (6,14) → up along col 7
 */
const HOME_RC = {
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
};

const HOME = Object.fromEntries(
  Object.entries(HOME_RC).map(([k, cells]) => [k, cells.map(([col, row]) => c(col, row))]),
);

const YARD = {
  green: [c(1.5, 1.5), c(3.5, 1.5), c(1.5, 3.5), c(3.5, 3.5)],
  red: [c(10.5, 1.5), c(12.5, 1.5), c(10.5, 3.5), c(12.5, 3.5)],
  yellow: [c(1.5, 10.5), c(3.5, 10.5), c(1.5, 12.5), c(3.5, 12.5)],
  blue: [c(10.5, 10.5), c(12.5, 10.5), c(10.5, 12.5), c(12.5, 12.5)],
};

const FINISH = {
  green: c(6, 7),
  red: c(7, 6),
  blue: c(8, 7),
  yellow: c(7, 8),
};

export function tokenPosition(token) {
  const idx = parseInt(String(token.id).split('-')[1], 10) || 0;
  if (token.finished || token.distance >= 56) {
    const f = FINISH[token.color] || [75, 75];
    return { x: f[0] + ((idx % 2) - 0.5) * 3, y: f[1] + (Math.floor(idx / 2) - 0.5) * 3 };
  }
  if (token.distance === -1) {
    const p = YARD[token.color]?.[idx] || [75, 75];
    return { x: p[0], y: p[1] };
  }
  if (token.distance >= 51) {
    const h = HOME[token.color]?.[Math.min(token.distance - 51, 4)] || [75, 75];
    return { x: h[0], y: h[1] };
  }
  if (token.distance >= 0 && token.distance <= 50) {
    const trackIdx = (START[token.color] + token.distance) % 52;
    const p = TRACK[trackIdx] || [75, 75];
    return { x: p[0] + ((idx % 2) - 0.5) * 2, y: p[1] + (Math.floor(idx / 2) - 0.5) * 2 };
  }
}

export function getMoveSteps(token, fromDist, toDist) {
  const steps = [];
  const end = Math.max(-1, Math.min(toDist, FINISH_DIST));
  if (fromDist < 0) {
    steps.push({ ...token, distance: -1, finished: false });
    for (let d = 0; d <= end; d++) {
      steps.push({ ...token, distance: d, finished: d >= 56 });
    }
    return steps;
  }
  for (let d = fromDist; d <= end; d++) {
    steps.push({ ...token, distance: d, finished: d >= 56 });
  }
  return steps;
}

const FINISH_DIST = 56;

export function isSafeCell(trackIndex) {
  return SAFE_IDX.has(trackIndex);
}

export function startTrackIndex(color) {
  return START[color];
}

export const COLORS = {
  green: { fill: '#4ADE80', dark: '#166534', light: '#86EFAC', base: '#22C55E', soft: '#DCFCE7' },
  red: { fill: '#F87171', dark: '#991B1B', light: '#FCA5A5', base: '#EF4444', soft: '#FEE2E2' },
  yellow: { fill: '#FACC15', dark: '#854D0E', light: '#FDE047', base: '#EAB308', soft: '#FEF9C3' },
  blue: { fill: '#60A5FA', dark: '#1E40AF', light: '#93C5FD', base: '#3B82F6', soft: '#DBEAFE' },
};

export const PLAYER_NAMES = ['You', 'Red Bot', 'Blue Bot', 'Yellow Bot'];

export function buildBoardCells() {
  const cells = [];
  const seen = new Set();

  const isHomeCell = (col, row) =>
    Object.values(HOME_RC).some(list => list.some(([c, r]) => c === col && r === row));

  const add = (col, row, fill, stroke = '#E2E8F0', overwrite = false) => {
    const key = `${col},${row}`;
    if (seen.has(key) && !overwrite) return;
    seen.add(key);
    const idx = cells.findIndex(c => c.x === col * CELL && c.y === row * CELL);
    const cell = { x: col * CELL, y: row * CELL, w: CELL, h: CELL, fill, stroke };
    if (idx >= 0 && overwrite) cells[idx] = cell;
    else if (idx < 0) cells.push(cell);
  };

  // Cross paths (white) — skip home-stretch cells; those get player colors below
  for (let col = 0; col < 15; col++) {
    for (let row = 6; row <= 8; row++) {
      if (col >= 6 && col <= 8) continue;
      if (isHomeCell(col, row)) continue;
      add(col, row, '#FFFEF9');
    }
  }
  for (let row = 0; row < 15; row++) {
    for (let col = 6; col <= 8; col++) {
      if (row >= 6 && row <= 8) continue;
      if (isHomeCell(col, row)) continue;
      add(col, row, '#FFFEF9');
    }
  }

  // Colored home stretches (classic Ludo — green/red/blue/yellow lanes to center)
  HOME_RC.green.forEach(([col, row], i) =>
    add(col, row, i === 4 ? COLORS.green.base : COLORS.green.light, COLORS.green.dark, true));
  HOME_RC.red.forEach(([col, row], i) =>
    add(col, row, i === 4 ? COLORS.red.base : COLORS.red.light, COLORS.red.dark, true));
  HOME_RC.blue.forEach(([col, row], i) =>
    add(col, row, i === 4 ? COLORS.blue.base : COLORS.blue.light, COLORS.blue.dark, true));
  HOME_RC.yellow.forEach(([col, row], i) =>
    add(col, row, i === 4 ? COLORS.yellow.base : COLORS.yellow.light, COLORS.yellow.dark, true));

  // Start cells (entry from yard)
  add(1, 6, COLORS.green.base, COLORS.green.dark, true);
  add(8, 1, COLORS.red.base, COLORS.red.dark, true);
  add(13, 8, COLORS.blue.base, COLORS.blue.dark, true);
  add(6, 13, COLORS.yellow.base, COLORS.yellow.dark, true);

  return cells;
}

export function getSafeTrackCoords() {
  return [...SAFE_IDX].map(i => ({ x: TRACK[i][0], y: TRACK[i][1], i }));
}

export function getStartCoords() {
  return {
    green: TRACK[START.green],
    red: TRACK[START.red],
    blue: TRACK[START.blue],
    yellow: TRACK[START.yellow],
  };
}

export const BASES = {
  green: { x: 0, y: 0 },
  red: { x: 90, y: 0 },
  yellow: { x: 0, y: 90 },
  blue: { x: 90, y: 90 },
};

export { START, HOME_RC, TRACK_RC };
