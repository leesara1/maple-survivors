import React from 'react';
import { getSpriteBank, getUiIcons } from '../game/sprites';
import { ChestReward } from '../game/types';

interface ChestModalProps {
  reward: ChestReward;
  onClose: () => void;
}

export const ChestModal: React.FC<ChestModalProps> = ({ reward, onClose }) => {
  const sprites = getSpriteBank();
  const uiIcons = getUiIcons();
  const isEvolution = reward.type === 'evolution';

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/65 p-4">
      <div
        className={`w-full max-w-md rounded-2xl p-6 text-center shadow-[0_12px_0_rgba(15,23,42,0.75)] animate-pop-in border-2 ${
          isEvolution
            ? 'bg-gradient-to-b from-[#2e1b4b]/95 to-[#162033]/95 border-amber-300'
            : 'bg-[#162033]/95 border-amber-300/80'
        }`}
      >
        <div className="font-display text-sm tracking-wide text-amber-300">
          {isEvolution ? '무기 진화 성공!' : '보물상자 발견!'}
        </div>

        <h2 className="mt-1 font-display text-3xl text-white drop-shadow-[0_2px_0_#1e182a]">
          {reward.title}
        </h2>

        {reward.itemId && (
          <div className="mx-auto mt-4 w-20 h-20 rounded-2xl bg-[#111929] border-2 border-amber-300 flex items-center justify-center animate-float-slow">
            <img
              src={sprites.icons[reward.itemId]}
              alt={reward.title}
              className="w-14 h-14 pixelated"
            />
          </div>
        )}

        <p className="mt-4 text-sm text-slate-200 leading-relaxed">
          {reward.subtitle}
        </p>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs font-bold font-mono-num text-amber-200">
          <span className="inline-flex items-center gap-1.5">
            <img src={uiIcons.coinPouch} alt="" className="w-5 h-5 pixelated object-contain" />
            +{reward.coinsGained} 코인
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-300">+{reward.healGained} HP 회복</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-b from-[#fde047] to-[#eab308] text-slate-950 font-display text-xl border-2 border-amber-100 shadow-[0_4px_0_#854d0e] hover:brightness-105 cursor-pointer"
        >
          확인 (Space / Enter)
        </button>
      </div>
    </div>
  );
};
