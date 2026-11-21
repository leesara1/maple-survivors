import { fetchHeroSheet, loadAvatar } from './avatar';
import { MonsterKind, PassiveId, WeaponId } from './types';

const A = '/assets';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function imageToCanvas(img: HTMLImageElement | HTMLCanvasElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);
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

function scaleCanvas(src: HTMLCanvasElement, scale: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(src.width * scale));
  c.height = Math.max(1, Math.round(src.height * scale));
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

async function loadCanvas(src: string): Promise<HTMLCanvasElement> {
  const img = await loadImage(src);
  return imageToCanvas(img);
}

async function loadCanvases(srcs: string[]): Promise<HTMLCanvasElement[]> {
  const results: HTMLCanvasElement[] = [];
  for (const src of srcs) {
    try {
      results.push(await loadCanvas(src));
    } catch {
      // skip missing frame
    }
  }
  if (results.length === 0) {
    throw new Error(`No frames loaded from ${srcs[0]}`);
  }
  return results;
}

/** Translucent bubble dome for the evolved shield. */
function makeShieldDome(size = 64): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const r = size / 2;
  const g = ctx.createRadialGradient(r * 0.75, r * 0.65, r * 0.1, r, r, r);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.35, 'rgba(125,211,252,0.55)');
  g.addColorStop(0.85, 'rgba(56,189,248,0.75)');
  g.addColorStop(1, 'rgba(14,116,144,0.9)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(r, r, r - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(r, r, r * 0.72, Math.PI * 1.1, Math.PI * 1.45);
  ctx.stroke();
  return c;
}

function makeHitBadge(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 48;
  c.height = 24;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#c41e3a';
  ctx.strokeStyle = '#24182b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(1, 1, 46, 22, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HIT!', 24, 13);
  return c;
}

export interface SpriteFramePair {
  frames: HTMLCanvasElement[];
  flashFrames: HTMLCanvasElement[];
}

export interface UiIcons {
  levelStar: string;
  frozenTuna: string;
  coinGold: string;
  coinPouch: string;
  bulb: string;
  quest: string;
  cursorDefault: string;
  cursorPointer: string;
}

export interface HeroSheetFrames {
  idle: HTMLCanvasElement;
  idleFlash: HTMLCanvasElement;
  /** Official stand2 breathe frames (Frozen Tuna equipped). */
  idleFrames: HTMLCanvasElement[];
  idleFlashFrames: HTMLCanvasElement[];
  walk: HTMLCanvasElement[];
  walkFlash: HTMLCanvasElement[];
  swing: HTMLCanvasElement;
  swingFlash: HTMLCanvasElement;
  /** Official swingPF frames (Frozen Tuna polearm swing). */
  swingFrames: HTMLCanvasElement[];
  swingFlashFrames: HTMLCanvasElement[];
  baseHeight: number;
  /** Official item icon 1442039. */
  tuna: HTMLCanvasElement;
  tunaFlash: HTMLCanvasElement;
  tunaGrip: { x: number; y: number };
  handIdle: { x: number; y: number };
  handSwing: { x: number; y: number };
}

export interface SpriteBank {
  heroSheet: HeroSheetFrames;
  monsters: Record<MonsterKind, SpriteFramePair>;
  crate: HTMLCanvasElement;
  chest: HTMLCanvasElement;
  expSmall: HTMLCanvasElement;
  expMedium: HTMLCanvasElement;
  expLarge: HTMLCanvasElement;
  coin: HTMLCanvasElement;
  potion: HTMLCanvasElement;
  magnetAll: HTMLCanvasElement;
  bomb: HTMLCanvasElement;
  coinBronze: HTMLCanvasElement;
  coinSilver: HTMLCanvasElement;
  coinGold: HTMLCanvasElement;
  coinPouch: HTMLCanvasElement;
  hitBadge: HTMLCanvasElement;
  shieldDome: HTMLCanvasElement;
  icons: Record<WeaponId | PassiveId, string>;
}

