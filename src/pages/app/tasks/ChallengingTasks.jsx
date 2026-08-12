import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n.jsx';
import { TopBar } from '../../../components/ui.jsx';
import ChallengeGameIcon from '../../../components/ChallengeGameIcon.jsx';
import { CHALLENGING_GAMES } from '../../../taskCategories.js';

function WinLine({ game, t }) {
  if (game.winType === 'instant') {
    return (
      <div className="challenge-win">
        {t('winInstantPrefix')}{' '}
        <span className="challenge-win-green">{t('winInstantHighlight')}</span>
      </div>
    );
  }
  if (game.winType === 'jackpot') {
    return (
      <div className="challenge-win">
        {t('winInstantPrefix')}{' '}
        <span className="challenge-win-green">{t('winJackpotHighlight')}</span>
      </div>
    );
  }
  return (
    <div className="challenge-win">
      {t('winUptoPrefix')}{' '}
      <span className="challenge-win-green">{game.win} {t('coins')}</span>
    </div>
  );
}

export default function ChallengingTasks() {
  const { t } = useI18n();

  return (
    <>
      <TopBar title={t('catChallenging')} backTo="/app/tasks" />
      <div className="page challenging-tasks-page">
        <div className="cat-detail-head compact navy-head" style={{ marginBottom: 0 }}>
          <span className="challenge-head-badge">2</span>
          <ChallengeGameIcon game="stock" size={36} />
          <div className="grow">
            <h2>{t('catChallenging')}</h2>
            <p>{t('catChallengingSub')}</p>
          </div>
        </div>

        <div className="challenge-task-card">
          {CHALLENGING_GAMES.map(g => (
            <Link key={g.to} to={g.to} className="challenge-task-row">
              <ChallengeGameIcon game={g.game} size={48} />
              <div className="challenge-task-grow">
                <div className="challenge-task-name">{g.name}</div>
                <div className="challenge-entry">{t('entryCoins', { n: g.entry })}</div>
                <WinLine game={g} t={t} />
              </div>
              <span className="btn xs challenge-play">{t('play')}</span>
            </Link>
          ))}
        </div>

        <div className="cat-foot-bar" style={{ background: '#E3EDF7', color: '#1B3A57', marginTop: 14 }}>
          {t('catChallengingFooter')}
        </div>
      </div>
    </>
  );
}
