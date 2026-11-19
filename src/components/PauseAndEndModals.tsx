import React from 'react';
import { getSpriteBank } from '../game/sprites';
import { HudSnapshot } from '../game/types';

interface PauseModalProps {
  hud: HudSnapshot;
  onResume: () => void;
  onRestart: () => void;
}

function formatTime(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  hud,
  onResume,
  onRestart,
}) => {
  const sprites = getSpriteBank();

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/65 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#162033]/95 border-2 border-amber-300/80 p-6 shadow-[0_12px_0_rgba(15,23,42,0.75)] animate-pop-in text-white">
        <h2 className="font-display text-3xl text-center text-amber-300">일시정지</h2>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs sm:text-sm font-mono-num text-slate-200">
          <span>생존 {formatTime(hud.elapsedSeconds)}</span>
          <span aria-hidden="true">·</span>
          <span>레벨 {hud.level}</span>
          <span aria-hidden="true">·</span>
          <span>처치 {hud.kills.toLocaleString()}</span>
          <span aria-hidden="true">·</span>
          <span>코인 {hud.coins.toLocaleString()}</span>
        </div>

        {/* Stat Summary */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-[#111929] rounded-xl p-3 border border-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-400">공격력 보너스</span>
            <span className="font-mono-num font-bold text-orange-300">+{hud.stats.mightBonusPct}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">이동 속도</span>
            <span className="font-mono-num font-bold text-emerald-300">+{hud.stats.speedBonusPct}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">쿨다운 감소</span>
            <span className="font-mono-num font-bold text-sky-300">-{hud.stats.cooldownRedPct}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">획득 범위</span>
            <span className="font-mono-num font-bold text-purple-300">+{hud.stats.magnetBonusPct}%</span>
          </div>
        </div>

        {/* Weapons Damage Breakdown */}
        <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {hud.weapons.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#1f2c44] text-xs"
            >
              <div className="flex items-center gap-2">
                <img src={sprites.icons[w.id]} alt="" className="w-5 h-5 pixelated" />
                <span className="font-bold text-white">{w.name}</span>
                <span className="text-amber-300 font-mono-num">
                  {w.evolved ? '진화' : `Lv.${w.level}`}
                </span>
              </div>
              <span className="font-mono-num text-slate-300">
                누적 피해 {w.totalDamage.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onResume}
            className="flex-1 py-3 rounded-xl bg-gradient-to-b from-[#4ade80] to-[#16a34a] text-slate-950 font-display text-xl border-2 border-emerald-200 shadow-[0_4px_0_#14532d] hover:brightness-105 cursor-pointer"
          >
            계속하기
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="px-5 py-3 rounded-xl bg-[#273652] hover:bg-[#324568] text-slate-100 font-display text-lg border border-slate-500 cursor-pointer"
          >
            다시하기
          </button>
        </div>
      </div>
    </div>
  );
};

interface EndGameModalProps {
  victory: boolean;
  hud: HudSnapshot;
  onRestart: () => void;
}

export const EndGameModal: React.FC<EndGameModalProps> = ({
  victory,
  hud,
  onRestart,
}) => {
  const sprites = getSpriteBank();

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/72 p-4">
      <div
        className={`w-full max-w-lg rounded-2xl bg-[#162033]/96 border-2 p-6 text-center shadow-[0_12px_0_rgba(15,23,42,0.8)] animate-pop-in text-white ${
          victory ? 'border-amber-300' : 'border-rose-400'
        }`}
      >
        <div className="text-xs font-bold tracking-wide text-slate-300">
          {victory ? '20분 생존 및 최종 보스 격파!' : '모험이 종료되었습니다'}
        </div>
        <h2
          className={`mt-1 font-display text-4xl drop-shadow-[0_3px_0_#1e182a] ${
            victory ? 'text-amber-300' : 'text-rose-400'
          }`}
        >
          {victory ? '전설의 냉동참치 용사! (CLEAR)' : '게임 오버'}
        </h2>

        {/* Key Run Results */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-xl bg-[#111929] border border-slate-700 p-3">
            <div className="text-[11px] text-slate-400">생존 시간</div>
            <div className="mt-1 font-mono-num text-lg font-extrabold text-amber-300">
              {formatTime(hud.elapsedSeconds)}
            </div>
          </div>
          <div className="rounded-xl bg-[#111929] border border-slate-700 p-3">
            <div className="text-[11px] text-slate-400">도달 레벨</div>
            <div className="mt-1 font-mono-num text-lg font-extrabold text-sky-300">
              LV.{hud.level}
            </div>
          </div>
          <div className="rounded-xl bg-[#111929] border border-slate-700 p-3">
            <div className="text-[11px] text-slate-400">처치 수</div>
            <div className="mt-1 font-mono-num text-lg font-extrabold text-emerald-300">
              {hud.kills.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl bg-[#111929] border border-slate-700 p-3">
            <div className="text-[11px] text-slate-400">획득 코인</div>
            <div className="mt-1 font-mono-num text-lg font-extrabold text-amber-200">
              {hud.coins.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Weapons Breakdown */}
        <div className="mt-4 space-y-1.5 max-h-44 overflow-y-auto text-left pr-1">
          {hud.weapons.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#1f2c44] text-xs"
            >
              <div className="flex items-center gap-2">
                <img src={sprites.icons[w.id]} alt="" className="w-5 h-5 pixelated" />
                <span className="font-bold text-white">{w.name}</span>
                <span className="text-amber-300 font-mono-num">
                  {w.evolved ? '★진화' : `Lv.${w.level}`}
                </span>
              </div>
              <span className="font-mono-num text-slate-300">
                피해 {w.totalDamage.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-b from-[#4ade80] to-[#16a34a] text-slate-950 font-display text-2xl border-2 border-emerald-100 shadow-[0_5px_0_#14532d] hover:brightness-105 cursor-pointer"
        >
          다시하기
        </button>
      </div>
    </div>
  );
};
