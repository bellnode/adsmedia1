/** Premium 3D-style graphics for home dashboard */

export function WalletCoinArt({ size = 88, className = '' }) {
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 88 75" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="wg-wallet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="50%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="wg-wallet-fold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="wg-coin" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="wg-coin-shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFBEB" stopOpacity="0" />
        </linearGradient>
        <filter id="wg-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.25" />
        </filter>
      </defs>
      <g filter="url(#wg-shadow)">
        <rect x="8" y="22" width="52" height="38" rx="8" fill="url(#wg-wallet)" />
        <path d="M8 30h52v6H8z" fill="url(#wg-wallet-fold)" opacity="0.6" />
        <rect x="42" y="36" width="22" height="18" rx="5" fill="#1E3A5F" stroke="#334155" strokeWidth="1.5" />
        <circle cx="52" cy="45" r="3" fill="#F59E0B" />
        <path d="M14 28h36" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g filter="url(#wg-shadow)">
        <circle cx="68" cy="48" r="18" fill="url(#wg-coin)" />
        <ellipse cx="62" cy="40" rx="8" ry="5" fill="url(#wg-coin-shine)" />
        <text x="68" y="53" textAnchor="middle" fill="#78350F" fontSize="14" fontWeight="700" fontFamily="Segoe UI,sans-serif">$</text>
      </g>
    </svg>
  );
}

export function GfxStatChart({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden>
      <defs>
        <linearGradient id="gs-chart-bg" x1="0" y1="0" x2="36" y2="36">
          <stop stopColor="#DCFCE7" /><stop offset="1" stopColor="#BBF7D0" />
        </linearGradient>
        <linearGradient id="gs-chart-bar" x1="0" y1="36" x2="0" y2="0">
          <stop stopColor="#16A34A" /><stop offset="1" stopColor="#4ADE80" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#gs-chart-bg)" />
      <rect x="8" y="20" width="5" height="10" rx="2" fill="url(#gs-chart-bar)" />
      <rect x="15.5" y="14" width="5" height="16" rx="2" fill="url(#gs-chart-bar)" />
      <rect x="23" y="9" width="5" height="21" rx="2" fill="url(#gs-chart-bar)" />
    </svg>
  );
}

export function GfxStatPending({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden>
      <defs>
        <linearGradient id="gs-pend-bg" x1="0" y1="0" x2="36" y2="36">
          <stop stopColor="#FFEDD5" /><stop offset="1" stopColor="#FED7AA" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#gs-pend-bg)" />
      <circle cx="18" cy="18" r="10" stroke="#EA580C" strokeWidth="2.5" fill="none" />
      <path d="M18 12v7l4 2.5" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GfxStatWithdraw({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden>
      <defs>
        <linearGradient id="gs-wd-bg" x1="0" y1="0" x2="36" y2="36">
          <stop stopColor="#DBEAFE" /><stop offset="1" stopColor="#BFDBFE" />
        </linearGradient>
        <linearGradient id="gs-bag" x1="10" y1="10" x2="26" y2="28">
          <stop stopColor="#2563EB" /><stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#gs-wd-bg)" />
      <path d="M12 14h12l-1.5 14H13.5L12 14z" fill="url(#gs-bag)" />
      <path d="M15 14c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="18" cy="20" r="2" fill="#FBBF24" />
    </svg>
  );
}

function MenuIconBase({ size, children, gradId, c1, c2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="52" y2="52">
          <stop stopColor={c1} /><stop offset="1" stopColor={c2} />
        </linearGradient>
        <filter id={`${gradId}-sh`}>
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.2" />
        </filter>
      </defs>
      <rect width="52" height="52" rx="14" fill={`url(#${gradId})`} filter={`url(#${gradId}-sh)`} />
      {children}
    </svg>
  );
}

export function GfxMenuTasks({ size = 52 }) {
  return (
    <MenuIconBase size={size} gradId="gm-tasks" c1="#22C55E" c2="#16A34A">
      <rect x="14" y="12" width="24" height="28" rx="4" fill="white" fillOpacity="0.95" />
      <path d="M19 20h14M19 26h14M19 32h9" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 30l3 3 5-6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </MenuIconBase>
  );
}

export function GfxMenuPlans({ size = 52 }) {
  return (
    <MenuIconBase size={size} gradId="gm-plans" c1="#A855F7" c2="#7C3AED">
      <path d="M26 14l10 5v12l-10 5-10-5V19l10-5z" fill="white" fillOpacity="0.95" />
      <path d="M26 24v12M16 19l10 5 10-5" stroke="#7C3AED" strokeWidth="1.8" />
      <circle cx="26" cy="19" r="3" fill="#FBBF24" />
    </MenuIconBase>
  );
}

export function GfxMenuWithdraw({ size = 52 }) {
  return (
    <MenuIconBase size={size} gradId="gm-wd" c1="#10B981" c2="#059669">
      <rect x="13" y="18" width="26" height="18" rx="4" fill="white" fillOpacity="0.95" />
      <path d="M13 24h26" stroke="#059669" strokeWidth="2" />
      <rect x="20" y="14" width="12" height="6" rx="2" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
      <circle cx="32" cy="30" r="2.5" fill="#059669" />
    </MenuIconBase>
  );
}

export function GfxMenuHistory({ size = 52 }) {
  return (
    <MenuIconBase size={size} gradId="gm-hist" c1="#0EA5E9" c2="#0284C7">
      <circle cx="26" cy="26" r="11" stroke="white" strokeWidth="2.5" fill="none" />
      <path d="M26 19v7l5 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </MenuIconBase>
  );
}

export function GfxMenuSupport({ size = 52 }) {
  return (
    <MenuIconBase size={size} gradId="gm-sup" c1="#F472B6" c2="#EC4899">
      <path d="M26 14a8 8 0 00-8 8v4a3 3 0 003 3h1v-5h-4a6 6 0 0112 0h-4v5h1a3 3 0 003-3v-4a8 8 0 00-8-8z" fill="white" fillOpacity="0.95" />
      <path d="M22 34h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </MenuIconBase>
  );
}

export function GfxCoinSmall({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <defs>
        <linearGradient id="gc-sm" x1="0" y1="0" x2="20" y2="20">
          <stop stopColor="#FDE68A" /><stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <circle cx="10" cy="10" r="9" fill="url(#gc-sm)" stroke="#B45309" strokeWidth="1" />
      <text x="10" y="14" textAnchor="middle" fill="#78350F" fontSize="9" fontWeight="700">$</text>
    </svg>
  );
}

export const HOME_MENU_GFX = {
  tasks: GfxMenuTasks,
  plans: GfxMenuPlans,
  withdrawals: GfxMenuWithdraw,
  history: GfxMenuHistory,
  tickets: GfxMenuSupport,
};
