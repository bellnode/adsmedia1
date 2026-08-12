/** Brand-style icons for social task platforms (matches UI mockup) */
const PLATFORMS = {
  youtube: { bg: '#FF0000', className: 'yt' },
  tiktok: { bg: '#111827', className: 'tt' },
  facebook: { bg: '#1877F2', className: 'fb' },
  telegram: { bg: '#0088CC', className: 'tg' },
  share: { bg: '#2563EB', className: 'sh' },
  instagram: { bg: 'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)', className: 'ig' },
};

export default function SocialPlatformIcon({ platform, size = 36, className = '' }) {
  const p = PLATFORMS[platform] || PLATFORMS.share;
  return (
    <span
      className={`social-plat-icon ${p.className} ${className}`.trim()}
      style={{ width: size, height: size, background: p.bg }}
      aria-hidden
    />
  );
}

export const SOCIAL_TASK_DEFAULTS = [
  { platform: 'youtube', titleKey: 'socialYoutube', reward: 20 },
  { platform: 'tiktok', titleKey: 'socialTiktok', reward: 20 },
  { platform: 'facebook', titleKey: 'socialFacebook', reward: 15 },
  { platform: 'telegram', titleKey: 'socialTelegram', reward: 15 },
  { platform: 'share', titleKey: 'socialShare', reward: 20 },
];
