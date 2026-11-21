/** MapleStory avatar / cody config + live frame fetch via maplestory.io */

export interface AvatarConfig {
  skin: number;
  face: number;
  hair: number;
  top: number;
  bottom: number;
  shoes: number;
  cape: number;
  earring: number;
  /** Frozen Tuna polearm — fixed. */
  weapon: number;
}

export interface CatalogItem {
  id: number;
  name: string;
}

export type CodySlot = 'face' | 'hair' | 'top' | 'bottom' | 'shoes' | 'cape' | 'earring';

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: 2000,
  face: 20003, // 남자얼굴4 / Dramatic Face
  hair: 30330, // 바닐라보이헤어 / Cabana Boy
  top: 1040014, // 주황색 스포츠 티셔츠(남)
  bottom: 1062015, // 찢어진 청바지 / Ripped Jeans
  shoes: 1072153, // 투명 신발
  cape: 1102039, // 투명 망토
  earring: 1032036, // 십자 비즈 귀걸이
  weapon: 1442039, // 냉동참치
};

const STORAGE_KEY = 'maple-survivors-avatar';
const API = 'https://maplestory.io/api/gms/250';

export const FACE_CATALOG: CatalogItem[] = [
  { id: 20000, name: '남자얼굴1' },
  { id: 20001, name: '남자얼굴2' },
  { id: 20002, name: '남자얼굴3' },
  { id: 20003, name: '남자얼굴4' },
  { id: 20004, name: '남자얼굴5' },
  { id: 20005, name: '남자얼굴6' },
];

export const HAIR_CATALOG: CatalogItem[] = [
  { id: 30330, name: '바닐라보이 헤어' },
  { id: 30030, name: '토벤 머리' },
  { id: 30000, name: '검은 짧은 머리' },
  { id: 30120, name: '올백 머리' },
  { id: 30200, name: '더벅머리' },
  { id: 30400, name: '대머리' },
];

export const TOP_CATALOG: CatalogItem[] = [
  { id: 1040014, name: '주황색 스포츠 티셔츠' },
  { id: 1040002, name: '흰색 속옷' },
  { id: 1040010, name: '초록색 티셔츠' },
  { id: 1040021, name: '파란 줄무늬 티' },
  { id: 1040036, name: '남색 정장 셔츠' },
];

export const BOTTOM_CATALOG: CatalogItem[] = [
  { id: 1062015, name: '찢어진 청바지' },
  { id: 1060002, name: '청 반바지' },
  { id: 1060026, name: '검은 바지' },
  { id: 1060016, name: '갈색 바지' },
];

export const SHOES_CATALOG: CatalogItem[] = [
  { id: 1072153, name: '투명 신발' },
  { id: 1072001, name: '빨간 고무신' },
  { id: 1072005, name: '파란 슬리퍼' },
  { id: 1072032, name: '갈색 가죽 신발' },
];

export const CAPE_CATALOG: CatalogItem[] = [
  { id: 1102039, name: '투명 망토' },
  { id: 1102000, name: '초록 망토' },
  { id: 1102001, name: '파란 망토' },
  { id: 1102002, name: '빨간 망토' },
];

export const EARRING_CATALOG: CatalogItem[] = [
  { id: 1032036, name: '십자 비즈 귀걸이' },
  { id: 1032000, name: '기본 귀걸이' },
  { id: 1032019, name: '크리스탈 귀걸이' },
  { id: 1032021, name: '에메랄드 귀걸이' },
];

export function catalogFor(slot: CodySlot): CatalogItem[] {
  switch (slot) {
    case 'face':
      return FACE_CATALOG;
    case 'hair':
      return HAIR_CATALOG;
    case 'top':
      return TOP_CATALOG;
    case 'bottom':
      return BOTTOM_CATALOG;
    case 'shoes':
      return SHOES_CATALOG;
    case 'cape':
      return CAPE_CATALOG;
    case 'earring':
      return EARRING_CATALOG;
  }
}

/** Invalid / missing bottoms that maplestory.io silently skips. */
const LEGACY_BOTTOM_IDS = new Set([1067047]);

export function loadAvatar(): AvatarConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AVATAR };
    const parsed = JSON.parse(raw) as Partial<AvatarConfig>;
    const merged: AvatarConfig = {
      ...DEFAULT_AVATAR,
      ...parsed,
      weapon: DEFAULT_AVATAR.weapon,
    };
    if (LEGACY_BOTTOM_IDS.has(merged.bottom)) {
      merged.bottom = DEFAULT_AVATAR.bottom;
    }
    return merged;
  } catch {
    return { ...DEFAULT_AVATAR };
  }
}

