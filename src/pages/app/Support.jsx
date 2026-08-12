import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { useI18n } from '../../i18n.jsx';
import { TopBar, fmtDate, useToast } from '../../components/ui.jsx';

export default function Support() {
  const { t } = useI18n();
  const toast = useToast();
  const [tickets, setTickets] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [config, setConfig] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [openTicket, setOpenTicket] = useState(null);
  const [reply, setReply] = useState('');

  const load = () => api('/api/user/tickets').then(d => setTickets(d.tickets)).catch(() => {});
  useEffect(() => {
    load();
    api('/api/public/faqs').then(d => setFaqs(d.faqs)).catch(() => {});
    api('/api/public/config').then(d => setConfig(d.config)).catch(() => {});
  }, []);

  const create = async () => {
    try {
      await api('/api/user/tickets', { method: 'POST', body: { subject, message } });
      toast('Ticket created ✓', 'ok');
      setShowNew(false); setSubject(''); setMessage('');
      load();
    } catch (e) { toast(e.message, 'err'); }
  };

  const sendReply = async () => {
    try {
      const d = await api(`/api/user/tickets/${openTicket._id}/reply`, { method: 'POST', body: { message: reply } });
      setOpenTicket(d.ticket); setReply('');
      load();
    } catch (e) { toast(e.message, 'err'); }
  };

  return (
    <>
      <TopBar title={`🎧 ${t('support')}`} />
      <div className="page">
        {config.helpline && (
          <a href={config.helpline} target="_blank" rel="noreferrer" className="card"
            style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(130deg, var(--green), var(--green-dark))', color: '#fff' }}>
            <span style={{ fontSize: 28 }}>💬</span>
            <div>
              <div style={{ fontWeight: 800 }}>Live Chat / HelpLine</div>
              <div style={{ fontSize: 12, opacity: .9 }}>Telegram / WhatsApp — 24/7</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 20 }}>›</span>
          </a>
        )}

        {/* tickets */}
        {openTicket ? (
          <div className="card">
            <button className="btn xs ghost" onClick={() => setOpenTicket(null)}>← Back</button>
            <h3 style={{ margin: '10px 0 4px' }}>{openTicket.subject}</h3>
            <span className={`pill ${openTicket.status}`}>{openTicket.status}</span>
            <div style={{ margin: '12px 0' }}>
              {openTicket.messages.map((m, i) => (
                <div key={i} style={{
                  background: m.from === 'user' ? 'var(--green-light)' : 'var(--blue-light)',
                  borderRadius: 10, padding: '9px 12px', marginBottom: 8, fontSize: 13.5,
                  marginLeft: m.from === 'user' ? 20 : 0, marginRight: m.from === 'user' ? 0 : 20,
                }}>
                  <b style={{ fontSize: 11 }}>{m.from === 'user' ? 'You' : 'Support'}</b>
                  <div>{m.text}</div>
                  <div className="muted" style={{ fontSize: 10.5, marginTop: 2 }}>{fmtDate(m.at)}</div>
                </div>
              ))}
            </div>
            {openTicket.status !== 'closed' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="field" style={{ flex: 1, marginBottom: 0, padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 10 }}
                  value={reply} onChange={e => setReply(e.target.value)} placeholder={t('message')} />
                <button className="btn sm" onClick={sendReply}>{t('send')}</button>
              </div>
            )}
          </div>
        ) : (<>
          <div className="section-row" style={{ margin: '4px 2px 10px' }}>
            <span className="t">🎫 {t('myTickets')}</span>
            <button className="btn xs" onClick={() => setShowNew(s => !s)}>+ {t('newTicket')}</button>
          </div>

          {showNew && (
            <div className="card">
              <div className="field"><label>{t('subject')}</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} /></div>
              <div className="field"><label>{t('message')}</label>
                <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} /></div>
              <button className="btn full" onClick={create}>{t('send')}</button>
            </div>
          )}

          {tickets === null ? <span className="spinner" />
            : tickets.length === 0 ? <div className="empty">{t('noData')}</div>
            : tickets.map(tk => (
              <div className="list-row" key={tk._id} style={{ cursor: 'pointer' }} onClick={() => setOpenTicket(tk)}>
                <span style={{ fontSize: 20 }}>🎫</span>
                <div className="grow">
                  <div className="t1">{tk.subject}</div>
                  <div className="t2">{fmtDate(tk.updatedAt)} · {tk.messages.length} messages</div>
                </div>
                <span className={`pill ${tk.status}`}>{tk.status}</span>
              </div>
            ))}
        </>)}

        {/* FAQ */}
        <div className="section-row" style={{ margin: '18px 2px 10px' }}>
          <span className="t">❓ {t('faq')}</span>
        </div>
        {faqs.map(f => (
          <details className="faq-item" key={f._id}>
            <summary>{f.question}</summary>
            <div className="a">{f.answer}</div>
          </details>
        ))}
      </div>
    </>
  );
}
