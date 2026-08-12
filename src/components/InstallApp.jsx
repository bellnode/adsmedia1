import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useI18n } from '../i18n.jsx';
import { useToast } from './ui.jsx';

let deferredPrompt = null;
const listeners = new Set();

function notifyInstallable() {
  listeners.forEach((fn) => fn(!!deferredPrompt));
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    notifyInstallable();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyInstallable();
  });
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

export function useInstallApp() {
  const [canInstall, setCanInstall] = useState(!!deferredPrompt);
  const [apkUrl, setApkUrl] = useState('');

  useEffect(() => {
    const fn = (v) => setCanInstall(v);
    listeners.add(fn);
    setCanInstall(!!deferredPrompt);
    api('/api/public/config').then(d => setApkUrl(d.config?.android_apk_url || '')).catch(() => {});
    return () => listeners.delete(fn);
  }, []);

  return { canInstall, apkUrl, isStandalone: isStandalone(), isAndroid: isAndroid() };
}

/** Banner / button for Android install (PWA) or APK download */
export default function InstallAppBanner({ compact = false, className = '' }) {
  const { t } = useI18n();
  const toast = useToast();
  const { canInstall, apkUrl, isStandalone: installed } = useInstallApp();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('install_banner_dismissed') === '1');

  if (installed || dismissed) return null;

  const onInstall = async () => {
    if (apkUrl) {
      window.open(apkUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      notifyInstallable();
      if (outcome === 'accepted') toast(t('appInstalled'), 'ok');
      return;
    }
    // Fallback instructions (Chrome Android menu)
    toast(t('installAppHint'), 'ok');
  };

  const dismiss = () => {
    localStorage.setItem('install_banner_dismissed', '1');
    setDismissed(true);
  };

  if (compact) {
    return (
      <button type="button" className={`install-app-btn ${className}`.trim()} onClick={onInstall}>
        {t('downloadApp')}
      </button>
    );
  }

  return (
    <div className={`install-app-banner ${className}`.trim()}>
      <div className="install-app-icon" aria-hidden>
        <img src="/icon-192.png" alt="" width={44} height={44} />
      </div>
      <div className="grow">
        <div className="t">{t('downloadApp')}</div>
        <div className="d">{t('downloadAppSub')}</div>
      </div>
      <button type="button" className="btn xs" onClick={onInstall}>
        {apkUrl || canInstall ? t('install') : t('getApp')}
      </button>
      <button type="button" className="install-app-x" onClick={dismiss} aria-label="Dismiss">×</button>
    </div>
  );
}
