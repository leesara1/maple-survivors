import React, { useMemo, useState } from 'react';
import {
  AvatarConfig,
  CodySlot,
  DEFAULT_AVATAR,
  catalogFor,
  characterPreviewUrl,
  itemIconUrl,
  loadAvatar,
  saveAvatar,
} from '../game/avatar';

interface CodyModalProps {
  onClose: () => void;
  onApply: (config: AvatarConfig) => Promise<void>;
}

const TABS: { id: CodySlot; label: string }[] = [
  { id: 'face', label: '성형' },
  { id: 'hair', label: '헤어' },
  { id: 'top', label: '상의' },
  { id: 'bottom', label: '하의' },
  { id: 'shoes', label: '신발' },
  { id: 'cape', label: '망토' },
  { id: 'earring', label: '귀걸이' },
];

function slotValue(cfg: AvatarConfig, slot: CodySlot): number {
  return cfg[slot];
}

function withSlot(cfg: AvatarConfig, slot: CodySlot, id: number): AvatarConfig {
  return { ...cfg, [slot]: id, weapon: DEFAULT_AVATAR.weapon };
}

export const CodyModal: React.FC<CodyModalProps> = ({ onClose, onApply }) => {
  const [draft, setDraft] = useState<AvatarConfig>(() => loadAvatar());
  const [tab, setTab] = useState<CodySlot>('face');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const catalog = useMemo(() => catalogFor(tab), [tab]);
  const previewUrl = characterPreviewUrl(draft, 'stand2', 0);
  const selectedId = slotValue(draft, tab);

  const handleApply = async () => {
    setBusy(true);
    setError(null);
    try {
      saveAvatar(draft);
      await onApply(draft);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : '적용 실패');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-2xl border-2 border-sky-200/80 bg-[#0e1b2e] shadow-[0_8px_0_#061018] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-sky-900/80">
          <h2 className="font-display text-xl text-sky-100 tracking-wide">성형 · 코디</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sky-200/80 text-sm px-2 py-1 rounded hover:bg-sky-900/50 cursor-pointer"
          >
            닫기
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4 p-5">
          <div className="flex flex-col items-center gap-3">
            <div className="w-40 h-44 rounded-xl bg-[#132238] border-2 border-sky-800 flex items-end justify-center overflow-hidden">
              <img
                key={previewUrl}
                src={previewUrl}
                alt="미리보기"
                className="pixelated max-h-[168px] object-contain"
              />
            </div>
            <p className="text-[11px] text-sky-300/80 text-center leading-snug">
              냉동참치 장착 · stand2
            </p>
            <button
              type="button"
              onClick={() => setDraft({ ...DEFAULT_AVATAR })}
              className="text-xs text-amber-200/90 underline cursor-pointer"
            >
              기본 코디로 되돌리기
            </button>
          </div>

          <div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                    tab === t.id
                      ? 'bg-sky-400 text-slate-950 border-sky-100'
                      : 'bg-[#132238] text-sky-100 border-sky-800 hover:bg-[#1a2f4a]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {catalog.map((item) => {
                const selected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDraft(withSlot(draft, tab, item.id))}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left cursor-pointer ${
                      selected
                        ? 'border-sky-300 bg-sky-900/50'
                        : 'border-sky-900 bg-[#132238] hover:border-sky-700'
                    }`}
                  >
                    <img
                      src={itemIconUrl(item.id)}
                      alt=""
                      className="w-8 h-8 pixelated object-contain shrink-0 bg-black/20 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.visibility = 'hidden';
                      }}
                    />
                    <span className="text-[11px] text-sky-50 font-medium leading-tight">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <p className="px-5 pb-2 text-xs text-rose-300">{error}</p>
        )}

        <div className="flex justify-end gap-2 px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-sky-800 text-sky-100 text-sm cursor-pointer hover:bg-sky-950"
          >
            취소
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleApply}
            className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#7dd3fc] to-[#0284c7] border border-sky-100 text-slate-950 text-sm font-bold shadow-[0_3px_0_#075985] disabled:opacity-60 cursor-pointer"
          >
            {busy ? '적용 중…' : '적용하기'}
          </button>
        </div>
      </div>
    </div>
  );
};
