import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../api.js';
import { TopBar, useToast } from '../../../components/ui.jsx';
import LudoBoard from '../../../components/LudoBoard.jsx';
import { getMoveSteps, PLAYER_NAMES } from '../../../games/ludoPath.js';
import { playLudo, playWin } from '../../../utils/sound.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

function cloneTokens(tokens) {
  return (tokens || []).map(t => ({ ...t }));
}

/** Only the moving goti changes — all others stay frozen on base snapshot */
function frameWithMove(baseTokens, tokenId, distance, finished = false) {
  return baseTokens.map(t =>
    t.id === tokenId
      ? { ...t, distance, finished: finished || distance >= 56 }
      : { ...t },
  );
}

export default function LudoGame() {
  const toast = useToast();
  const [cfg, setCfg] = useState(null);
  const [coins, setCoins] = useState(0);
  const [session, setSession] = useState(null);
  const [displayTokens, setDisplayTokens] = useState(null);
  const [busy, setBusy] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(null);
  const [gameOver, setGameOver] = useState(null);
  const sessionRef = useRef(null);
  sessionRef.current = session;

  const load = useCallback(async () => {
    const d = await api('/api/games/config');
    setCfg(d.config);
    setCoins(d.user?.coins || 0);
    const s = await api('/api/games/ludo/session').catch(() => ({ session: null }));
    if (s.session) {
      setSession(s.session);
      setDisplayTokens(s.session.tokens);
    }
  }, []);

  useEffect(() => { load().catch(() => {}); }, [load]);

  /** Animate one goti; every other goti stays on baseTokens the whole time */
  const animateMove = async (tokenId, fromDist, toDist, baseTokens) => {
    const token = baseTokens.find(t => t.id === tokenId);
    if (!token) return;
    const frozen = cloneTokens(baseTokens);
    const steps = getMoveSteps(token, fromDist, toDist);
    for (let i = 1; i < steps.length; i++) {
      setDisplayTokens(frameWithMove(frozen, tokenId, steps[i].distance, steps[i].finished));
      await sleep(100);
    }
  };

  const startGame = async (forceNew = false) => {
    if (busy) return;
    setBusy(true);
    setGameOver(null);
    try {
      if (forceNew && session) {
        await api('/api/games/ludo/forfeit', { method: 'POST' }).catch(() => {});
      }
      const d = await api('/api/games/ludo/start', {
        method: 'POST',
        body: forceNew ? { forceNew: true } : {},
      });
      setSession(d.session);
      setDisplayTokens(d.session.tokens);
      setDiceValue(null);
      toast(d.resumed ? 'Resumed match' : 'Game started! Roll 6 to open goti', 'ok');
    } catch (e) {
      toast(e.message, 'err');
    }
    setBusy(false);
  };

  const forfeitGame = async () => {
    if (busy || !session) return;
    setBusy(true);
    try {
      await api('/api/games/ludo/forfeit', { method: 'POST' });
      setSession(null);
      setDisplayTokens(null);
      setDiceValue(null);
      toast('Match ended', '');
    } catch (e) {
      toast(e.message, 'err');
    }
    setBusy(false);
  };

  const animateBotEvents = async (events, finalSession, startSnapshot) => {
    let snapshot = cloneTokens(startSnapshot);
    for (const ev of events) {
      if (ev.type === 'roll') {
        setRolling(true);
        setDiceValue(null);
        await sleep(450);
        setDiceValue(ev.roll);
        setRolling(false);
        await sleep(280);
      } else if (ev.type === 'move') {
        const from = ev.from ?? snapshot.find(t => t.id === ev.tokenId)?.distance ?? -1;
        const to = ev.to ?? (from === -1 ? 0 : Math.min(from + (ev.roll || 1), 56));

        if (ev.captured?.length) {
          snapshot = snapshot.map(t =>
            ev.captured.includes(t.id) ? { ...t, distance: -1, finished: false } : t,
          );
          setDisplayTokens(cloneTokens(snapshot));
          const mineHit = ev.captured.some(id => String(id).startsWith('green-'));
          toast(
            mineHit ? 'Your goti captured — back to yard!' : `${PLAYER_NAMES[ev.player]} captured!`,
            mineHit ? 'err' : 'ok',
          );
          await sleep(180);
        }

        await animateMove(ev.tokenId, from, to, snapshot);
        snapshot = snapshot.map(t =>
          t.id === ev.tokenId ? { ...t, distance: to, finished: to >= 56 } : t,
        );
        setDisplayTokens(cloneTokens(snapshot));
        await sleep(150);
      }
    }
    setSession(finalSession);
    setDisplayTokens(finalSession.tokens);
    setDiceValue(null);
  };

  const handleGameOver = d => {
    setGameOver(d);
    setSession(null);
    setDisplayTokens(null);
    setDiceValue(null);
    if (d.result === 'win') playWin();
    toast(
      d.result === 'win' ? `You won ${d.winAmount} coins!` : 'Better luck next time!',
      d.result === 'win' ? 'ok' : '',
    );
  };

  const applyMoveResult = async (d, tokenId, fromDist, beforeTokens) => {
    const toDist = d.to ?? (fromDist === -1 ? 0 : fromDist + (sessionRef.current?.lastRoll || 0));
    let snapshot = cloneTokens(beforeTokens);

    if (d.captured?.length) {
      snapshot = snapshot.map(t =>
        d.captured.includes(t.id) ? { ...t, distance: -1, finished: false } : t,
      );
      setDisplayTokens(cloneTokens(snapshot));
      toast('Captured! Opponent goti back to yard', 'ok');
      await sleep(180);
    }

    await animateMove(tokenId, fromDist, toDist, snapshot);
    snapshot = snapshot.map(t =>
      t.id === tokenId ? { ...t, distance: toDist, finished: toDist >= 56 } : t,
    );
    setDisplayTokens(cloneTokens(snapshot));
    setSession(d.session);
    setDiceValue(d.session.phase === 'moving' ? d.session.lastRoll : null);

    if (d.botEvents?.length) {
      await animateBotEvents(d.botEvents, d.session, snapshot);
    } else {
      setDisplayTokens(d.session.tokens);
    }

    if (d.result) handleGameOver(d);
  };

  const moveToken = async tokenId => {
    if (busy || session?.phase !== 'moving' || session?.currentTurn !== 0) return;
    setBusy(true);
    const beforeTokens = cloneTokens(session.tokens);
    const tok = session.tokens.find(t => t.id === tokenId);
    const fromDist = tok?.distance ?? -1;
    try {
      const d = await api(`/api/games/ludo/move?tokenId=${encodeURIComponent(tokenId)}`, { method: 'POST' });
      await applyMoveResult(d, tokenId, fromDist, beforeTokens);
    } catch (e) {
      toast(e.message, 'err');
    }
    setBusy(false);
  };

  const pickBestTokenId = (moves, tokens) => {
    if (!moves?.length) return null;
    const enter = moves.find(m => {
      const t = tokens.find(x => x.id === m.tokenId);
      return t && t.distance === -1;
    });
    return (enter || moves[0]).tokenId;
  };

  const pickTokenOrRoll = async () => {
    if (canMove && !busy) {
      const id = pickBestTokenId(session.legalMoves, session.tokens);
      if (id) await moveToken(id);
      return;
    }
    await roll();
  };

  const roll = async () => {
    if (busy || !session || session.phase !== 'rolling' || session.currentTurn !== 0) return;
    setBusy(true);
    setRolling(true);
    setDiceValue(null);
    const beforeTokens = cloneTokens(session.tokens);
    try {
      await sleep(500);
      const d = await api('/api/games/ludo/roll', { method: 'POST' });
      playLudo();
      setRolling(false);
      setDiceValue(d.roll);
      setSession(d.session);
      setDisplayTokens(d.session.tokens);
      setCoins(d.coins);

      if (d.skipped) toast('Three 6s — turn skipped!', '');
      if (d.noMove) toast(`Rolled ${d.roll} — no legal move`, '');

      if (d.session.phase === 'moving' && d.moves?.length) {
        if (d.moves.length === 1) {
          await sleep(300);
          const tokenId = d.moves[0].tokenId;
          const tok = d.session.tokens.find(t => t.id === tokenId);
          const moveRes = await api(`/api/games/ludo/move?tokenId=${encodeURIComponent(tokenId)}`, { method: 'POST' });
          await applyMoveResult(moveRes, tokenId, tok?.distance ?? -1, beforeTokens);
        } else {
          toast(d.roll === 6 ? 'Tap a glowing goti to open/move' : 'Tap a glowing goti to move', 'ok');
        }
      } else if (d.botEvents?.length) {
        await animateBotEvents(d.botEvents, d.session, beforeTokens);
        if (d.result) handleGameOver(d);
      } else if (d.result) {
        handleGameOver(d);
      }
    } catch (e) {
      setRolling(false);
      toast(e.message, 'err');
    }
    setBusy(false);
  };

  const entry = cfg?.ludoEntry || 50;
  const winReward = cfg?.ludoWin || 120;
  const canStart = coins >= entry;
  const isPlaying = !!session && session.status !== 'finished';
  const myTurn = isPlaying && session.currentTurn === 0;
  const canRoll = myTurn && session.phase === 'rolling';
  const canMove = myTurn && session.phase === 'moving';

  return (
    <>
      <TopBar title="Ludo Game" backTo="/app/games" />
      <div className="page ludo-page-classic">
        <div className="ludo-header-bar">
          <span className="coin-pill dark sm">Coins: {coins?.toLocaleString()}</span>
          <span className="ludo-entry-tag">Entry: {entry} · Win: {winReward}</span>
        </div>

        <p className="ludo-sub-classic">
          {isPlaying ? session.message : 'Classic Ludo — roll 6 to open, exact finish to win'}
        </p>

        <LudoBoard
          session={session}
          displayTokens={displayTokens}
          rolling={rolling}
          showDice={isPlaying && (rolling || diceValue != null || session?.lastRoll)}
          diceValue={diceValue ?? session?.lastRoll}
          onTokenClick={moveToken}
          selectable={canMove && !busy}
        />

        {gameOver && (
          <div className={`ludo-result-banner ${gameOver.result}`}>
            <span className="msg">
              {gameOver.result === 'win' ? `You won ${gameOver.winAmount} coins!` : 'Better luck next time!'}
            </span>
          </div>
        )}

        {isPlaying && (
          <p className="ludo-turn-hint">
            {canRoll && 'Your turn — roll the dice!'}
            {canMove && `Rolled ${session.lastRoll} — tap glowing ♔ or press button below`}
            {!myTurn && !rolling && !busy && `${PLAYER_NAMES[session.currentTurn]} is playing...`}
            {busy && rolling && 'Rolling dice...'}
            {busy && !rolling && 'Moving goti...'}
          </p>
        )}

        {!isPlaying && !canStart && <div className="game-hint">Need {entry} coins to play</div>}

        {!isPlaying ? (
          <button type="button" className="btn full ludo-roll-btn" disabled={busy || !canStart} onClick={() => startGame(false)}>
            {canStart ? `Start Ludo (${entry} coins)` : `Need ${entry} coins`}
          </button>
        ) : (
          <>
            <button
              type="button"
              className={`btn full ludo-roll-btn ${rolling ? 'rolling' : ''}`}
              disabled={busy || (!canRoll && !canMove)}
              onClick={pickTokenOrRoll}
            >
              {rolling
                ? 'Rolling...'
                : canRoll
                  ? 'Roll Dice'
                  : canMove
                    ? session.lastRoll === 6
                      ? 'Open / Move Goti ♔'
                      : 'Move Goti ♔'
                    : 'Waiting...'}
            </button>
            <button type="button" className="btn ghost full ludo-forfeit-btn" disabled={busy} onClick={forfeitGame}>
              End match & start fresh
            </button>
          </>
        )}
      </div>
    </>
  );
}
