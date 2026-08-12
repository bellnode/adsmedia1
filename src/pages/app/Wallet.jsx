import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useI18n } from '../../i18n.jsx';
import { TopBar, fmt, useToast } from '../../components/ui.jsx';
import { IconCoin, IconWithdraw, IconHistory, IconGames, IconCrown } from '../../components/AppIcons.jsx';
import { playConvert } from '../../utils/sound.js';

export default function Wallet() {
  const { t } = useI18n();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [cfg, setCfg] = useState({});
  const [convertAmt, setConvertAmt] = useState('');

  useEffect(() => {
    api('/api/user/me').then(d => setUser(d.user)).catch(() => {});
    api('/api/games/config').then(d => setCfg(d.config || {})).catch(() => {});
  }, []);

  const convert = async () => {
    try {
      const d = await api('/api/games/convert', { method: 'POST', body: { coins: convertAmt } });
      playConvert();
      toast(`Converted ${d.converted} coins → ৳${d.tk}`, 'ok');
      setUser(u => ({ ...u, coins: d.coins, mainBalance: d.mainBalance }));
      setConvertAmt('');
    } catch (e) { toast(e.message, 'err'); }
  };

  if (!user) return <span className="spinner" />;

  const rate = cfg.coinToTkRate || 0.12;
  const usdEquiv = (user.coins / 1000).toFixed(2);

  return (
    <>
      <TopBar title={t('wallet')} />
      <div className="page">
        <div className="wallet-coins-card">
          <div className="lbl">{t('coinBalance')}</div>
          <div className="big coin-row"><IconCoin size={28} /> {user.coins?.toLocaleString()}</div>
          <div className="sub">≈ ${usdEquiv} USD · 1000 coins = $1</div>
        </div>
        <div className="row2">
          <div className="mini-card"><div className="v">৳{fmt(user.mainBalance)}</div><div className="l">{t('mainBalance')}</div></div>
          <div className="mini-card"><div className="v">৳{fmt(user.depositBalance)}</div><div className="l">{t('depositBalance')}</div></div>
        </div>
        <div className="qa-grid" style={{ marginBottom: 14 }}>
          <Link to="/app/plans" className="qa-item"><span className="ic svg-ic"><IconCrown size={22} /></span>{t('buyPlan')}</Link>
          <Link to="/app/withdraw" className="qa-item"><span className="ic svg-ic"><IconWithdraw size={22} /></span>{t('getPayment')}</Link>
          <Link to="/app/history" className="qa-item"><span className="ic svg-ic"><IconHistory size={22} /></span>{t('history')}</Link>
          <Link to="/app/games" className="qa-item"><span className="ic svg-ic"><IconGames size={22} /></span>{t('games')}</Link>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>{t('convertCoins')}</h3>
          <div className="field"><label>{t('coins')} (min 100)</label>
            <input type="number" value={convertAmt} onChange={e => setConvertAmt(e.target.value)} placeholder="1000" /></div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>Rate: 1 coin = ৳{rate}</div>
          <button className="btn full blue" onClick={convert}>{t('convertToTk')}</button>
        </div>
      </div>
    </>
  );
}