const MOB_FRAME_PATHS: Record<MonsterKind, string[]> = {
  jelly: [
    `${A}/mobs/jelly_move0.png`,
    `${A}/mobs/jelly_move1.png`,
    `${A}/mobs/jelly_move2.png`,
    `${A}/mobs/jelly_move3.png`,
  ],
  acorn: [
    `${A}/mobs/acorn_move0.png`,
    `${A}/mobs/acorn_move1.png`,
    `${A}/mobs/acorn_move2.png`,
    `${A}/mobs/acorn_move3.png`,
  ],
  ghost: [
    `${A}/mobs/ghost_move0.png`,
    `${A}/mobs/ghost_move1.png`,
    `${A}/mobs/ghost_move2.png`,
    `${A}/mobs/ghost_move3.png`,
  ],
  piglet: [
    `${A}/mobs/piglet_move0.png`,
    `${A}/mobs/piglet_move1.png`,
    `${A}/mobs/piglet_move2.png`,
  ],
  mushroom: [
    `${A}/mobs/mushroom_move0.png`,
    `${A}/mobs/mushroom_move1.png`,
    `${A}/mobs/mushroom_move2.png`,
  ],
  golem: [
    `${A}/mobs/golem_move0.png`,
    `${A}/mobs/golem_move1.png`,
    `${A}/mobs/golem_move2.png`,
    `${A}/mobs/golem_move3.png`,
  ],
  boss_jelly: [
    `${A}/mobs/boss_jelly_move0.png`,
    `${A}/mobs/boss_jelly_move1.png`,
    `${A}/mobs/boss_jelly_move2.png`,
    `${A}/mobs/boss_jelly_move3.png`,
  ],
  boss_acorn: [
    `${A}/mobs/boss_acorn_move0.png`,
    `${A}/mobs/boss_acorn_move1.png`,
    `${A}/mobs/boss_acorn_move2.png`,
    `${A}/mobs/boss_acorn_move3.png`,
  ],
  boss_ghost: [
    `${A}/mobs/boss_ghost_move0.png`,
    `${A}/mobs/boss_ghost_move1.png`,
    `${A}/mobs/boss_ghost_move2.png`,
    `${A}/mobs/boss_ghost_move3.png`,
  ],
  boss_final: [
    `${A}/mobs/boss_final_move0.png`,
    `${A}/mobs/boss_final_move1.png`,
    `${A}/mobs/boss_final_move2.png`,
    `${A}/mobs/boss_final_move3.png`,
  ],
};

const ICON_PATHS: Record<WeaponId | PassiveId, string> = {
  greatsword: `${A}/items/frozen_tuna_icon.png`,
  shuriken: `${A}/items/shuriken.png`,
  orb: `${A}/items/magic_rock.png`,
  shield: `${A}/items/shield.png`,
  holy: `${A}/items/maple_leaf.png`,
  maxHp: `${A}/items/pendant.png`,
  speed: `${A}/items/shoes.png`,
  might: `${A}/items/scroll.png`,
  cooldown: `${A}/items/feather.png`,
  magnet: `${A}/items/magnet.png`,
};

let cachedBank: SpriteBank | null = null;
let cachedUiIcons: UiIcons | null = null;
let loadPromise: Promise<SpriteBank> | null = null;

