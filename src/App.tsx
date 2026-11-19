import { useEffect, useRef, useState } from 'react';
import { ChestModal } from './components/ChestModal';
import { GameHUD } from './components/GameHUD';
import { LevelUpModal } from './components/LevelUpModal';
import { EndGameModal, PauseModal } from './components/PauseAndEndModals';
import { TitleScreen } from './components/TitleScreen';
import { CONFIG } from './game/config';
import { GameEngine } from './game/engine';
import { HudSnapshot } from './game/types';

const INITIAL_HUD: HudSnapshot = {
  phase: 'TITLE',
  elapsedSeconds: 0,
  targetSeconds: CONFIG.GAME.TARGET_SURVIVAL_SECONDS,
  level: 1,
  exp: 0,
  expToNext: CONFIG.EXP.requirementForLevel(1),
  hp: CONFIG.PLAYER.BASE_MAX_HP,
  maxHp: CONFIG.PLAYER.BASE_MAX_HP,
  kills: 0,
  coins: 0,
  weapons: [],
  passives: [],
  upgradeChoices: [],
  chestReward: null,
  boss: null,
  waveBanner: null,
  muted: false,
  stats: {
    mightBonusPct: 0,
    speedBonusPct: 0,
    cooldownRedPct: 0,
    magnetBonusPct: 0,
  },
};

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const touchOriginRef = useRef<{ id: number; x: number; y: number } | null>(null);

  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [touchStick, setTouchStick] = useState<{
    cx: number;
    cy: number;
    dx: number;
    dy: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const engine = new GameEngine(canvas, (snapshot) => {
      setHud(snapshot);
    });
    engineRef.current = engine;

    const handleResize = () => {
      if (!container) return;
      engine.resize(container.clientWidth, container.clientHeight);
    };
    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    engine.start();

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.code === 'ArrowLeft' ||
        e.code === 'ArrowRight' ||
        e.code === 'Space'
      ) {
        e.preventDefault();
      }

      if (e.repeat) return;

      if (engine.phase === 'TITLE' && (e.code === 'Enter' || e.code === 'Space')) {
        engine.startNewRun();
        return;
      }

      if (engine.phase === 'CHEST' && (e.code === 'Enter' || e.code === 'Space')) {
        engine.closeChestModal();
        return;
      }

      if (engine.phase === 'LEVEL_UP') {
        if (e.code === 'Digit1' || e.code === 'Numpad1') engine.chooseUpgrade(0);
        else if (e.code === 'Digit2' || e.code === 'Numpad2') engine.chooseUpgrade(1);
        else if (e.code === 'Digit3' || e.code === 'Numpad3') engine.chooseUpgrade(2);
        return;
      }

      if (e.code === 'Escape') {
        engine.togglePause();
        return;
      }

      engine.setKey(e.code, true);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      engine.setKey(e.code, false);
    };

    const onBlur = () => {
      engine.clearKeys();
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Touch drag virtual stick for mobile/tablet play
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (hud.phase !== 'PLAYING' || touchOriginRef.current) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    touchOriginRef.current = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
    setTouchStick({ cx: touch.clientX, cy: touch.clientY, dx: 0, dy: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const origin = touchOriginRef.current;
    if (!origin) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === origin.id) {
        const rawDx = t.clientX - origin.x;
        const rawDy = t.clientY - origin.y;
        const maxDist = 44;
        const dist = Math.hypot(rawDx, rawDy);
        const clampedDist = Math.min(maxDist, dist);
        const ang = Math.atan2(rawDy, rawDx);
        const dx = dist > 4 ? (Math.cos(ang) * clampedDist) / maxDist : 0;
        const dy = dist > 4 ? (Math.sin(ang) * clampedDist) / maxDist : 0;
        engineRef.current?.setTouchVector(dx, dy);
        setTouchStick({
          cx: origin.x,
          cy: origin.y,
          dx: Math.cos(ang) * clampedDist,
          dy: Math.sin(ang) * clampedDist,
        });
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const origin = touchOriginRef.current;
    if (!origin) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === origin.id) {
        touchOriginRef.current = null;
        engineRef.current?.setTouchVector(0, 0);
        setTouchStick(null);
        break;
      }
    }
  };

  const base = import.meta.env.BASE_URL;
  const cursorVars = {
    '--msw-cursor-default': `url("${base}assets/msw/cursor_default.png") 2 2, auto`,
    '--msw-cursor-pointer': `url("${base}assets/msw/cursor_pointer.png") 6 2, pointer`,
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      style={cursorVars}
      className="msw-cursor-root relative w-full h-full overflow-hidden bg-[#1b2e1e]"
    >
      <canvas
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="block w-full h-full pixelated touch-none"
      />

      {/* Virtual Touch Joystick Overlay (only visible while dragging on touch devices) */}
      {touchStick && hud.phase === 'PLAYING' && (
        <div
          className="fixed pointer-events-none z-10 w-24 h-24 -ml-12 -mt-12 rounded-full border-2 border-white/40 bg-slate-900/25 flex items-center justify-center"
          style={{ left: touchStick.cx, top: touchStick.cy }}
        >
          <div
            className="w-10 h-10 rounded-full bg-amber-300/80 border-2 border-white"
            style={{
              transform: `translate(${touchStick.dx}px, ${touchStick.dy}px)`,
            }}
          />
        </div>
      )}

      {hud.phase === 'TITLE' && (
        <TitleScreen
          onStart={() => engineRef.current?.startNewRun()}
          muted={hud.muted}
          onToggleMute={() => engineRef.current?.toggleMute()}
        />
      )}

      {hud.phase !== 'TITLE' && (
        <GameHUD
          hud={hud}
          onTogglePause={() => engineRef.current?.togglePause()}
          onToggleMute={() => engineRef.current?.toggleMute()}
        />
      )}

      {hud.phase === 'LEVEL_UP' && (
        <LevelUpModal
          level={hud.level}
          choices={hud.upgradeChoices}
          onSelect={(idx) => engineRef.current?.chooseUpgrade(idx)}
        />
      )}

      {hud.phase === 'CHEST' && hud.chestReward && (
        <ChestModal
          reward={hud.chestReward}
          onClose={() => engineRef.current?.closeChestModal()}
        />
      )}

      {hud.phase === 'PAUSED' && (
        <PauseModal
          hud={hud}
          onResume={() => engineRef.current?.togglePause()}
          onRestart={() => engineRef.current?.startNewRun()}
        />
      )}

      {(hud.phase === 'GAME_OVER' || hud.phase === 'VICTORY') && (
        <EndGameModal
          victory={hud.phase === 'VICTORY'}
          hud={hud}
          onRestart={() => engineRef.current?.startNewRun()}
        />
      )}
    </div>
  );
}
