import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import Logo from '../components/Logo.jsx';

const SLIDES = [
  { ic: '🪙', title: 'Earn Coins', desc: 'Complete daily tasks, watch ads & surveys to earn coins every day.', color: '#5E35B1' },
  { ic: '🎮', title: 'Play & Win', desc: 'Spin wheel, scratch cards, ludo, lottery & more exciting games.', color: '#1E88E5' },
  { ic: '💸', title: 'Withdraw Anytime', desc: 'Convert coins to cash & withdraw via bKash, Nagad, Rocket or UPI.', color: '#43A047' },
];

export default function Onboarding() {
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const slide = SLIDES[i];

  const finish = async () => {
    try {
      if (localStorage.getItem('token')) await api('/api/user/onboarding/done', { method: 'POST' });
    } catch { /* ignore */ }
    localStorage.setItem('onboarding_seen', '1');
    nav(localStorage.getItem('token') ? '/app' : '/register');
  };

  const next = () => i < SLIDES.length - 1 ? setI(i + 1) : finish();

  return (
    <div className="onboard-wrap">
      <div className="onboard-slide" style={{ background: `linear-gradient(160deg, ${slide.color}, ${slide.color}99)` }}>
        <div className="onboard-ic">{slide.ic}</div>
        <h1>{slide.title}</h1>
        <p>{slide.desc}</p>
      </div>
      <div className="onboard-footer">
        <div className="onboard-dots">
          {SLIDES.map((_, x) => <span key={x} className={x === i ? 'on' : ''} />)}
        </div>
        <button className="btn full" onClick={next}>{i < SLIDES.length - 1 ? 'Next →' : 'Get Started'}</button>
        <button className="btn ghost full" style={{ marginTop: 8 }} onClick={finish}>Skip</button>
        <div style={{ textAlign: 'center', marginTop: 16 }}><Logo size={28} showTag /></div>
      </div>
    </div>
  );
}
