import React from 'react';
import { Pause, Volume2, VolumeX } from 'lucide-react';
import { getSpriteBank } from '../game/sprites';
import { HudSnapshot } from '../game/types';

interface GameHUDProps {
  hud: HudSnapshot;
  onTogglePause: () => void;
  onToggleMute: () => void;
}

function formatTime(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  onTogglePause,
  onToggleMute,
}) => {
  const sprites = getSpriteBank();
  const hpPct = Math.max(0, Math.min(100, (hud.hp / Math.max(1, hud.maxHp)) * 100));
  const expPct = Math.max(0, Math.min(100, (hud.exp / Math.max(1, hud.expToNext)) * 100));

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 sm:p-4">
      {/* Top Row: Left Gear Slots | Center Timer & Stats | Right Controls */}
      <div className="flex items-start justify-between gap-3">
        {/* Top-Left: Owned Weapons (6) & Passives (5) */}
        <div className="flex flex-col gap-1.5">
          {/* Weapons Row */}
          <div className="flex items-center gap-1.5 bg-[#162033]/78 border-2 border-[#fde047]/45 rounded-xl px-2 py-1.5">
            {Array.from({ length: 6 }).map((_, idx) => {
              const w = hud.weapons[idx];
              return (
                <div
                  key={idx}
                  className={`relative w-9 h-9 rounded-lg flex items-center justify-center border ${
                    w
                      ? w.evolved
                        ? 'bg-amber-950/80 border-amber-300'
                        : 'bg-[#24324c] border-sky-300/45'
                      : 'bg-slate-900/50 border-slate-700/60'
                  }`}
                >
                  {w && (
                    <>
                      <img
                        src={sprites.icons[w.id]}
                        alt={w.name}
                        className="w-6 h-6 pixelated"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 px-1 rounded text-[10px] font-mono-num font-bold leading-tight border border-slate-950 ${
                          w.evolved
                            ? 'bg-amber-300 text-slate-950'
                            : 'bg-slate-900 text-amber-200'
                        }`}
                      >
                        {w.evolved ? '★' : w.level}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Passives Row */}
          <div className="flex items-center gap-1.5 bg-[#162033]/78 border-2 border-sky-200/30 rounded-xl px-2 py-1 w-fit">
            {Array.from({ length: 5 }).map((_, idx) => {
              const p = hud.passives[idx];
              return (
                <div
                  key={idx}
                  className={`relative w-8 h-8 rounded-lg flex items-center justify-center border ${
                    p
                      ? 'bg-[#24324c] border-emerald-300/45'
                      : 'bg-slate-900/50 border-slate-700/60'
                  }`}
                >
                  {p && (
                    <>
                      <img
                        src={sprites.icons[p.id]}
                        alt={p.name}
                        className="w-5 h-5 pixelated"
                      />
                      <span className="absolute -bottom-1 -right-1 px-1 rounded bg-slate-900 text-emerald-300 text-[9px] font-mono-num font-bold leading-tight border border-slate-950">
                        {p.level}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Top-Center: Survival Timer, Kills, Coins + Active Boss Bar */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4 px-5 py-2 rounded-xl bg-[#162033]/82 border-2 border-[#fde047]/55 text-white shadow-[0_4px_0_rgba(15,23,42,0.45)]">
            <span className="font-mono-num text-xl sm:text-2xl font-extrabold tracking-tight text-amber-300">
              {formatTime(hud.elapsedSeconds)}
            </span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="text-xs sm:text-sm font-bold text-slate-100 font-mono-num">
              처치 {hud.kills.toLocaleString()}
            </span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="text-xs sm:text-sm font-bold text-amber-200 font-mono-num">
              코인 {hud.coins.toLocaleString()}
            </span>
          </div>

          {/* Boss HP Bar */}
          {hud.boss && (
            <div className="w-72 sm:w-96 px-3.5 py-2 rounded-xl bg-[#2a121e]/88 border-2 border-rose-400/75 shadow-[0_4px_0_rgba(15,23,42,0.5)]">
              <div className="flex items-center justify-between text-xs font-bold text-rose-100 mb-1">
                <span>{hud.boss.isFinal ? '최종 보스 · ' : '보스 · '}{hud.boss.name}</span>
                <span className="font-mono-num">
                  {hud.boss.hp.toLocaleString()} / {hud.boss.maxHp.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950/85 overflow-hidden border border-rose-950">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-amber-400 transition-all duration-100"
                  style={{ width: `${Math.max(0, Math.min(100, (hud.boss.hp / hud.boss.maxHp) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* Wave Announcement Banner */}
          {hud.waveBanner && (
            <div className="px-4 py-1.5 rounded-xl bg-[#162033]/85 border border-amber-300/60 text-amber-200 text-xs sm:text-sm font-bold animate-pop-in">
              {hud.waveBanner}
            </div>
          )}
        </div>

        {/* Top-Right: Mute & Pause Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={hud.muted ? '소리 켜기' : '소리 끄기'}
            className="w-10 h-10 rounded-xl bg-[#162033]/82 border-2 border-amber-200/45 text-amber-100 flex items-center justify-center hover:bg-[#23324d] transition-colors cursor-pointer"
          >
            {hud.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onTogglePause}
            aria-label="일시정지"
            className="w-10 h-10 rounded-xl bg-[#162033]/82 border-2 border-amber-200/45 text-amber-100 flex items-center justify-center hover:bg-[#23324d] transition-colors cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Status Bar: Level + HP Gauge + EXP Gauge */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#162033]/84 border-2 border-[#fde047]/55 shadow-[0_5px_0_rgba(15,23,42,0.5)]">
          {/* Level Box */}
          <div className="shrink-0 px-3 py-1 rounded-lg bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 font-display text-lg leading-none border border-amber-100">
            LV.{hud.level}
          </div>

          {/* HP + EXP Stacked Gauges */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            {/* HP Bar */}
            <div className="relative h-4 rounded-md bg-slate-950/90 border border-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-emerald-400 transition-all duration-100"
                style={{ width: `${hpPct}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-2 text-[11px] font-mono-num font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                <span>HP</span>
                <span>
                  {hud.hp} / {hud.maxHp}
                </span>
              </div>
            </div>

            {/* EXP Bar */}
            <div className="relative h-3 rounded-md bg-slate-950/90 border border-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-100"
                style={{ width: `${expPct}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-mono-num font-bold text-sky-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                <span>EXP</span>
                <span>
                  {hud.exp} / {hud.expToNext}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
