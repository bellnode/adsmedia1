import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n.jsx';
import { TopBar } from '../../components/ui.jsx';
import ChallengeGameIcon from '../../components/ChallengeGameIcon.jsx';
import { IconLeaderboard } from '../../components/AppIcons.jsx';

const GAMES = [
  { to: '/app/games/spin', game: 'spin', name: 'Spin Wheel', desc: 'Free daily spin + win up to 500 coins' },
  { to: '/app/games/scratch', game: 'scratch', name: 'Scratch & Win', desc: 'Scratch card to reveal coin prizes' },
  { to: '/app/games/ludo', game: 'ludo', name: 'Ludo Game', desc: 'Roll dice & beat the bot to win' },
  { to: '/app/games/stock', game: 'stock', name: 'Stock Prediction', desc: 'Predict UP, DOWN or SIDEWAYS' },
  { to: '/app/games/lottery', game: 'lottery', name: 'Lottery', desc: 'Buy tickets & win the jackpot' },
  { to: '/app/games/color', game: 'color', name: 'Color Prediction', desc: 'Pick Red, Green or Violet — win up to 4.87x' },
  { to: '/app/games/streak', game: 'streak', name: 'Streak Bonus', desc: 'Daily login streak rewards' },
];

export default function GamesHub() {
  const { t } = useI18n();

  return (
    <div className="games-hub-shell">
      <TopBar title={t('games')} />
      <div className="page games-hub-page">
        <div className="games-hero navy-hero">
          <div className="t">{t('playWin')}</div>
          <div className="d">{t('gamesSub')}</div>
        </div>
        <div className="games-grid">
          {GAMES.map(g => (
            <Link key={g.to} to={g.to} className="game-card pro">
              <ChallengeGameIcon game={g.game} size={52} />
              <div className="grow">
                <div className="gt">{g.name}</div>
                <div className="gd">{g.desc}</div>
              </div>
              <span className="btn xs">Play →</span>
            </Link>
          ))}
        </div>
        <Link to="/app/leaderboard" className="card game-leader-link">
          <span className="lb-ic"><IconLeaderboard size={28} /></span>
          <div className="grow">
            <div className="lb-t">{t('leaderboard')}</div>
            <div className="muted lb-d">{t('leaderboardSub')}</div>
          </div>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
