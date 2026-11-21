import React from 'react';
import { CONFIG } from '../game/config';
import { getSpriteBank } from '../game/sprites';
import type { PassiveId, WeaponId } from '../game/types';

interface AbilitiesModalProps {
  onClose: () => void;
}

const WEAPON_IDS = Object.keys(CONFIG.WEAPONS) as WeaponId[];
const PASSIVE_IDS = Object.keys(CONFIG.PASSIVES) as PassiveId[];

export const AbilitiesModal: React.FC<AbilitiesModalProps> = ({ onClose }) => {
  const sprites = getSpriteBank();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-sky-200/80 bg-[#0e1b2e] shadow-[0_8px_0_#061018]">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-sky-900/80 bg-[#0e1b2e]/95">
          <h2 className="font-display text-xl text-sky-100 tracking-wide">능력 카드</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sky-200/80 text-sm px-2 py-1 rounded hover:bg-sky-900/50 cursor-pointer"
          >
            닫기
          </button>
        </div>

        <div className="p-5 space-y-6">
          <section>
            <h3 className="font-display text-lg text-amber-200 mb-3">무기</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WEAPON_IDS.map((id) => {
                const def = CONFIG.WEAPONS[id];
                const passiveName = CONFIG.PASSIVES[def.pairedPassive].name;
                return (
                  <div
                    key={id}
                    className="rounded-xl bg-[#132238] border-2 border-slate-500/50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="shrink-0 w-14 h-14 rounded-lg border-2 flex items-center justify-center"
                        style={{
                          borderColor: def.accentColor,
                          background: `linear-gradient(160deg, ${def.accentColor}33, #0b1322)`,
                        }}
                      >
                        <img
                          src={sprites.icons[id]}
                          alt=""
                          className="w-9 h-9 pixelated object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-xl text-white tracking-wide">
                          {def.name}
                        </h4>
                        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                          {def.description}
                        </p>
                        <p className="mt-2 text-[11px] text-amber-300/90">
                          진화 · {def.evolvedName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-sky-300/80">
                          시너지 패시브: {passiveName}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="font-display text-lg text-emerald-200 mb-3">패시브</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PASSIVE_IDS.map((id) => {
                const def = CONFIG.PASSIVES[id];
                return (
                  <div
                    key={id}
                    className="rounded-xl bg-[#132238] border-2 border-slate-500/50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="shrink-0 w-14 h-14 rounded-lg border-2 flex items-center justify-center"
                        style={{
                          borderColor: def.accentColor,
                          background: `linear-gradient(160deg, ${def.accentColor}33, #0b1322)`,
                        }}
                      >
                        <img
                          src={sprites.icons[id]}
                          alt=""
                          className="w-9 h-9 pixelated object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-xl text-white tracking-wide">
                          {def.name}
                        </h4>
                        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                          {def.description}
                        </p>
                        <p className="mt-2 text-[11px] text-emerald-300/90">
                          {def.statLabel} · 최대 Lv.{def.maxLevel} ({def.formatValue(def.maxLevel)})
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
