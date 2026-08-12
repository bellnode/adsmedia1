import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../api.js';
import { useToast } from './ui.jsx';

function loadScript(id, src) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const s = document.createElement('script');
    s.id = id;
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${id}`));
    document.head.appendChild(s);
  });
}

export default function SocialAuthButtons({ onPhoneClick }) {
  const toast = useToast();
  const nav = useNavigate();
  const [cfg, setCfg] = useState(null);
  const [sdkReady, setSdkReady] = useState({ google: false, facebook: false });

  useEffect(() => {
    api('/api/public/config').then(d => setCfg(d.config || {})).catch(() => setCfg({}));
  }, []);

  const afterAuth = useCallback((data) => {
    setToken(data.token);
    toast(`Welcome ${data.user.name}! 🎉`, 'ok');
    nav(data.user.role === 'admin' ? '/admin' : data.user.role === 'agent' ? '/agent' : '/app');
  }, [nav, toast]);

  useEffect(() => {
    if (!cfg) return;
    const googleId = cfg.google_client_id || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const fbId = cfg.facebook_app_id || import.meta.env.VITE_FACEBOOK_APP_ID;

    if (googleId) {
      loadScript('google-gsi', 'https://accounts.google.com/gsi/client')
        .then(() => setSdkReady(s => ({ ...s, google: true })))
        .catch(() => {});
    }
    if (fbId) {
      loadScript('facebook-jssdk', 'https://connect.facebook.net/en_US/sdk.js')
        .then(() => {
          window.fbAsyncInit = () => {
            window.FB.init({ appId: fbId, cookie: true, xfbml: false, version: 'v19.0' });
            setSdkReady(s => ({ ...s, facebook: true }));
          };
          if (window.FB) window.fbAsyncInit();
        })
        .catch(() => {});
    }
  }, [cfg]);

  const loginGoogle = () => {
    const googleId = cfg?.google_client_id || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleId) return toast('Google login not configured. Add Client ID in Admin → Settings.', 'err');
    if (!window.google?.accounts?.oauth2) return toast('Google SDK loading… try again in a moment.', 'err');

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: googleId,
      scope: 'openid email profile',
      callback: async (resp) => {
        if (resp.error) return toast(resp.error, 'err');
        try {
          const data = await api('/api/auth/google', { method: 'POST', body: { accessToken: resp.access_token } });
          afterAuth(data);
        } catch (e) { toast(e.message, 'err'); }
      },
    });
    client.requestAccessToken();
  };

  const loginFacebook = () => {
    const fbId = cfg?.facebook_app_id || import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!fbId) return toast('Facebook login not configured. Add App ID in Admin → Settings.', 'err');
    if (!window.FB) return toast('Facebook SDK loading… try again in a moment.', 'err');

    window.FB.login(async (response) => {
      if (!response.authResponse) {
        if (response.status !== 'unknown') toast('Facebook login cancelled', 'err');
        return;
      }
      try {
        const data = await api('/api/auth/facebook', {
          method: 'POST',
          body: { accessToken: response.authResponse.accessToken },
        });
        afterAuth(data);
      } catch (e) { toast(e.message, 'err'); }
    }, { scope: 'email,public_profile' });
  };

  return (
    <div className="auth-social-icons">
      <button type="button" className="auth-social-item" onClick={loginGoogle} disabled={cfg && !cfg.google_client_id && !import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <span className="auth-social-circle google" aria-hidden>G</span>
        <span>Google</span>
      </button>
      <button type="button" className="auth-social-item" onClick={loginFacebook} disabled={cfg && !cfg.facebook_app_id && !import.meta.env.VITE_FACEBOOK_APP_ID}>
        <span className="auth-social-circle facebook" aria-hidden>f</span>
        <span>Facebook</span>
      </button>
      <button type="button" className="auth-social-item" onClick={onPhoneClick}>
        <span className="auth-social-circle phone" aria-hidden>📞</span>
        <span>Phone Number</span>
      </button>
    </div>
  );
}
