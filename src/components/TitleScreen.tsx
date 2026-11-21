import React, { useState } from 'react';
import { BookOpen, Shirt, Volume2, VolumeX } from 'lucide-react';
import { getUiIcons } from '../game/sprites';
import { characterPreviewUrl, loadAvatar } from '../game/avatar';
import { CodyModal } from './CodyModal';
import { AbilitiesModal } from './AbilitiesModal';
import type { AvatarConfig } from '../game/avatar';

interface TitleScreenProps {
  onStart: () => void;
  muted: boolean;
  onToggleMute: () => void;
  onApplyAvatar: (config: AvatarConfig) => Promise<void>;
  previewVersion: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  muted,
  onToggleMute,
  onApplyAvatar,
  previewVersion,
}) => {
  const uiIcons = getUiIcons();
  const [codyOpen, setCodyOpen] = useState(false);
  const [abilitiesOpen, setAbilitiesOpen] = useState(false);
  const previewSrc = characterPreviewUrl(loadAvatar(), 'stand2', 0);

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-between overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0e1b2e]/80 via-[#0e1b2e]/30 to-transparent" />

      <div className="relative z-10 w-full flex justify-end gap-2 p-5">
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? '소리 켜기' : '소리 끄기'}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#132238]/90 border-2 border-sky-200/75 text-sky-100 text-xs font-bold shadow-[0_3px_0_#09111e] hover:bg-[#1d3454] transition-colors cursor-pointer"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{muted ? '음소거' : '효과음 ON'}</span>
        </button>
      </div>

      <div className="relative z-10 flex-1 flex items-center px-6 sm:px-14">
        <div className="max-w-lg animate-pop-in">
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-100/40 via-sky-900/80 to-slate-950/95 border-2 border-sky-200 shadow-[0_4px_0_#0b1322] flex items-center justify-center">
              <img
                src={uiIcons.frozenTuna}
                alt="냉동참치"
                className="w-12 h-12 pixelated object-contain"
              />
            </div>
            <img
              key={previewVersion}
              src={previewSrc}
              alt=""
              className="h-16 pixelated object-contain drop-shadow-[0_3px_0_#0b1322] animate-float-slow"
            />
          </div>

          <h1 className="font-display text-5xl sm:text-6xl tracking-tight text-white drop-shadow-[0_4px_0_#0b1322]">
            <span className="text-sky-300">냉동참치</span> 서바이버
          </h1>

          <p className="mt-3 text-sm sm:text-base text-white font-medium leading-relaxed max-w-md drop-shadow-[0_2px_0_rgba(11,19,34,0.95)]">
            꼬리를 꽉 잡은 냉동참치를 휘둘러 몰려오는 메이플 몬스터를 쓸어버리고 20분 생존에 도전하세요!
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStart}
              className="px-10 py-3.5 rounded-xl bg-gradient-to-b from-[#7dd3fc] to-[#0284c7] border-2 border-[#e0f2fe] text-slate-950 font-display text-2xl tracking-wide shadow-[0_5px_0_#075985] hover:brightness-110 active:translate-y-0.5 active:shadow-[0_2px_0_#075985] transition-all cursor-pointer"
            >
              모험 시작하기
            </button>
            <button
              type="button"
              onClick={() => setCodyOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1a2f4a] border-2 border-amber-200/70 text-amber-50 font-bold text-sm shadow-[0_4px_0_#0b1322] hover:brightness-110 cursor-pointer"
            >
              <Shirt className="w-4 h-4" />
              코디하기
            </button>
            <button
              type="button"
              onClick={() => setAbilitiesOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1a2f4a] border-2 border-sky-200/70 text-sky-50 font-bold text-sm shadow-[0_4px_0_#0b1322] hover:brightness-110 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              능력 확인
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 sm:px-14 pb-5">
        <p className="inline-block px-3 py-1 rounded-lg bg-[#0e1b2e]/75 text-xs sm:text-sm text-sky-100 font-medium">
          WASD / 방향키 이동 · 자동 공격 · 1 / 2 / 3 카드 선택 · ESC 일시정지
        </p>
      </div>

      {codyOpen && (
        <CodyModal onClose={() => setCodyOpen(false)} onApply={onApplyAvatar} />
      )}
      {abilitiesOpen && <AbilitiesModal onClose={() => setAbilitiesOpen(false)} />}
    </div>
  );
};
