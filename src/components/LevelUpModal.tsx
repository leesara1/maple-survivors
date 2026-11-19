import React from 'react';
import { Star } from 'lucide-react';
import { getSpriteBank, getUiIcons } from '../game/sprites';
import { UpgradeChoice } from '../game/types';

interface LevelUpModalProps {
  level: number;
  choices: UpgradeChoice[];
  onSelect: (index: number) => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  level,
  choices,
  onSelect,
}) => {
  const sprites = getSpriteBank();
  const uiIcons = getUiIcons();

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/65 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-[#181b22]/96 border-2 border-amber-300/80 p-5 sm:p-6 shadow-[0_12px_0_rgba(10,12,18,0.85)] animate-pop-in">
        <div className="text-center mb-5">
          <img
            key={level}
            src={uiIcons.levelStar}
            alt=""
            className="w-28 h-24 mx-auto -mt-5 -mb-2 pixelated object-contain pointer-events-none"
          />
          <div className="font-display text-3xl sm:text-4xl text-amber-300 drop-shadow-[0_2px_0_#0f1218]">
            LEVEL UP! · LV.{level}
          </div>
          <p className="mt-1 text-sm text-slate-300">
            강화할 장비나 패시브를 선택하세요 (숫자 키 1 / 2 / 3)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {choices.map((choice, idx) => (
            <button
              key={`${choice.kind}-${choice.id}`}
              type="button"
              onClick={() => onSelect(idx)}
              className="group flex flex-col text-left rounded-xl bg-[#252831] hover:bg-[#2f333f] border-2 border-slate-400/75 hover:border-amber-300 p-4 transition-all hover:-translate-y-1 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.9),0_6px_0_rgba(10,12,18,0.75)] cursor-pointer"
            >
              {/* Top: Starforce-style Star Row + Keybind */}
              <div className="w-full flex items-center justify-between gap-2 mb-1.5">
                <div
                  className="flex items-center gap-0.5"
                  aria-label={`레벨 ${choice.nextLevel} / ${choice.maxLevel}`}
                >
                  {Array.from({ length: choice.maxLevel }).map((_, sIdx) => {
                    const isFilled = sIdx < choice.currentLevel;
                    const isNext = sIdx === choice.currentLevel;
                    return (
                      <Star
                        key={sIdx}
                        className={`w-3.5 h-3.5 ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400'
                            : isNext
                              ? 'text-emerald-300 fill-emerald-300'
                              : 'text-slate-600 fill-slate-700/60'
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="text-[11px] font-mono-num font-bold text-slate-400">
                  [{idx + 1}]
                </span>
              </div>

              {/* Centered Item Title */}
              <h3 className="w-full text-center font-display text-2xl text-white tracking-wide pb-2.5 border-b border-dashed border-slate-500/60">
                {choice.name}
              </h3>

              {/* Middle Row: Metallic Icon Frame + Stat Info */}
              <div className="mt-3 flex items-center gap-3">
                <div className="shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-slate-200/35 via-slate-500/45 to-slate-900/95 border-2 border-slate-300/75 flex items-center justify-center shadow-inner">
                  <img
                    src={sprites.icons[choice.id]}
                    alt={choice.name}
                    className="w-11 h-11 pixelated object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1 text-xs space-y-1">
                  <div className="font-bold text-amber-300 font-mono-num">
                    {choice.isNew
                      ? '신규 획득 (Lv.1)'
                      : `Lv.${choice.currentLevel} → Lv.${choice.nextLevel}`}
                  </div>
                  <div className="text-slate-300">
                    분류 : {choice.kind === 'weapon' ? '무기' : '패시브'}
                  </div>
                  <div className="text-emerald-300 font-bold leading-snug">
                    {choice.effectDiff}
                  </div>
                </div>
              </div>

              {/* Bottom Tooltip Description & Evolution Synergy */}
              <div className="mt-3 pt-2.5 border-t border-dashed border-slate-500/60 flex-1 flex flex-col justify-between gap-2">
                <p className="text-xs text-slate-200 leading-relaxed">
                  {choice.description}
                </p>
                {choice.synergyHint && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                    <img src={uiIcons.bulb} alt="" className="w-4 h-4 pixelated object-contain shrink-0" />
                    <span>{choice.synergyHint}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
