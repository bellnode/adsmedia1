/** Illustrated icons for challenging games (matches UI mockup) */
const ICONS = {
  color: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect width="48" height="48" rx="10" fill="#1E1B4B" />
      <circle cx="16" cy="24" r="9" fill="#EF4444" />
      <circle cx="32" cy="24" r="9" fill="#22C55E" />
      <circle cx="24" cy="14" r="7" fill="#A855F7" />
      <path d="M24 21v6M21 24h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".6" />
    </svg>
  ),
  ludo: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect width="48" height="48" rx="10" fill="#FFF8E1" />
      <path d="M4 24h40M24 4v40" stroke="#fff" strokeWidth="3" />
      <rect x="4" y="4" width="20" height="20" rx="4" fill="#E53935" />
      <rect x="24" y="4" width="20" height="20" rx="4" fill="#FDD835" />
      <rect x="4" y="24" width="20" height="20" rx="4" fill="#43A047" />
      <rect x="24" y="24" width="20" height="20" rx="4" fill="#1E88E5" />
      <circle cx="24" cy="24" r="7" fill="#fff" />
      <circle cx="24" cy="24" r="4" fill="#E53935" />
      <circle cx="14" cy="14" r="2.5" fill="#fff" />
      <circle cx="34" cy="14" r="2.5" fill="#fff" />
      <circle cx="14" cy="34" r="2.5" fill="#fff" />
      <circle cx="34" cy="34" r="2.5" fill="#fff" />
    </svg>
  ),
  stock: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect width="48" height="48" rx="10" fill="#1B3A57" />
      <path d="M8 34L16 26L22 30L30 18L40 12" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 38L18 28L26 32L34 22L40 26" stroke="#EF5350" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />
      <path d="M36 10l4 4-4 4" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 36l4-4 4 4" stroke="#EF5350" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />
    </svg>
  ),
  scratch: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect width="48" height="48" rx="10" fill="#FF6D00" />
      <rect x="10" y="14" width="24" height="16" rx="3" fill="#FFB74D" transform="rotate(-8 22 22)" />
      <rect x="12" y="18" width="24" height="16" rx="3" fill="#FF9800" transform="rotate(4 24 26)" />
      <rect x="14" y="22" width="24" height="16" rx="3" fill="#FFF3E0" />
      <path d="M16 28h20" stroke="#FF6D00" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
      <circle cx="34" cy="30" r="5" fill="#FFD54F" stroke="#F57C00" strokeWidth="1.5" />
      <text x="34" y="32.5" textAnchor="middle" fill="#E65100" fontSize="7" fontWeight="800">$</text>
    </svg>
  ),
  lottery: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect width="48" height="48" rx="10" fill="#C62828" />
      <rect x="8" y="12" width="22" height="14" rx="2" fill="#FFEB3B" stroke="#F9A825" strokeWidth="1.5" />
      <path d="M30 19h6l4 8H30V19z" fill="#FFEB3B" stroke="#F9A825" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="14" cy="19" r="2" fill="#F57F17" />
      <text x="20" y="22" fill="#E65100" fontSize="7" fontWeight="800">LOTTO</text>
      <circle cx="34" cy="32" r="9" fill="#111" stroke="#fff" strokeWidth="2" />
      <circle cx="34" cy="32" r="6" fill="#fff" />
      <text x="34" y="35" textAnchor="middle" fill="#111" fontSize="9" fontWeight="900">8</text>
    </svg>
  ),
  spin: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect width="48" height="48" rx="10" fill="#78350F" />
      <circle cx="24" cy="24" r="16" fill="#F59E0B" stroke="#FBBF24" strokeWidth="2" />
      <circle cx="24" cy="24" r="12" fill="none" stroke="#92400E" strokeWidth="1" strokeDasharray="4 3" />
      <circle cx="24" cy="24" r="5" fill="#FBBF24" stroke="#78350F" strokeWidth="1.5" />
      <text x="24" y="27" textAnchor="middle" fill="#78350F" fontSize="6" fontWeight="800">SPIN</text>
    </svg>
  ),
  streak: (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect width="48" height="48" rx="10" fill="#431407" />
      <path d="M24 8c4 6 8 8 8 14a8 8 0 01-16 0c0-4 2.5-6 4-9 0 3-1.5 5-3 7-3-2-4.5-4.5-4.5-8 0-4 3-7 11.5-8z" fill="#F97316" />
      <path d="M24 8c4 6 8 8 8 14a8 8 0 01-16 0c0-4 2.5-6 4-9 0 3-1.5 5-3 7-3-2-4.5-4.5-4.5-8 0-4 3-7 11.5-8z" fill="#FBBF24" opacity="0.4" />
    </svg>
  ),
};

export default function ChallengeGameIcon({ game, size = 44, className = '' }) {
  const icon = ICONS[game] || ICONS.ludo;
  return (
    <span
      className={`challenge-game-icon ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {icon}
    </span>
  );
}
