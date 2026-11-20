export type GamePhase =
  | 'TITLE'
  | 'PLAYING'
  | 'LEVEL_UP'
  | 'CHEST'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAME_OVER';

export type WeaponId =
  | 'greatsword'
  | 'shuriken'
  | 'orb'
  | 'arrow'
  | 'shield'
  | 'holy';

export type PassiveId =
  | 'maxHp'
  | 'speed'
  | 'might'
  | 'cooldown'
  | 'magnet';

export type MonsterKind =
  | 'jelly'
  | 'acorn'
  | 'ghost'
  | 'piglet'
  | 'mushroom'
  | 'golem'
  | 'boss_jelly'
  | 'boss_acorn'
  | 'boss_ghost'
  | 'boss_final';

export type PickupKind =
  | 'exp_small'
  | 'exp_medium'
  | 'exp_large'
  | 'coin'
  | 'potion'
  | 'magnet_all'
  | 'bomb'
  | 'chest';

export interface WeaponLevelStats {
  damage: number;
  cooldown: number;
  count: number;
  area: number;
  speed: number;
  pierce: number;
  critChance: number;
  summary: string;
}

export interface WeaponDef {
  id: WeaponId;
  name: string;
  evolvedName: string;
  description: string;
  evolvedDescription: string;
  pairedPassive: PassiveId;
  accentColor: string;
  levels: WeaponLevelStats[]; // 8 entries (Lv.1..Lv.8)
  evolvedStats: WeaponLevelStats;
}

export interface PassiveDef {
  id: PassiveId;
  name: string;
  description: string;
  accentColor: string;
  maxLevel: number; // 5
  bonusPerLevel: number;
  statLabel: string;
  formatValue: (level: number) => string;
}

export interface OwnedWeapon {
  id: WeaponId;
  level: number; // 1..8
  evolved: boolean;
  timer: number;
  totalDamage: number;
}

export interface OwnedPassive {
  id: PassiveId;
  level: number; // 1..5
}

export interface UpgradeChoice {
  kind: 'weapon' | 'passive';
  id: WeaponId | PassiveId;
  name: string;
  isNew: boolean;
  currentLevel: number;
  nextLevel: number;
  maxLevel: number;
  description: string;
  effectDiff: string;
  synergyHint?: string;
  accentColor: string;
}

export interface ChestReward {
  type: 'evolution' | 'upgrade' | 'bonus';
  title: string;
  subtitle: string;
  itemId?: WeaponId | PassiveId;
  itemKind?: 'weapon' | 'passive';
  coinsGained: number;
  healGained: number;
}

export interface BossHudInfo {
  name: string;
  hp: number;
  maxHp: number;
  isFinal: boolean;
}

export interface HudSnapshot {
  phase: GamePhase;
  elapsedSeconds: number;
  targetSeconds: number;
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  kills: number;
  coins: number;
  weapons: Array<{
    id: WeaponId;
    name: string;
    level: number;
    evolved: boolean;
    totalDamage: number;
  }>;
  passives: Array<{
    id: PassiveId;
    name: string;
    level: number;
  }>;
  upgradeChoices: UpgradeChoice[];
  chestReward: ChestReward | null;
  boss: BossHudInfo | null;
  waveBanner: string | null;
  muted: boolean;
  stats: {
    mightBonusPct: number;
    speedBonusPct: number;
    cooldownRedPct: number;
    magnetBonusPct: number;
  };
}