export function saveAvatar(config: AvatarConfig): void {
  const toSave = { ...config, weapon: DEFAULT_AVATAR.weapon };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

export function toItemList(config: AvatarConfig): string {
  return [
    config.skin,
    config.face,
    config.hair,
    config.top,
    config.bottom,
    config.shoes,
    config.cape,
    config.earring,
    config.weapon,
  ].join(',');
}

export function characterPreviewUrl(config: AvatarConfig, anim = 'stand2', frame = 0): string {
  const items = toItemList(config);
  return `${API}/character/center/${config.skin}/${items}/${anim}/${frame}`;
}

export function itemIconUrl(itemId: number): string {
  return `${API}/item/${itemId}/icon`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);
  return c;
}

function flipCanvasH(src: HTMLCanvasElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.translate(c.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(src, 0, 0);
  return c;
}

function makeWhiteMask(src: HTMLCanvasElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

async function fetchFrame(
  config: AvatarConfig,
  anim: string,
  frame: number
): Promise<HTMLCanvasElement | null> {
  try {
    const img = await loadImage(characterPreviewUrl(config, anim, frame));
    return flipCanvasH(imageToCanvas(img));
  } catch {
    return null;
  }
}

async function fetchAnimFrames(
  config: AvatarConfig,
  anim: string,
  count: number
): Promise<HTMLCanvasElement[]> {
  const frames: HTMLCanvasElement[] = [];
  for (let i = 0; i < count; i++) {
    const f = await fetchFrame(config, anim, i);
    if (f) frames.push(f);
  }
  return frames;
}

export interface FetchedHeroSheet {
  idle: HTMLCanvasElement;
  idleFlash: HTMLCanvasElement;
  idleFrames: HTMLCanvasElement[];
  idleFlashFrames: HTMLCanvasElement[];
  walk: HTMLCanvasElement[];
  walkFlash: HTMLCanvasElement[];
  swing: HTMLCanvasElement;
  swingFlash: HTMLCanvasElement;
  swingFrames: HTMLCanvasElement[];
  swingFlashFrames: HTMLCanvasElement[];
  baseHeight: number;
  tuna: HTMLCanvasElement;
  tunaFlash: HTMLCanvasElement;
  tunaGrip: { x: number; y: number };
  handIdle: { x: number; y: number };
  handSwing: { x: number; y: number };
}

/** Fetch official MapleStory paper-doll frames (polearm stand2 / walk1 / swingPF). */
export async function fetchHeroSheet(config: AvatarConfig): Promise<FetchedHeroSheet> {
  const [idleFrames, walk, swingFrames, tunaImg] = await Promise.all([
    fetchAnimFrames(config, 'stand2', 3),
    fetchAnimFrames(config, 'walk1', 4),
    fetchAnimFrames(config, 'swingPF', 4),
    loadImage(itemIconUrl(config.weapon))
      .then(imageToCanvas)
      .catch(() => {
        const c = document.createElement('canvas');
        c.width = 32;
        c.height = 32;
        return c;
      }),
  ]);

  if (idleFrames.length === 0 || walk.length === 0 || swingFrames.length === 0) {
    throw new Error('캐릭터 스프라이트를 불러오지 못했습니다');
  }

  const idle = idleFrames[0];
  const swing = swingFrames[Math.min(1, swingFrames.length - 1)];

  return {
    idle,
    idleFlash: makeWhiteMask(idle),
    idleFrames,
    idleFlashFrames: idleFrames.map(makeWhiteMask),
    walk,
    walkFlash: walk.map(makeWhiteMask),
    swing,
    swingFlash: makeWhiteMask(swing),
    swingFrames,
    swingFlashFrames: swingFrames.map(makeWhiteMask),
    baseHeight: idle.height,
    tuna: tunaImg,
    tunaFlash: makeWhiteMask(tunaImg),
    tunaGrip: { x: tunaImg.width * 0.7, y: tunaImg.height * 0.35 },
    handIdle: { x: idle.width * 0.45, y: idle.height * 0.55 },
    handSwing: { x: swing.width * 0.45, y: swing.height * 0.5 },
  };
}