async function buildSpriteBank(): Promise<SpriteBank> {
  const makePair = async (paths: string[]): Promise<SpriteFramePair> => {
    const frames = await loadCanvases(paths);
    return { frames, flashFrames: frames.map(makeWhiteMask) };
  };

  const monsterEntries = await Promise.all(
    (Object.keys(MOB_FRAME_PATHS) as MonsterKind[]).map(async (kind) => {
      const pair = await makePair(MOB_FRAME_PATHS[kind]);
      return [kind, pair] as const;
    })
  );
  const monsters = Object.fromEntries(monsterEntries) as Record<MonsterKind, SpriteFramePair>;

  // Live paper-doll from avatar config (default cody + Frozen Tuna 1442039)
  const heroSheet: HeroSheetFrames = await fetchHeroSheet(loadAvatar());

  const iconCanvases = await Promise.all(
    (Object.keys(ICON_PATHS) as Array<WeaponId | PassiveId>).map(async (key) => {
      const c = await loadCanvas(ICON_PATHS[key]);
      // Official tuna icon is 32×32 — upscale for crisp UI
      const out = scaleCanvas(c, key === 'greatsword' ? 3 : 2);
      return [key, out.toDataURL()] as const;
    })
  );
  const icons = Object.fromEntries(iconCanvases) as Record<WeaponId | PassiveId, string>;

  const [
    crate,
    chest,
    expSmall,
    expMedium,
    expLarge,
    coin,
    potion,
    magnetAll,
    bomb,
    coinBronze,
    coinSilver,
    coinGold,
    coinPouch,
  ] = await Promise.all([
    loadCanvas(`${A}/items/box.png`),
    loadCanvas(`${A}/items/treasure.png`),
    loadCanvas(`${A}/items/snail_shell.png`),
    loadCanvas(`${A}/items/blue_snail_shell.png`),
    loadCanvas(`${A}/items/maple_leaf.png`),
    loadCanvas(`${A}/items/coin.png`),
    loadCanvas(`${A}/items/potion.png`),
    loadCanvas(`${A}/items/magnet.png`),
    loadCanvas(`${A}/items/bomb.png`),
    loadCanvas(`${A}/items/meso_bronze.png`),
    loadCanvas(`${A}/items/meso_silver.png`),
    loadCanvas(`${A}/items/meso_gold.png`),
    loadCanvas(`${A}/items/pouch.png`),
  ]);

  return {
    heroSheet,
    monsters,
    crate: scaleCanvas(crate, 1.2),
    chest: scaleCanvas(chest, 1.2),
    expSmall: scaleCanvas(expSmall, 1.0),
    expMedium: scaleCanvas(expMedium, 1.0),
    expLarge: scaleCanvas(expLarge, 1.0),
    coin: scaleCanvas(coin, 1.0),
    potion: scaleCanvas(potion, 1.0),
    magnetAll: scaleCanvas(magnetAll, 1.0),
    bomb: scaleCanvas(bomb, 1.0),
    coinBronze: scaleCanvas(coinBronze, 1.0),
    coinSilver: scaleCanvas(coinSilver, 1.0),
    coinGold: scaleCanvas(coinGold, 1.0),
    coinPouch: scaleCanvas(coinPouch, 1.1),
    hitBadge: makeHitBadge(),
    shieldDome: makeShieldDome(),
    icons,
  };
}

/** Preload all MapleStory sprite assets. Safe to call multiple times. */
export function loadSpriteBank(): Promise<SpriteBank> {
  if (cachedBank) return Promise.resolve(cachedBank);
  if (!loadPromise) {
    loadPromise = buildSpriteBank()
      .then((bank) => {
        cachedBank = bank;
        return bank;
      })
      .catch((err) => {
        loadPromise = null;
        throw err;
      });
  }
  return loadPromise;
}

export function getSpriteBank(): SpriteBank {
  if (!cachedBank) {
    throw new Error('Sprites not loaded yet — await loadSpriteBank() first');
  }
  return cachedBank;
}

/** Hot-swap hero paper-doll after cody apply. */
export function setHeroSheet(sheet: HeroSheetFrames): void {
  if (!cachedBank) throw new Error('Sprites not loaded yet');
  cachedBank.heroSheet = sheet;
}

export function getUiIcons(): UiIcons {
  if (cachedUiIcons) return cachedUiIcons;
  const bank = getSpriteBank();
  cachedUiIcons = {
    levelStar: bank.icons.holy,
    frozenTuna: bank.icons.greatsword,
    coinGold: bank.coinGold.toDataURL(),
    coinPouch: bank.coinPouch.toDataURL(),
    bulb: bank.icons.cooldown,
    quest: bank.icons.might,
    cursorDefault: 'auto',
    cursorPointer: 'pointer',
  };
  return cachedUiIcons;
}
