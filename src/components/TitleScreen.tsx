import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { getSpriteBank, UPLOADED_FISH_PATH } from '../game/sprites';

interface TitleScreenProps {
  onStart: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

const TITLE_KEYART_URL = '/src/assets/images/title_tuna_keyart_1795065629657.jpg';

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  muted,
  onToggleMute,
}) => {
  const sprites = getSpriteBank();
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-between overflow-hidden">
      {/* Full-viewport Pixel Key-Art Backdrop with Zero-Broken-Image fallback */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1b3a4b] via-[#2c6e49] to-[#132238]">
        {!imgFailed && (
          <img
            src={TITLE_KEYART_URL}
            alt="냉동참치를 든 소년과 숲속 몬스터"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover object-center pixelated"
          />
        )}
        {/* Measured scrim keeping the right-side hero & frozen tuna unobstructed */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d192b]/92 via-[#0d192b]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d192b]/70 via-transparent to-[#0d192b]/35" />
      </div>

      {/* Top Bar: Sound Toggle only */}
      <div className="relative z-10 w-full flex justify-end p-5">
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? '소리 켜기' : '소리 끄기'}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#132238]/88 border-2 border-sky-300/60 text-sky-100 text-xs font-bold hover:bg-[#1d3454] transition-colors cursor-pointer"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{muted ? '음소거' : '효과음 ON'}</span>
        </button>
      </div>

      {/* Left-Aligned Title Lockup over calm negative space */}
      <div className="relative z-10 flex-1 flex items-center px-6 sm:px-14">
        <div className="max-w-lg animate-pop-in">
          {/* Bespoke inline SVG Frost Crest + Frozen Tuna Item Slot */}
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-200/35 via-sky-900/75 to-slate-950/90 border-2 border-sky-200/80 shadow-[0_4px_0_rgba(15,23,42,0.7)] flex items-center justify-center">
              <img
                src={UPLOADED_FISH_PATH}
                alt="냉동참치"
                className="w-12 h-12 pixelated object-contain"
              />
            </div>
            <svg
              width="42"
              height="42"
              viewBox="0 0 42 42"
              fill="none"
              aria-hidden="true"
              className="animate-float-slow"
            >
              <path
                d="M21 3V39M3 21H39M8.5 8.5L33.5 33.5M33.5 8.5L8.5 33.5"
                stroke="#bae6fd"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <circle cx="21" cy="21" r="5" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.2" />
            </svg>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl tracking-tight text-white drop-shadow-[0_4px_0_#0b1322]">
            <span className="text-sky-300">냉동참치</span> 서바이버
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-100/95 leading-relaxed max-w-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            얼어붙은 전설의 폴암 냉동참치를 휘둘러 몰려오는 숲속 몬스터를 쓸어버리고 20분 생존에 도전하세요!
          </p>

          {/* Weapon Icon Strip */}
          <div className="mt-5 flex items-center gap-2.5">
            {(['greatsword', 'shuriken', 'orb', 'arrow', 'shield', 'holy'] as const).map((wid) => (
              <div
                key={wid}
                className={`w-11 h-11 rounded-lg flex items-center justify-center border-2 ${
                  wid === 'greatsword'
                    ? 'bg-gradient-to-br from-sky-200/35 to-sky-950/90 border-sky-300'
                    : 'bg-[#1a2230]/85 border-slate-400/50'
                }`}
              >
                <img
                  src={sprites.icons[wid]}
                  alt=""
                  className="w-7 h-7 pixelated object-contain"
                />
              </div>
            ))}
          </div>

          <div className="mt-7">
            <button
              type="button"
              onClick={onStart}
              className="px-10 py-3.5 rounded-xl bg-gradient-to-b from-[#7dd3fc] to-[#0284c7] border-2 border-[#e0f2fe] text-slate-950 font-display text-2xl tracking-wide shadow-[0_5px_0_#075985] hover:brightness-110 active:translate-y-0.5 active:shadow-[0_2px_0_#075985] transition-all cursor-pointer"
            >
              모험 시작하기
            </button>
          </div>
        </div>
      </div>

      {/* Bottom single flat control-hint line */}
      <div className="relative z-10 px-6 sm:px-14 pb-5">
        <p className="text-xs sm:text-sm text-slate-200/90 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          WASD / 방향키 이동 · 자동 공격 · 1 / 2 / 3 카드 선택 · ESC 일시정지
        </p>
      </div>
    </div>
  );
};
