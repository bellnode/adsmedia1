/** Task category definitions — navy/black/white theme */
import {
  IconGift, IconLeaderboard, IconGames, IconSocial, IconRefer, IconTasks,
} from './components/AppIcons.jsx';

export const CATEGORIES = [
  {
    id: 'daily',
    num: 1,
    path: '/app/tasks/daily',
    Icon: IconGift,
    color: '#0F172A',
    colorLight: '#E2E8F0',
    titleKey: 'catDaily',
    subKey: 'catDailySub',
    footerKey: 'catDailyFooter',
  },
  {
    id: 'challenging',
    num: 2,
    path: '/app/tasks/challenging',
    Icon: IconLeaderboard,
    color: '#1E3A5F',
    colorLight: '#E2E8F0',
    titleKey: 'catChallenging',
    subKey: 'catChallengingSub',
    footerKey: 'catChallengingFooter',
  },
  {
    id: 'gamified',
    num: 3,
    path: '/app/tasks/gamified',
    Icon: IconGames,
    color: '#111827',
    colorLight: '#E2E8F0',
    titleKey: 'catGamified',
    subKey: 'catGamifiedSub',
    footerKey: 'catGamifiedFooter',
  },
  {
    id: 'social',
    num: 4,
    path: '/app/tasks/social',
    Icon: IconSocial,
    color: '#1E3A5F',
    colorLight: '#E2E8F0',
    titleKey: 'catSocial',
    subKey: 'catSocialSub',
    footerKey: 'catSocialFooter',
  },
  {
    id: 'referral',
    num: 5,
    path: '/app/tasks/referral',
    Icon: IconRefer,
    color: '#0F172A',
    colorLight: '#E2E8F0',
    titleKey: 'catReferral',
    subKey: 'catReferralSub',
    footerKey: 'catReferralFooter',
  },
  {
    id: 'bonus',
    num: 6,
    path: '/app/tasks/bonus',
    Icon: IconGift,
    color: '#111827',
    colorLight: '#E2E8F0',
    titleKey: 'catBonus',
    subKey: 'catBonusSub',
    footerKey: 'catBonusFooter',
  },
];

export const CHALLENGING_GAMES = [
  { to: '/app/games/color', name: 'Color Prediction', entry: 10, win: 49, game: 'color', winType: 'upto' },
  { to: '/app/games/ludo', name: 'Ludo Game', entry: 50, win: 200, game: 'ludo', winType: 'upto' },
  { to: '/app/games/stock', name: 'Stock Prediction', entry: 30, win: 150, game: 'stock', winType: 'upto' },
  { to: '/app/games/scratch', name: 'Scratch Card', entry: 20, win: 100, game: 'scratch', winType: 'instant' },
  { to: '/app/games/lottery', name: 'Lottery', entry: 10, win: 500, game: 'lottery', winType: 'jackpot' },
];

export const REFERRAL_MILESTONES = [
  { count: 1, reward: 50 },
  { count: 3, reward: 150 },
  { count: 5, reward: 300 },
  { count: 1, reward: 500, premium: true },
];

export const BONUS_TASKS = [
  { id: 'login', titleKey: 'bonusLogin', reward: 20, action: '/app/games/streak' },
  { id: 'allTasks', titleKey: 'bonusAllTasks', reward: 50, action: '/app/tasks/daily' },
  { id: 'weekly', titleKey: 'bonusWeekly', reward: 100, action: '/app/tasks/daily' },
  { id: 'achievement', titleKey: 'bonusAchievement', reward: 30, action: '/app/games' },
  { id: 'activeTime', titleKey: 'bonusActiveTime', reward: 10, action: '/app/tasks/daily' },
];
