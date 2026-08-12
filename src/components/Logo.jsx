/**
 * AdsMedia1 logo — round blue A1 mark only (+ optional text tagline)
 */
export default function Logo({
  size = 36,
  showTag = false,
  className = '',
  light = false,
  variant,
  markOnly = true,
}) {
  const onDark = variant === 'light' || variant === 'on-dark' || light === true;
  const markSrc = '/brand-mark.png';
  const fallbackSrc = onDark ? '/logo-on-dark.svg' : '/logo-on-light.svg';

  return (
    <div className={`brand-logo ${onDark ? 'on-dark' : 'on-light'} ${className}`.trim()} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src={markSrc}
        alt="AdsMedia1"
        style={{
          height: size,
          width: size,
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'block',
          background: 'transparent',
          flexShrink: 0,
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackSrc;
          e.target.style.borderRadius = '50%';
        }}
      />
      {(showTag || markOnly === false) && (
        <div className="brand-logo-text">
          <div style={{
            fontWeight: 800, fontSize: Math.max(14, size * 0.42), lineHeight: 1.1,
            color: onDark ? '#fff' : 'var(--text)',
          }}>
            AdsMedia<span style={{ color: '#16A34A' }}>1</span>
          </div>
          <div style={{
            fontSize: 10,
            color: onDark ? 'rgba(255,255,255,.75)' : 'var(--muted)',
            fontWeight: 500,
          }}>
            Earn More, Every Day
          </div>
        </div>
      )}
    </div>
  );
}
