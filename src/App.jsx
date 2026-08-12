import { Routes, Route, Navigate } from 'react-router-dom';
import { hasToken } from './api.js';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Forgot from './pages/Forgot.jsx';
import Onboarding from './pages/Onboarding.jsx';
import AppLayout from './components/AppLayout.jsx';
import AppHome from './pages/app/Home.jsx';
import TaskHub from './pages/app/TaskHub.jsx';
import Tasks from './pages/app/Tasks.jsx';
import ChallengingTasks from './pages/app/tasks/ChallengingTasks.jsx';
import GamifiedTasks from './pages/app/tasks/GamifiedTasks.jsx';
import ReferralTasks from './pages/app/tasks/ReferralTasks.jsx';
import BonusTasks from './pages/app/tasks/BonusTasks.jsx';
import Plans from './pages/app/Plans.jsx';
import Deposit from './pages/app/Deposit.jsx';
import Withdraw from './pages/app/Withdraw.jsx';
import History from './pages/app/History.jsx';
import Profile from './pages/app/Profile.jsx';
import Refer from './pages/app/Refer.jsx';
import Support from './pages/app/Support.jsx';
import Notifications from './pages/app/Notifications.jsx';
import GamesHub from './pages/app/GamesHub.jsx';
import SpinWheel from './pages/app/games/SpinWheel.jsx';
import ScratchCard from './pages/app/games/ScratchCard.jsx';
import LudoGame from './pages/app/games/Ludo.jsx';
import StockGame from './pages/app/games/Stock.jsx';
import LotteryGame from './pages/app/games/Lottery.jsx';
import StreakGame from './pages/app/games/Streak.jsx';
import ColorPrediction from './pages/app/games/ColorPrediction.jsx';
import Wallet from './pages/app/Wallet.jsx';
import UserPanel from './pages/app/UserPanel.jsx';
import More from './pages/app/More.jsx';
import Leaderboard from './pages/app/Leaderboard.jsx';
import SocialTasks from './pages/app/SocialTasks.jsx';
import Admin from './pages/admin/Admin.jsx';
import AgentPortal from './pages/agent/AgentPortal.jsx';

function Private({ children }) {
  return hasToken() ? children : <Navigate to="/login" replace />;
}

function OnboardGuard({ children }) {
  if (!hasToken()) return <Navigate to="/login" replace />;
  if (!localStorage.getItem('onboarding_seen') && !localStorage.getItem('skip_onboard')) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<Forgot />} />

      <Route element={<Private><AppLayout /></Private>}>
        <Route path="/app" element={<OnboardGuard><AppHome /></OnboardGuard>} />
        <Route path="/app/tasks" element={<TaskHub />} />
        <Route path="/app/tasks/daily" element={<Tasks />} />
        <Route path="/app/tasks/challenging" element={<ChallengingTasks />} />
        <Route path="/app/tasks/gamified" element={<GamifiedTasks />} />
        <Route path="/app/tasks/referral" element={<ReferralTasks />} />
        <Route path="/app/tasks/bonus" element={<BonusTasks />} />
        <Route path="/app/tasks/social" element={<SocialTasks />} />
        <Route path="/app/plans" element={<Plans />} />
        <Route path="/app/deposit" element={<Deposit />} />
        <Route path="/app/withdraw" element={<Withdraw />} />
        <Route path="/app/history" element={<History />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/refer" element={<Refer />} />
        <Route path="/app/support" element={<Support />} />
        <Route path="/app/notifications" element={<Notifications />} />
        <Route path="/app/wallet" element={<Wallet />} />
        <Route path="/app/games" element={<GamesHub />} />
        <Route path="/app/games/spin" element={<SpinWheel />} />
        <Route path="/app/games/scratch" element={<ScratchCard />} />
        <Route path="/app/games/ludo" element={<LudoGame />} />
        <Route path="/app/games/stock" element={<StockGame />} />
        <Route path="/app/games/lottery" element={<LotteryGame />} />
        <Route path="/app/games/streak" element={<StreakGame />} />
        <Route path="/app/games/color" element={<ColorPrediction />} />
        <Route path="/app/more" element={<More />} />
        <Route path="/app/panel" element={<UserPanel />} />
        <Route path="/app/leaderboard" element={<Leaderboard />} />
        <Route path="/app/social" element={<SocialTasks />} />
      </Route>

      <Route path="/admin/*" element={<Private><Admin /></Private>} />
      <Route path="/agent" element={<Private><AgentPortal /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
