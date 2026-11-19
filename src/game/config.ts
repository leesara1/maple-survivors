import { MonsterKind, PassiveDef, PassiveId, WeaponDef, WeaponId } from './types';

export interface WaveMinuteConfig {
  minute: number;
  spawnInterval: number; // seconds between spawn batches
  batchSize: number;
  maxActive: number;
  hpMult: number;
  speedMult: number;
  weights: Partial<Record<MonsterKind, number>>;
  eliteChance: number; // chance a batch includes an elite golem
  announcement?: string;
}

export interface MonsterConfig {
  kind: MonsterKind;
  name: string;
  baseHp: number;
  speed: number;
  damage: number;
  radius: number;
  expValue: number;
  coinChance: number;
  isElite?: boolean;
  isBoss?: boolean;
  scale: number;
  shadowRadius: number;
  knockbackResist: number;
}

export const CONFIG = {
  GAME: {
    TARGET_SURVIVAL_SECONDS: 20 * 60, // 20:00 Final Boss spawns
    BOSS_MINUTES: [5, 10, 15, 20],
    MAX_MONSTERS: 650,
    MAX_PROJECTILES: 450,
    MAX_PICKUPS: 600,
    MAX_DAMAGE_NUMBERS: 220,
    MAX_PARTICLES: 500,
    GRID_CELL_SIZE: 64,
    CRATE_SPAWN_INTERVAL: 18,
    MAX_CRATES: 8,
    SPAWN_MARGIN: 90,
  },

  PLAYER: {
    BASE_MAX_HP: 100,
    BASE_SPEED: 168,
    RADIUS: 14,
    BASE_MAGNET_RADIUS: 82,
    PICKUP_COLLECT_RADIUS: 22,
    INVULN_DURATION: 0.42,
  },

  EXP: {
    BASE_REQUIREMENT: 10,
    PER_LEVEL_ADD: 8,
    PER_LEVEL_GROWTH: 1.11,
    requirementForLevel(level: number): number {
      return Math.round(
        (this.BASE_REQUIREMENT + (level - 1) * this.PER_LEVEL_ADD) *
          Math.pow(this.PER_LEVEL_GROWTH, Math.max(0, level - 2))
      );
    },
  },

  WEAPONS: {
    greatsword: {
      id: 'greatsword',
      name: '냉동참치',
      evolvedName: '진 · 대왕 냉동참치',
      description: '견습 어부의 비장의 무기 · 꽁꽁 언 참치를 앞쪽 반원으로 힘껏 휘두릅니다.',
      evolvedDescription: '화면 절반을 가르는 초대형 냉동참치 서리 검기를 양방향으로 날립니다!',
      pairedPassive: 'might',
      accentColor: '#7dd3fc',
      levels: [
        { damage: 24, cooldown: 1.35, count: 1, area: 92, speed: 0, pierce: 99, critChance: 0.12, summary: '전방 반원 냉동참치 강타 (피해 24)' },
        { damage: 30, cooldown: 1.3, count: 1, area: 100, speed: 0, pierce: 99, critChance: 0.14, summary: '피해량 +6 · 타격 범위 확대' },
        { damage: 36, cooldown: 1.22, count: 1, area: 110, speed: 0, pierce: 99, critChance: 0.16, summary: '쿨다운 감소 · 범위 +10%' },
        { damage: 44, cooldown: 1.15, count: 2, area: 116, speed: 0, pierce: 99, critChance: 0.18, summary: '전후방 2연속 냉동참치 휩쓸기!' },
        { damage: 54, cooldown: 1.1, count: 2, area: 124, speed: 0, pierce: 99, critChance: 0.2, summary: '피해량 +10 · 서리 궤적 확대' },
        { damage: 66, cooldown: 1.02, count: 2, area: 132, speed: 0, pierce: 99, critChance: 0.22, summary: '치명타율 상승 · 공격 속도 증가' },
        { damage: 80, cooldown: 0.95, count: 2, area: 142, speed: 0, pierce: 99, critChance: 0.25, summary: '피해량 대폭 상승 · 광역 빙결 강타' },
        { damage: 98, cooldown: 0.88, count: 2, area: 154, speed: 0, pierce: 99, critChance: 0.28, summary: '최대 강화! 거대한 냉동참치 일격' },
      ],
      evolvedStats: {
        damage: 165,
        cooldown: 0.78,
        count: 2,
        area: 265,
        speed: 440,
        pierce: 99,
        critChance: 0.4,
        summary: '진화: 화면 절반을 가르는 대왕 냉동참치 파동!',
      },
    },

    shuriken: {
      id: 'shuriken',
      name: '표창',
      evolvedName: '표창 폭풍',
      description: '가장 가까운 적에게 회전하는 별빛 표창을 던집니다.',
      evolvedDescription: '적을 관통하며 쉴 새 없이 쏟아지는 폭풍 표창!',
      pairedPassive: 'cooldown',
      accentColor: '#f59e0b',
      levels: [
        { damage: 15, cooldown: 1.05, count: 1, area: 12, speed: 390, pierce: 1, critChance: 0.14, summary: '가까운 적에게 표창 1개 투척' },
        { damage: 18, cooldown: 0.98, count: 2, area: 12, speed: 410, pierce: 1, critChance: 0.15, summary: '표창 수 +1 (총 2개)' },
        { damage: 22, cooldown: 0.92, count: 2, area: 13, speed: 430, pierce: 2, critChance: 0.16, summary: '관통 +1 · 피해량 증가' },
        { damage: 27, cooldown: 0.84, count: 3, area: 13, speed: 450, pierce: 2, critChance: 0.18, summary: '표창 수 +1 (총 3개)' },
        { damage: 33, cooldown: 0.78, count: 3, area: 14, speed: 470, pierce: 3, critChance: 0.2, summary: '관통 +1 · 탄속 증가' },
        { damage: 40, cooldown: 0.72, count: 4, area: 15, speed: 490, pierce: 3, critChance: 0.22, summary: '표창 수 +1 (총 4개)' },
        { damage: 48, cooldown: 0.65, count: 4, area: 15, speed: 520, pierce: 4, critChance: 0.25, summary: '피해량 상승 · 빠른 연사' },
        { damage: 58, cooldown: 0.58, count: 5, area: 16, speed: 550, pierce: 5, critChance: 0.28, summary: '최대 강화! 5연속 관통 표창' },
      ],
      evolvedStats: {
        damage: 78,
        cooldown: 0.24,
        count: 3,
        area: 19,
        speed: 640,
        pierce: 8,
        critChance: 0.35,
        summary: '진화: 0.24초마다 사방으로 관통 표창 폭풍!',
      },
    },

    orb: {
      id: 'orb',
      name: '마법 구체',
      evolvedName: '태양 폭발 구체',
      description: '적을 자동으로 추적하는 빛나는 마법 구체를 발사합니다.',
      evolvedDescription: '적중 시 강렬한 범위 폭발을 일으키는 거대 구체!',
      pairedPassive: 'maxHp',
      accentColor: '#a855f7',
      levels: [
        { damage: 20, cooldown: 1.55, count: 1, area: 15, speed: 265, pierce: 1, critChance: 0.1, summary: '유도 마법 구체 1개 발사' },
        { damage: 25, cooldown: 1.48, count: 1, area: 16, speed: 280, pierce: 1, critChance: 0.12, summary: '피해량 증가 · 유도 속도 상승' },
        { damage: 30, cooldown: 1.4, count: 2, area: 17, speed: 295, pierce: 1, critChance: 0.14, summary: '구체 수 +1 (총 2개)' },
        { damage: 37, cooldown: 1.32, count: 2, area: 18, speed: 310, pierce: 2, critChance: 0.15, summary: '1회 관통 · 피해량 +7' },
        { damage: 45, cooldown: 1.24, count: 3, area: 19, speed: 325, pierce: 2, critChance: 0.17, summary: '구체 수 +1 (총 3개)' },
        { damage: 54, cooldown: 1.15, count: 3, area: 21, speed: 340, pierce: 2, critChance: 0.19, summary: '크기 확대 · 쿨다운 단축' },
        { damage: 65, cooldown: 1.06, count: 4, area: 22, speed: 360, pierce: 3, critChance: 0.21, summary: '구체 수 +1 (총 4개)' },
        { damage: 78, cooldown: 0.96, count: 4, area: 24, speed: 380, pierce: 3, critChance: 0.24, summary: '최대 강화! 고속 추적 마법탄' },
      ],
      evolvedStats: {
        damage: 115,
        cooldown: 0.85,
        count: 4,
        area: 78, // explosion radius
        speed: 390,
        pierce: 1,
        critChance: 0.3,
        summary: '진화: 명중 시 광역 폭발하는 거대 태양 구체!',
      },
    },

    arrow: {
      id: 'arrow',
      name: '화살 연사',
      evolvedName: '관통 화살비',
      description: '이동하는 방향으로 날카로운 화살을 여러 발 쏩니다.',
      evolvedDescription: '적을 꿰뚫는 폭풍 화살과 하늘에서 내리는 화살비!',
      pairedPassive: 'speed',
      accentColor: '#22c55e',
      levels: [
        { damage: 14, cooldown: 1.15, count: 2, area: 10, speed: 470, pierce: 1, critChance: 0.14, summary: '이동 방향으로 화살 2발 발사' },
        { damage: 17, cooldown: 1.08, count: 3, area: 10, speed: 490, pierce: 1, critChance: 0.15, summary: '화살 수 +1 (총 3발)' },
        { damage: 21, cooldown: 1.02, count: 3, area: 11, speed: 510, pierce: 2, critChance: 0.17, summary: '관통 +1 · 피해량 증가' },
        { damage: 26, cooldown: 0.95, count: 4, area: 11, speed: 530, pierce: 2, critChance: 0.19, summary: '화살 수 +1 (총 4발)' },
        { damage: 32, cooldown: 0.88, count: 5, area: 12, speed: 550, pierce: 2, critChance: 0.21, summary: '화살 수 +1 (총 5발)' },
        { damage: 38, cooldown: 0.82, count: 5, area: 12, speed: 575, pierce: 3, critChance: 0.23, summary: '관통 +1 · 연사 속도 상승' },
        { damage: 46, cooldown: 0.75, count: 6, area: 13, speed: 600, pierce: 3, critChance: 0.25, summary: '화살 수 +1 (총 6발)' },
        { damage: 56, cooldown: 0.68, count: 7, area: 14, speed: 630, pierce: 4, critChance: 0.28, summary: '최대 강화! 7연발 부채꼴 화살' },
      ],
      evolvedStats: {
        damage: 76,
        cooldown: 0.42,
        count: 9,
        area: 15,
        speed: 740,
        pierce: 99,
        critChance: 0.34,
        summary: '진화: 무한 관통 화살 9연사 + 추가 화살비!',
      },
    },

    shield: {
      id: 'shield',
      name: '수호 방패',
      evolvedName: '성좌의 방패진',
      description: '캐릭터 주위를 회전하며 다가오는 적을 밀쳐내는 방패입니다.',
      evolvedDescription: '거대하고 영구적인 성스러운 방패진이 주변 적을 분쇄합니다!',
      pairedPassive: 'magnet',
      accentColor: '#60a5fa',
      levels: [
        { damage: 14, cooldown: 0, count: 2, area: 58, speed: 2.4, pierce: 99, critChance: 0.08, summary: '회전 수호 방패 2개 생성' },
        { damage: 18, cooldown: 0, count: 2, area: 64, speed: 2.7, pierce: 99, critChance: 0.1, summary: '회전 속도 · 피해량 상승' },
        { damage: 22, cooldown: 0, count: 3, area: 68, speed: 2.9, pierce: 99, critChance: 0.12, summary: '방패 수 +1 (총 3개)' },
        { damage: 28, cooldown: 0, count: 3, area: 74, speed: 3.1, pierce: 99, critChance: 0.14, summary: '궤도 반경 확대 · 피해량 +6' },
        { damage: 34, cooldown: 0, count: 4, area: 78, speed: 3.3, pierce: 99, critChance: 0.16, summary: '방패 수 +1 (총 4개)' },
        { damage: 42, cooldown: 0, count: 4, area: 84, speed: 3.6, pierce: 99, critChance: 0.18, summary: '회전 가속 · 넉백 강화' },
        { damage: 52, cooldown: 0, count: 5, area: 90, speed: 3.9, pierce: 99, critChance: 0.2, summary: '방패 수 +1 (총 5개)' },
        { damage: 64, cooldown: 0, count: 6, area: 96, speed: 4.2, pierce: 99, critChance: 0.22, summary: '최대 강화! 6방패 수호 결계' },
      ],
      evolvedStats: {
        damage: 96,
        cooldown: 0,
        count: 8,
        area: 118,
        speed: 4.9,
        pierce: 99,
        critChance: 0.28,
        summary: '진화: 8개의 초대형 성좌 방패 + 고속 회전!',
      },
    },

    holy: {
      id: 'holy',
      name: '성스러운 빛',
      evolvedName: '축복의 빛기둥',
      description: '일정 시간마다 주변 적들에게 눈부신 빛기둥을 떨어뜨립니다.',
      evolvedDescription: '거대한 축복의 빛기둥이 적을 태우고 닿을 때마다 체력을 회복합니다!',
      pairedPassive: 'maxHp',
      accentColor: '#fde047',
      levels: [
        { damage: 28, cooldown: 2.6, count: 2, area: 38, speed: 0, pierce: 99, critChance: 0.15, summary: '주변에 성스러운 빛기둥 2개 낙하' },
        { damage: 35, cooldown: 2.45, count: 2, area: 44, speed: 0, pierce: 99, critChance: 0.16, summary: '빛기둥 범위 및 피해량 증가' },
        { damage: 42, cooldown: 2.3, count: 3, area: 48, speed: 0, pierce: 99, critChance: 0.18, summary: '빛기둥 +1 (총 3개)' },
        { damage: 52, cooldown: 2.15, count: 3, area: 54, speed: 0, pierce: 99, critChance: 0.2, summary: '쿨다운 감소 · 폭발 범위 확대' },
        { damage: 64, cooldown: 2.0, count: 4, area: 58, speed: 0, pierce: 99, critChance: 0.22, summary: '빛기둥 +1 (총 4개)' },
        { damage: 78, cooldown: 1.85, count: 4, area: 64, speed: 0, pierce: 99, critChance: 0.24, summary: '피해량 상승 · 치명타율 증가' },
        { damage: 94, cooldown: 1.7, count: 5, area: 70, speed: 0, pierce: 99, critChance: 0.26, summary: '빛기둥 +1 (총 5개)' },
        { damage: 115, cooldown: 1.55, count: 6, area: 76, speed: 0, pierce: 99, critChance: 0.3, summary: '최대 강화! 6연속 심판의 빛' },
      ],
      evolvedStats: {
        damage: 165,
        cooldown: 1.3,
        count: 7,
        area: 96,
        speed: 0,
        pierce: 99,
        critChance: 0.36,
        summary: '진화: 빛기둥이 닿을 때 HP 회복 + 광역 천벌!',
      },
    },
  } as Record<WeaponId, WeaponDef>,

  PASSIVES: {
    maxHp: {
      id: 'maxHp',
      name: '생명의 펜던트',
      description: '최대 체력이 증가하고 획득 즉시 체력을 회복합니다.',
      accentColor: '#fb7185',
      maxLevel: 5,
      bonusPerLevel: 25,
      statLabel: '최대 HP',
      formatValue: (lvl: number) => `+${lvl * 25} HP`,
    },
    speed: {
      id: 'speed',
      name: '날개 부츠',
      description: '이동 속도가 빨라져 적의 포위를 쉽게 빠져나갑니다.',
      accentColor: '#4ade80',
      maxLevel: 5,
      bonusPerLevel: 0.1,
      statLabel: '이동 속도',
      formatValue: (lvl: number) => `+${lvl * 10}%`,
    },
    might: {
      id: 'might',
      name: '용사의 문장',
      description: '모든 무기의 공격력이 크게 증가합니다.',
      accentColor: '#f97316',
      maxLevel: 5,
      bonusPerLevel: 0.16,
      statLabel: '공격력',
      formatValue: (lvl: number) => `+${lvl * 16}%`,
    },
    cooldown: {
      id: 'cooldown',
      name: '바람의 깃털',
      description: '모든 무기의 공격 쿨다운이 줄어듭니다.',
      accentColor: '#38bdf8',
      maxLevel: 5,
      bonusPerLevel: 0.08,
      statLabel: '쿨다운 감소',
      formatValue: (lvl: number) => `-${lvl * 8}%`,
    },
    magnet: {
      id: 'magnet',
      name: '자석 부적',
      description: '경험치 구슬과 코인을 끌어당기는 자석 범위가 넓어집니다.',
      accentColor: '#c084fc',
      maxLevel: 5,
      bonusPerLevel: 0.38,
      statLabel: '획득 범위',
      formatValue: (lvl: number) => `+${lvl * 38}%`,
    },
  } as Record<PassiveId, PassiveDef>,

  MONSTERS: {
    jelly: {
      kind: 'jelly',
      name: '젤리 방울',
      baseHp: 22,
      speed: 52,
      damage: 7,
      radius: 13,
      expValue: 3,
      coinChance: 0.16,
      scale: 2.3,
      shadowRadius: 12,
      knockbackResist: 0,
    },
    acorn: {
      kind: 'acorn',
      name: '도토리 병정',
      baseHp: 16,
      speed: 96,
      damage: 8,
      radius: 12,
      expValue: 4,
      coinChance: 0.22,
      scale: 2.2,
      shadowRadius: 11,
      knockbackResist: 0.1,
    },
    ghost: {
      kind: 'ghost',
      name: '꼬마 유령',
      baseHp: 28,
      speed: 78,
      damage: 10,
      radius: 13,
      expValue: 5,
      coinChance: 0.25,
      scale: 2.3,
      shadowRadius: 10,
      knockbackResist: 0.2,
    },
    golem: {
      kind: 'golem',
      name: '이끼 돌 골렘',
      baseHp: 240,
      speed: 44,
      damage: 18,
      radius: 22,
      expValue: 30,
      coinChance: 1.0,
      isElite: true,
      scale: 3.1,
      shadowRadius: 21,
      knockbackResist: 0.72,
    },
    boss_jelly: {
      kind: 'boss_jelly',
      name: '킹 푸딩 슬라임',
      baseHp: 2400,
      speed: 62,
      damage: 22,
      radius: 34,
      expValue: 120,
      coinChance: 1.0,
      isBoss: true,
      scale: 3.6,
      shadowRadius: 34,
      knockbackResist: 0.92,
    },
    boss_acorn: {
      kind: 'boss_acorn',
      name: '고대 도토리 장군',
      baseHp: 6200,
      speed: 82,
      damage: 28,
      radius: 35,
      expValue: 200,
      coinChance: 1.0,
      isBoss: true,
      scale: 3.7,
      shadowRadius: 34,
      knockbackResist: 0.94,
    },
    boss_ghost: {
      kind: 'boss_ghost',
      name: '황혼의 유령왕',
      baseHp: 13500,
      speed: 90,
      damage: 34,
      radius: 36,
      expValue: 320,
      coinChance: 1.0,
      isBoss: true,
      scale: 3.8,
      shadowRadius: 35,
      knockbackResist: 0.95,
    },
    boss_final: {
      kind: 'boss_final',
      name: '파멸의 숲 군주 · 데스그루트',
      baseHp: 32000,
      speed: 98,
      damage: 42,
      radius: 44,
      expValue: 999,
      coinChance: 1.0,
      isBoss: true,
      scale: 4.4,
      shadowRadius: 42,
      knockbackResist: 0.98,
    },
  } as Record<MonsterKind, MonsterConfig>,

  // 20-minute wave progression: easy & welcoming first 5 mins, intense build-check after 10 mins!
  WAVES: [
    { minute: 0, spawnInterval: 1.15, batchSize: 3, maxActive: 40, hpMult: 0.85, speedMult: 0.92, weights: { jelly: 10 }, eliteChance: 0, announcement: '냉동참치 모험 시작! 젤리 방울이 몰려옵니다' },
    { minute: 1, spawnInterval: 0.95, batchSize: 4, maxActive: 65, hpMult: 1.0, speedMult: 0.95, weights: { jelly: 7, acorn: 3 }, eliteChance: 0, announcement: '웨이브 2 · 재빠른 도토리 병정 등장!' },
    { minute: 2, spawnInterval: 0.85, batchSize: 5, maxActive: 90, hpMult: 1.15, speedMult: 0.98, weights: { jelly: 5, acorn: 5 }, eliteChance: 0.03, announcement: '웨이브 3 · 숲속 몬스터 무리가 늘어납니다' },
    { minute: 3, spawnInterval: 0.75, batchSize: 6, maxActive: 115, hpMult: 1.35, speedMult: 1.0, weights: { jelly: 4, acorn: 4, ghost: 3 }, eliteChance: 0.05, announcement: '웨이브 4 · 꼬마 유령 떼가 날아옵니다!' },
    { minute: 4, spawnInterval: 0.68, batchSize: 7, maxActive: 145, hpMult: 1.55, speedMult: 1.02, weights: { jelly: 3, acorn: 4, ghost: 4 }, eliteChance: 0.08, announcement: '웨이브 5 · 엘리트 돌 골렘 출현! (보물상자 드롭)' },
    { minute: 5, spawnInterval: 0.62, batchSize: 8, maxActive: 175, hpMult: 1.85, speedMult: 1.05, weights: { jelly: 3, acorn: 4, ghost: 4 }, eliteChance: 0.1, announcement: '5분 보스 출현! 킹 푸딩 슬라임' },
    { minute: 6, spawnInterval: 0.56, batchSize: 9, maxActive: 210, hpMult: 2.2, speedMult: 1.06, weights: { acorn: 5, ghost: 4, jelly: 2 }, eliteChance: 0.12, announcement: '웨이브 7 · 도토리 돌격대 대행진' },
    { minute: 7, spawnInterval: 0.5, batchSize: 10, maxActive: 245, hpMult: 2.6, speedMult: 1.08, weights: { ghost: 6, acorn: 4 }, eliteChance: 0.14, announcement: '웨이브 8 · 안개 속 유령 대군' },
    { minute: 8, spawnInterval: 0.45, batchSize: 11, maxActive: 280, hpMult: 3.1, speedMult: 1.1, weights: { jelly: 3, acorn: 4, ghost: 5 }, eliteChance: 0.16, announcement: '웨이브 9 · 숲의 공세가 거세집니다!' },
    { minute: 9, spawnInterval: 0.42, batchSize: 12, maxActive: 315, hpMult: 3.6, speedMult: 1.12, weights: { acorn: 5, ghost: 5, golem: 1 }, eliteChance: 0.2, announcement: '웨이브 10 · 돌 골렘 수호대 출격' },
    { minute: 10, spawnInterval: 0.38, batchSize: 13, maxActive: 350, hpMult: 4.3, speedMult: 1.15, weights: { jelly: 2, acorn: 4, ghost: 5, golem: 1 }, eliteChance: 0.22, announcement: '10분 보스 출현! 고대 도토리 장군 (빌드 시험 시작!)' },
    { minute: 11, spawnInterval: 0.35, batchSize: 14, maxActive: 390, hpMult: 5.2, speedMult: 1.17, weights: { acorn: 5, ghost: 6, golem: 1 }, eliteChance: 0.24, announcement: '웨이브 12 · 진화 무기가 필요한 시점입니다!' },
    { minute: 12, spawnInterval: 0.32, batchSize: 15, maxActive: 430, hpMult: 6.2, speedMult: 1.19, weights: { ghost: 7, acorn: 4, golem: 1 }, eliteChance: 0.26, announcement: '웨이브 13 · 끝없는 유령 폭풍' },
    { minute: 13, spawnInterval: 0.3, batchSize: 16, maxActive: 470, hpMult: 7.4, speedMult: 1.21, weights: { jelly: 3, acorn: 5, ghost: 5, golem: 2 }, eliteChance: 0.28, announcement: '웨이브 14 · 정예 골렘 다수 접근!' },
    { minute: 14, spawnInterval: 0.28, batchSize: 17, maxActive: 510, hpMult: 8.8, speedMult: 1.23, weights: { acorn: 5, ghost: 6, golem: 2 }, eliteChance: 0.3, announcement: '웨이브 15 · 어둠이 숲을 덮칩니다' },
    { minute: 15, spawnInterval: 0.26, batchSize: 18, maxActive: 540, hpMult: 10.5, speedMult: 1.25, weights: { ghost: 6, acorn: 5, golem: 2 }, eliteChance: 0.32, announcement: '15분 보스 출현! 황혼의 유령왕' },
    { minute: 16, spawnInterval: 0.25, batchSize: 19, maxActive: 570, hpMult: 12.2, speedMult: 1.27, weights: { jelly: 3, acorn: 5, ghost: 6, golem: 2 }, eliteChance: 0.34, announcement: '웨이브 17 · 한계 돌파 러시!' },
    { minute: 17, spawnInterval: 0.24, batchSize: 20, maxActive: 590, hpMult: 14.0, speedMult: 1.29, weights: { acorn: 6, ghost: 6, golem: 2 }, eliteChance: 0.36, announcement: '웨이브 18 · 최후의 공세가 다가옵니다' },
    { minute: 18, spawnInterval: 0.23, batchSize: 21, maxActive: 610, hpMult: 16.0, speedMult: 1.31, weights: { ghost: 7, acorn: 5, golem: 3 }, eliteChance: 0.38, announcement: '웨이브 19 · 총력전! 버텨내세요!' },
    { minute: 19, spawnInterval: 0.22, batchSize: 22, maxActive: 630, hpMult: 18.5, speedMult: 1.33, weights: { jelly: 3, acorn: 5, ghost: 6, golem: 3 }, eliteChance: 0.4, announcement: '웨이브 20 · 최종 보스 강림 임박!' },
  ] as WaveMinuteConfig[],
};
