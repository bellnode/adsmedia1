import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { useI18n } from '../../i18n.jsx';
import { TopBar } from '../../components/ui.jsx';

export default function Leaderboard() {
  const { t } = useI18n();
  const [period, setPeriod] = useState('all');
  const [rows, setRows] = useState(null);

  useEffect(() => {
    setRows(null);
    api(`/api/public/leaderboard?period=${period}`).then(d => setRows(d.leaderboard)).catch(() => setRows([]));
  }, [period]);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <>
      <TopBar title={`🏆 ${t('leaderboard')}`} />
      <div className="page">
        <div className="tabs">
          {[['all', t('allTime')], ['week', t('thisWeek')], ['month', t('thisMonth')]].map(([id, label]) => (
            <button key={id} className={period === id ? 'sel' : ''} onClick={() => setPeriod(id)}>{label}</button>
          ))}
        </div>
        {rows === null ? <span className="spinner" /> : rows.length === 0 ? <div className="empty">{t('noData')}</div>
          : rows.map(r => (
            <div className={`lb-row ${r.rank <= 3 ? 'top' : ''}`} key={r.rank}>
              <span className="rank">{medals[r.rank - 1] || `#${r.rank}`}</span>
              <span className="name">{r.name}</span>
              <span className="score">🪙 {r.score.toLocaleString()}</span>
            </div>
          ))}
      </div>
    </>
  );
}
