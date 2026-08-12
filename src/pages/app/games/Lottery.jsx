import { useEffect, useState } from 'react';
import { api } from '../../../api.js';
import { TopBar, fmtDate, useToast } from '../../../components/ui.jsx';

export default function LotteryGame() {
  const toast = useToast();
  const [lottery, setLottery] = useState(null);
  const [coins, setCoins] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = () => {
    api('/api/games/config').then(d => { setLottery(d.lottery); setCoins(d.user?.coins || 0); }).catch(() => {});
    api('/api/games/lottery/tickets').then(d => setTickets(d.tickets)).catch(() => {});
  };
  useEffect(load, []);

  const buy = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const d = await api('/api/games/lottery/buy', { method: 'POST' });
      toast(`Ticket ${d.ticketNo} purchased! 🎟️`, 'ok');
      setCoins(d.coins);
      load();
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  return (
    <>
      <TopBar title="Lottery" backTo="/app/games" />
      <div className="page">
        <div className="lottery-jackpot card">
          <div className="lbl">Current Jackpot</div>
          <div className="amt">🪙 {(lottery?.jackpot || 5000).toLocaleString()}</div>
          {lottery && <>
            <div className="muted" style={{ fontSize: 12 }}>Draw: {lottery.drawId} · Ends {fmtDate(lottery.endsAt)}</div>
            <div className="muted" style={{ fontSize: 12 }}>{lottery.ticketsSold} tickets sold · {lottery.ticketPrice} coins each</div>
          </>}
        </div>
        <div className="coin-pill">Your coins: 🪙 {coins?.toLocaleString()}</div>
        <button className="btn full orange" disabled={busy} onClick={buy}>Buy Ticket ({lottery?.ticketPrice || 50} coins)</button>
        <h3 style={{ fontSize: 14, margin: '16px 0 8px' }}>My Tickets</h3>
        {tickets.length === 0 ? <div className="empty">No tickets yet</div>
          : tickets.map(t => (
            <div className="list-row" key={t.ticketNo}>
              <div className="grow"><div className="t1">🎟️ {t.ticketNo}</div>
                <div className="t2">{t.drawId} · {fmtDate(t.createdAt)}</div></div>
              <span className="pill pending">{t.status || 'open'}</span>
            </div>
          ))}
      </div>
    </>
  );
}
