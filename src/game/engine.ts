import { sound } from './audio';
import { CONFIG, WaveMinuteConfig } from './config';
import { SpatialGrid } from './spatialGrid';
import { getSpriteBank, SpriteBank } from './sprites';
import {
  BossHudInfo,
  ChestReward,
  GamePhase,
  HudSnapshot,
  MonsterKind,
  OwnedPassive,
  OwnedWeapon,
  PassiveId,
  PickupKind,
  UpgradeChoice,
  WeaponId,
} from './types';

interface MonsterSlot {
  active: boolean;
  kind: MonsterKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  radius: number;
  expValue: number;
  coinChance: number;
  isElite: boolean;
  isBoss: boolean;
  facing: number; // 1 or -1
  animTime: number;
  hitFlash: number;
  shieldHitCooldown: number;
  swordHitId: number;
  bossAttackTimer: number;
  bossTelegraphTimer: number;
  bossTelegraphX: number;
  bossTelegraphY: number;
}

interface ProjectileSlot {
  active: boolean;
  weaponId: WeaponId;
  style: 'shuriken' | 'orb' | 'arrow' | 'sword_wave' | 'arrow_rain';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  critChance: number;
  pierceLeft: number;
  life: number;
  maxLife: number;
  spin: number;
  evolved: boolean;
  explosionRadius: number;
  hitSet: Set<number>;
  targetIdx: number;
}

interface PickupSlot {
  active: boolean;
  kind: PickupKind;
  x: number;
  y: number;
  value: number;
  magnetized: boolean;
  bobPhase: number;
  popZ: number;
  popVz: number;
}

interface CrateSlot {
  active: boolean;
  x: number;
  y: number;
  hp: number;
  hitFlash: number;
}

interface DamageNumberSlot {
  active: boolean;
  x: number;
  y: number;
  vy: number;
  text: string;
  isCrit: boolean;
  isHeal: boolean;
  life: number;
  maxLife: number;
}

interface ParticleSlot {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  isStar: boolean;
}

interface SlashEffect {
  active: boolean;
  x: number;
  y: number;
  angle: number;
  radius: number;
  life: number;
  maxLife: number;
  evolved: boolean;
}

interface HolyPillar {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  evolved: boolean;
  healedPlayer: boolean;
}

interface ShockwaveRing {
  active: boolean;
  x: number;
  y: number;
  maxRadius: number;
  color: string;
  life: number;
  maxLife: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sprites: SpriteBank;
  private grid: SpatialGrid;
  private onHudUpdate: (snapshot: HudSnapshot) => void;

  private rafId: number | null = null;
  private lastTimestamp = 0;
  private hudSyncTimer = 0;

  // Input state
  private heldKeys = new Set<string>();
  private touchMoveX = 0;
  private touchMoveY = 0;

  // Core game state
  public phase: GamePhase = 'TITLE';
  private elapsedSeconds = 0;
  private currentWaveMinute = -1;
  private spawnTimer = 0;
  private crateTimer = 5;
  private spawnedBossMinutes = new Set<number>();
  private waveBannerText: string | null = null;
  private waveBannerTimer = 0;

  // Camera & Juice
  private camX = 0;
  private camY = 0;
  private shakeTimer = 0;
  private shakeIntensity = 0;
  private hitstopTimer = 0;
  private bombFlashTimer = 0;
  private levelUpBeamTimer = 0;
  private gemCombo = 0;
  private gemComboTimer = 0;

  // Player state
  private player = {
    x: 0,
    y: 0,
    facing: 1,
    moveDirX: 1,
    moveDirY: 0,
    hp: CONFIG.PLAYER.BASE_MAX_HP,
    maxHp: CONFIG.PLAYER.BASE_MAX_HP,
    invulnTimer: 0,
    walkTime: 0,
    isMoving: false,
    level: 1,
    exp: 0,
    expToNext: CONFIG.EXP.requirementForLevel(1),
    kills: 0,
    coins: 0,
    shieldAngle: 0,
    fishSwingTimer: 0,
    fishSwingDuration: 0.24,
  };

  private weapons: OwnedWeapon[] = [];
  private passives: OwnedPassive[] = [];
  private upgradeChoices: UpgradeChoice[] = [];
  private chestReward: ChestReward | null = null;
  private swordSwingCounter = 1;

  // Pre-allocated Object Pools
  private monsters: MonsterSlot[] = [];
  private activeMonsterIndices: number[] = [];
  private projectiles: ProjectileSlot[] = [];
  private pickups: PickupSlot[] = [];
  private crates: CrateSlot[] = [];
  private damageNumbers: DamageNumberSlot[] = [];
  private particles: ParticleSlot[] = [];
  private slashes: SlashEffect[] = [];
  private holyPillars: HolyPillar[] = [];
  private shockwaves: ShockwaveRing[] = [];

  // Title attract-mode entities
  private titleTime = 0;

  constructor(canvas: HTMLCanvasElement, onHudUpdate: (snapshot: HudSnapshot) => void) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Could not initialize 2D canvas context');
    }
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = false;
    this.sprites = getSpriteBank();
    this.grid = new SpatialGrid(CONFIG.GAME.GRID_CELL_SIZE);
    this.onHudUpdate = onHudUpdate;

    this.allocatePools();
    this.resetWorldForTitle();
  }

  private allocatePools(): void {
    for (let i = 0; i < CONFIG.GAME.MAX_MONSTERS; i++) {
      this.monsters.push({
        active: false,
        kind: 'jelly',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        hp: 0,
        maxHp: 1,
        speed: 0,
        damage: 0,
        radius: 12,
        expValue: 1,
        coinChance: 0,
        isElite: false,
        isBoss: false,
        facing: 1,
        animTime: 0,
        hitFlash: 0,
        shieldHitCooldown: 0,
        swordHitId: 0,
        bossAttackTimer: 0,
        bossTelegraphTimer: 0,
        bossTelegraphX: 0,
        bossTelegraphY: 0,
      });
    }

    for (let i = 0; i < CONFIG.GAME.MAX_PROJECTILES; i++) {
      this.projectiles.push({
        active: false,
        weaponId: 'shuriken',
        style: 'shuriken',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 10,
        damage: 10,
        critChance: 0.1,
        pierceLeft: 1,
        life: 0,
        maxLife: 1,
        spin: 0,
        evolved: false,
        explosionRadius: 0,
        hitSet: new Set<number>(),
        targetIdx: -1,
      });
    }

    for (let i = 0; i < CONFIG.GAME.MAX_PICKUPS; i++) {
      this.pickups.push({
        active: false,
        kind: 'exp_small',
        x: 0,
        y: 0,
        value: 1,
        magnetized: false,
        bobPhase: 0,
        popZ: 0,
        popVz: 0,
      });
    }

    for (let i = 0; i < CONFIG.GAME.MAX_CRATES; i++) {
      this.crates.push({ active: false, x: 0, y: 0, hp: 20, hitFlash: 0 });
    }

    for (let i = 0; i < CONFIG.GAME.MAX_DAMAGE_NUMBERS; i++) {
      this.damageNumbers.push({
        active: false,
        x: 0,
        y: 0,
        vy: -42,
        text: '',
        isCrit: false,
        isHeal: false,
        life: 0,
        maxLife: 0.7,
      });
    }

    for (let i = 0; i < CONFIG.GAME.MAX_PARTICLES; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 4,
        color: '#ffffff',
        life: 0,
        maxLife: 0.4,
        isStar: false,
      });
    }

    for (let i = 0; i < 24; i++) {
      this.slashes.push({
        active: false,
        x: 0,
        y: 0,
        angle: 0,
        radius: 80,
        life: 0,
        maxLife: 0.22,
        evolved: false,
      });
    }

    for (let i = 0; i < 24; i++) {
      this.holyPillars.push({
        active: false,
        x: 0,
        y: 0,
        radius: 40,
        life: 0,
        maxLife: 0.5,
        evolved: false,
        healedPlayer: false,
      });
    }

    for (let i = 0; i < 24; i++) {
      this.shockwaves.push({
        active: false,
        x: 0,
        y: 0,
        maxRadius: 80,
        color: '#fde047',
        life: 0,
        maxLife: 0.35,
      });
    }
  }

  public start(): void {
    if (this.rafId !== null) return;
    this.lastTimestamp = performance.now();
    const tick = (now: number) => {
      const rawDt = (now - this.lastTimestamp) / 1000;
      this.lastTimestamp = now;
      const dt = Math.min(Math.max(rawDt, 0), 0.05);

      this.update(dt);
      this.render();

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  public destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public resize(width: number, height: number): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(320, Math.floor(width * dpr));
    this.canvas.height = Math.max(240, Math.floor(height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  }

  public setKey(code: string, down: boolean): void {
    if (down) {
      this.heldKeys.add(code);
    } else {
      this.heldKeys.delete(code);
    }
  }

  public clearKeys(): void {
    this.heldKeys.clear();
    this.touchMoveX = 0;
    this.touchMoveY = 0;
  }

  public setTouchVector(dx: number, dy: number): void {
    this.touchMoveX = dx;
    this.touchMoveY = dy;
  }

  public toggleMute(): boolean {
    const muted = sound.toggleMute();
    this.emitHud();
    return muted;
  }

  private resetWorldForTitle(): void {
    this.phase = 'TITLE';
    this.camX = 0;
    this.camY = 0;
    this.player.x = 0;
    this.player.y = 0;
    this.emitHud();
  }

  public startNewRun(): void {
    sound.unlock();
    this.elapsedSeconds = 0;
    this.currentWaveMinute = -1;
    this.spawnTimer = 0.4;
    this.crateTimer = 8;
    this.spawnedBossMinutes.clear();
    this.waveBannerText = null;
    this.waveBannerTimer = 0;
    this.shakeTimer = 0;
    this.hitstopTimer = 0;
    this.bombFlashTimer = 0;
    this.levelUpBeamTimer = 0;
    this.gemCombo = 0;
    this.gemComboTimer = 0;

    this.player.x = 0;
    this.player.y = 0;
    this.player.facing = 1;
    this.player.moveDirX = 1;
    this.player.moveDirY = 0;
    this.player.maxHp = CONFIG.PLAYER.BASE_MAX_HP;
    this.player.hp = CONFIG.PLAYER.BASE_MAX_HP;
    this.player.invulnTimer = 0;
    this.player.walkTime = 0;
    this.player.isMoving = false;
    this.player.level = 1;
    this.player.exp = 0;
    this.player.expToNext = CONFIG.EXP.requirementForLevel(1);
    this.player.kills = 0;
    this.player.coins = 0;
    this.player.shieldAngle = 0;
    this.player.fishSwingTimer = 0;

    this.camX = 0;
    this.camY = 0;

    this.weapons = [
      {
        id: 'greatsword',
        level: 1,
        evolved: false,
        timer: 0.25,
        totalDamage: 0,
      },
    ];
    this.passives = [];
    this.upgradeChoices = [];
    this.chestReward = null;

    // Reset all pools
    this.activeMonsterIndices.length = 0;
    for (let i = 0; i < this.monsters.length; i++) this.monsters[i].active = false;
    for (let i = 0; i < this.projectiles.length; i++) this.projectiles[i].active = false;
    for (let i = 0; i < this.pickups.length; i++) this.pickups[i].active = false;
    for (let i = 0; i < this.crates.length; i++) this.crates[i].active = false;
    for (let i = 0; i < this.damageNumbers.length; i++) this.damageNumbers[i].active = false;
    for (let i = 0; i < this.particles.length; i++) this.particles[i].active = false;
    for (let i = 0; i < this.slashes.length; i++) this.slashes[i].active = false;
    for (let i = 0; i < this.holyPillars.length; i++) this.holyPillars[i].active = false;
    for (let i = 0; i < this.shockwaves.length; i++) this.shockwaves[i].active = false;

    // Spawn 2 initial crates nearby so players discover field items early
    this.spawnCrateNearPlayer(260);
    this.spawnCrateNearPlayer(340);

    this.phase = 'PLAYING';
    this.checkWaveAnnouncement(0);
    this.emitHud();
  }

  public togglePause(): void {
    if (this.phase === 'PLAYING') {
      this.phase = 'PAUSED';
      this.clearKeys();
      this.emitHud();
    } else if (this.phase === 'PAUSED') {
      this.phase = 'PLAYING';
      this.emitHud();
    }
  }

  public chooseUpgrade(index: number): void {
    if (this.phase !== 'LEVEL_UP') return;
    const choice = this.upgradeChoices[index];
    if (!choice) return;

    if (choice.kind === 'weapon') {
      const wid = choice.id as WeaponId;
      const existing = this.weapons.find((w) => w.id === wid);
      if (existing) {
        existing.level = Math.min(8, existing.level + 1);
      } else {
        this.weapons.push({
          id: wid,
          level: 1,
          evolved: false,
          timer: 0.1,
          totalDamage: 0,
        });
      }
    } else {
      const pid = choice.id as PassiveId;
      const existing = this.passives.find((p) => p.id === pid);
      if (existing) {
        existing.level = Math.min(5, existing.level + 1);
      } else {
        this.passives.push({ id: pid, level: 1 });
      }
      if (pid === 'maxHp') {
        const bonus = CONFIG.PASSIVES.maxHp.bonusPerLevel;
        this.player.maxHp += bonus;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + bonus);
      }
    }

    this.upgradeChoices = [];
    this.phase = 'PLAYING';
    // Brief safety invulnerability after closing modal
    this.player.invulnTimer = Math.max(this.player.invulnTimer, 0.3);

    // Check if excess EXP triggers another level up
    if (this.player.exp >= this.player.expToNext) {
      this.triggerLevelUp();
    } else {
      this.emitHud();
    }
  }

  public closeChestModal(): void {
    if (this.phase !== 'CHEST') return;
    this.chestReward = null;
    this.phase = 'PLAYING';
    this.player.invulnTimer = Math.max(this.player.invulnTimer, 0.35);
    this.emitHud();
  }

  // Computed stat multipliers
  private getPassiveLevel(id: PassiveId): number {
    return this.passives.find((p) => p.id === id)?.level || 0;
  }

  private getMightMultiplier(): number {
    return 1 + this.getPassiveLevel('might') * CONFIG.PASSIVES.might.bonusPerLevel;
  }

  private getSpeedMultiplier(): number {
    return 1 + this.getPassiveLevel('speed') * CONFIG.PASSIVES.speed.bonusPerLevel;
  }

  private getCooldownMultiplier(): number {
    return Math.max(
      0.45,
      1 - this.getPassiveLevel('cooldown') * CONFIG.PASSIVES.cooldown.bonusPerLevel
    );
  }

  private getMagnetRadius(): number {
    return (
      CONFIG.PLAYER.BASE_MAGNET_RADIUS *
      (1 + this.getPassiveLevel('magnet') * CONFIG.PASSIVES.magnet.bonusPerLevel)
    );
  }

  private update(dt: number): void {
    if (this.phase === 'TITLE') {
      this.titleTime += dt;
      this.camX = Math.sin(this.titleTime * 0.25) * 90;
      this.camY = Math.cos(this.titleTime * 0.18) * 55;
      return;
    }

    if (this.phase !== 'PLAYING') {
      return;
    }

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    this.elapsedSeconds += dt;
    if (this.shakeTimer > 0) this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    if (this.bombFlashTimer > 0) this.bombFlashTimer = Math.max(0, this.bombFlashTimer - dt);
    if (this.levelUpBeamTimer > 0) this.levelUpBeamTimer = Math.max(0, this.levelUpBeamTimer - dt);
    if (this.waveBannerTimer > 0) {
      this.waveBannerTimer -= dt;
      if (this.waveBannerTimer <= 0) this.waveBannerText = null;
    }
    if (this.gemComboTimer > 0) {
      this.gemComboTimer -= dt;
      if (this.gemComboTimer <= 0) this.gemCombo = 0;
    }

    const currentMin = Math.floor(this.elapsedSeconds / 60);
    if (currentMin !== this.currentWaveMinute) {
      this.checkWaveAnnouncement(currentMin);
    }

    this.updatePlayer(dt);
    this.updateSpawning(dt);
    this.updateCratesSpawning(dt);
    this.updateWeapons(dt);
    this.updateMonsters(dt);
    this.updateProjectiles(dt);
    this.updatePickups(dt);
    this.updateVisualEffects(dt);

    // Smooth camera follow player
    this.camX += (this.player.x - this.camX) * Math.min(1, dt * 12);
    this.camY += (this.player.y - this.camY) * Math.min(1, dt * 12);

    this.hudSyncTimer += dt;
    if (this.hudSyncTimer >= 0.1) {
      this.hudSyncTimer = 0;
      this.emitHud();
    }
  }

  private checkWaveAnnouncement(minute: number): void {
    this.currentWaveMinute = minute;
    const wave = this.getCurrentWaveConfig();
    if (wave.announcement) {
      this.waveBannerText = wave.announcement;
      this.waveBannerTimer = 4.0;
    }

    // Spawn scheduled bosses at 5, 10, 15, 20 minutes
    if (CONFIG.GAME.BOSS_MINUTES.includes(minute) && !this.spawnedBossMinutes.has(minute)) {
      this.spawnedBossMinutes.add(minute);
      let bossKind: MonsterKind = 'boss_jelly';
      if (minute === 10) bossKind = 'boss_acorn';
      else if (minute === 15) bossKind = 'boss_ghost';
      else if (minute >= 20) bossKind = 'boss_final';

      this.spawnSingleMonster(bossKind, true);
      sound.playBossSpawn();
      this.triggerShake(0.35, 7);
    }
  }

  private getCurrentWaveConfig(): WaveMinuteConfig {
    const min = Math.min(19, Math.floor(this.elapsedSeconds / 60));
    return CONFIG.WAVES[min] || CONFIG.WAVES[CONFIG.WAVES.length - 1];
  }

  private updatePlayer(dt: number): void {
    if (this.player.invulnTimer > 0) {
      this.player.invulnTimer = Math.max(0, this.player.invulnTimer - dt);
    }
    if (this.player.fishSwingTimer > 0) {
      this.player.fishSwingTimer = Math.max(0, this.player.fishSwingTimer - dt);
    }

    let dx = this.touchMoveX;
    let dy = this.touchMoveY;

    if (this.heldKeys.has('KeyW') || this.heldKeys.has('ArrowUp')) dy -= 1;
    if (this.heldKeys.has('KeyS') || this.heldKeys.has('ArrowDown')) dy += 1;
    if (this.heldKeys.has('KeyA') || this.heldKeys.has('ArrowLeft')) dx -= 1;
    if (this.heldKeys.has('KeyD') || this.heldKeys.has('ArrowRight')) dx += 1;

    const len = Math.hypot(dx, dy);
    if (len > 0.01) {
      dx /= len;
      dy /= len;
      const spd = CONFIG.PLAYER.BASE_SPEED * this.getSpeedMultiplier();
      this.player.x += dx * spd * dt;
      this.player.y += dy * spd * dt;
      this.player.isMoving = true;
      this.player.walkTime += dt * 11;
      this.player.moveDirX = dx;
      this.player.moveDirY = dy;
      if (Math.abs(dx) > 0.1) {
        this.player.facing = dx >= 0 ? 1 : -1;
      }
    } else {
      this.player.isMoving = false;
      this.player.walkTime += dt * 3;
    }
  }

  private updateSpawning(dt: number): void {
    const wave = this.getCurrentWaveConfig();
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;

    // Ease spawn rate slightly past 20:00 while fighting Final Boss
    const post20Factor = this.elapsedSeconds >= CONFIG.GAME.TARGET_SURVIVAL_SECONDS ? 1.5 : 1;
    this.spawnTimer = wave.spawnInterval * post20Factor;

    if (this.activeMonsterIndices.length >= wave.maxActive) return;

    const entries = Object.entries(wave.weights) as Array<[MonsterKind, number]>;
    let totalWeight = 0;
    for (let i = 0; i < entries.length; i++) totalWeight += entries[i][1];
    if (totalWeight <= 0) return;

    const toSpawn = Math.min(
      wave.batchSize,
      wave.maxActive - this.activeMonsterIndices.length
    );

    for (let i = 0; i < toSpawn; i++) {
      let r = Math.random() * totalWeight;
      let chosen: MonsterKind = entries[0][0];
      for (let j = 0; j < entries.length; j++) {
        r -= entries[j][1];
        if (r <= 0) {
          chosen = entries[j][0];
          break;
        }
      }
      this.spawnSingleMonster(chosen, false);
    }

    if (Math.random() < wave.eliteChance && this.activeMonsterIndices.length < wave.maxActive) {
      this.spawnSingleMonster('golem', false);
    }
  }

  private spawnSingleMonster(kind: MonsterKind, isBossSpawn: boolean): void {
    let slotIdx = -1;
    for (let i = 0; i < this.monsters.length; i++) {
      if (!this.monsters[i].active) {
        slotIdx = i;
        break;
      }
    }
    if (slotIdx === -1) return;

    const cfg = CONFIG.MONSTERS[kind];
    const wave = this.getCurrentWaveConfig();

    const viewW = this.canvas.clientWidth || 1280;
    const viewH = this.canvas.clientHeight || 720;
    const halfDiag = Math.hypot(viewW * 0.5, viewH * 0.5) + CONFIG.GAME.SPAWN_MARGIN;
    const angle = Math.random() * Math.PI * 2;
    const dist = isBossSpawn ? Math.min(halfDiag, 460) : halfDiag + Math.random() * 70;

    const m = this.monsters[slotIdx];
    m.active = true;
    m.kind = kind;
    m.x = this.player.x + Math.cos(angle) * dist;
    m.y = this.player.y + Math.sin(angle) * dist;
    m.vx = 0;
    m.vy = 0;

    const timeScaleHp = isBossSpawn
      ? 1 + Math.max(0, this.elapsedSeconds - 1200) * 0.015
      : wave.hpMult;
    m.maxHp = Math.round(cfg.baseHp * timeScaleHp);
    m.hp = m.maxHp;
    m.speed = cfg.speed * (isBossSpawn ? 1 : wave.speedMult);
    m.damage = Math.round(cfg.damage * (1 + Math.floor(this.elapsedSeconds / 300) * 0.15));
    m.radius = cfg.radius;
    m.expValue = cfg.expValue;
    m.coinChance = cfg.coinChance;
    m.isElite = Boolean(cfg.isElite);
    m.isBoss = Boolean(cfg.isBoss);
    m.facing = m.x >= this.player.x ? -1 : 1;
    m.animTime = Math.random() * 10;
    m.hitFlash = 0;
    m.shieldHitCooldown = 0;
    m.swordHitId = 0;
    m.bossAttackTimer = 4.0;
    m.bossTelegraphTimer = 0;

    this.activeMonsterIndices.push(slotIdx);
  }

  private updateCratesSpawning(dt: number): void {
    this.crateTimer -= dt;
    if (this.crateTimer > 0) return;
    this.crateTimer = CONFIG.GAME.CRATE_SPAWN_INTERVAL;

    let activeCount = 0;
    for (let i = 0; i < this.crates.length; i++) {
      if (this.crates[i].active) activeCount++;
    }
    if (activeCount < 5) {
      this.spawnCrateNearPlayer(420 + Math.random() * 260);
    }
  }

  private spawnCrateNearPlayer(dist: number): void {
    for (let i = 0; i < this.crates.length; i++) {
      if (!this.crates[i].active) {
        const ang = Math.random() * Math.PI * 2;
        this.crates[i].active = true;
        this.crates[i].x = this.player.x + Math.cos(ang) * dist;
        this.crates[i].y = this.player.y + Math.sin(ang) * dist;
        this.crates[i].hp = 20;
        this.crates[i].hitFlash = 0;
        return;
      }
    }
  }

  private updateWeapons(dt: number): void {
    const mightMult = this.getMightMultiplier();
    const cdMult = this.getCooldownMultiplier();

    for (let i = 0; i < this.weapons.length; i++) {
      const owned = this.weapons[i];
      const def = CONFIG.WEAPONS[owned.id];
      const stats = owned.evolved ? def.evolvedStats : def.levels[owned.level - 1];

      if (owned.id === 'shield') {
        this.updateGuardianShields(owned, stats, mightMult, dt);
        continue;
      }

      owned.timer -= dt;
      if (owned.timer > 0) continue;
      owned.timer = stats.cooldown * cdMult;

      switch (owned.id) {
        case 'greatsword':
          this.fireGreatsword(owned, stats, mightMult);
          break;
        case 'shuriken':
          this.fireShuriken(owned, stats, mightMult);
          break;
        case 'orb':
          this.fireOrb(owned, stats, mightMult);
          break;
        case 'arrow':
          this.fireArrows(owned, stats, mightMult);
          break;
        case 'holy':
          this.fireHolyLight(owned, stats, mightMult);
          break;
      }
    }
  }

  private fireGreatsword(
    owned: OwnedWeapon,
    stats: ReturnType<() => typeof CONFIG.WEAPONS.greatsword.evolvedStats>,
    mightMult: number
  ): void {
    sound.playSlash(owned.evolved);
    this.player.fishSwingTimer = this.player.fishSwingDuration;
    const baseAngle = this.player.facing >= 0 ? 0 : Math.PI;
    const dirs = stats.count >= 2 ? [0, Math.PI] : [0];
    const dmg = stats.damage * mightMult;
    const swingId = ++this.swordSwingCounter;

    for (let d = 0; d < dirs.length; d++) {
      const ang = baseAngle + dirs[d];
      this.spawnSlashEffect(
        this.player.x,
        this.player.y,
        ang,
        owned.evolved ? 155 : stats.area,
        owned.evolved
      );
      this.spawnStarBurst(
        this.player.x + Math.cos(ang) * 44,
        this.player.y + Math.sin(ang) * 44,
        owned.evolved ? 6 : 3,
        '#bae6fd'
      );

      // Immediate melee cleave check via SpatialGrid
      const meleeRadius = owned.evolved ? 165 : stats.area;
      const candidates = this.grid.query(this.player.x, this.player.y, meleeRadius + 40);
      const dirX = Math.cos(ang);
      const dirY = Math.sin(ang);

      for (let c = 0; c < candidates.length; c++) {
        const mIdx = candidates[c];
        const m = this.monsters[mIdx];
        if (!m.active || m.swordHitId === swingId) continue;
        const dx = m.x - this.player.x;
        const dy = m.y - this.player.y;
        const dist = Math.hypot(dx, dy);
        if (dist > meleeRadius + m.radius) continue;
        const dot = (dx * dirX + dy * dirY) / (dist || 1);
        if (dot >= -0.18 || dist < 36) {
          m.swordHitId = swingId;
          this.damageMonster(mIdx, dmg, stats.critChance, owned, dirX * 140, dirY * 140);
        }
      }

      // Hit crates in melee arc
      this.hitCratesInRadius(this.player.x + dirX * 45, this.player.y + dirY * 45, meleeRadius * 0.75, dmg);

      // Evolved Greatsword also launches massive half-screen crescent waves!
      if (owned.evolved) {
        this.spawnProjectile({
          weaponId: 'greatsword',
          style: 'sword_wave',
          x: this.player.x + dirX * 30,
          y: this.player.y + dirY * 30,
          vx: dirX * stats.speed,
          vy: dirY * stats.speed,
          radius: 78,
          damage: dmg * 0.9,
          critChance: stats.critChance,
          pierceLeft: 99,
          maxLife: 0.95,
          evolved: true,
          explosionRadius: 0,
          targetIdx: -1,
        });
      }
    }
  }

  private fireShuriken(
    owned: OwnedWeapon,
    stats: typeof CONFIG.WEAPONS.shuriken.evolvedStats,
    mightMult: number
  ): void {
    const nearest = this.findNearestMonsters(this.player.x, this.player.y, 560, stats.count);
    if (nearest.length === 0 && !owned.evolved) return;

    sound.playShuriken();
    const dmg = stats.damage * mightMult;

    for (let i = 0; i < stats.count; i++) {
      let ang: number;
      if (owned.evolved && nearest.length === 0) {
        ang = Math.random() * Math.PI * 2;
      } else if (nearest.length > 0) {
        const target = this.monsters[nearest[i % nearest.length]];
        ang = Math.atan2(target.y - this.player.y, target.x - this.player.x);
        if (i >= nearest.length || owned.evolved) {
          ang += (i - (stats.count - 1) * 0.5) * 0.24;
        }
      } else {
        ang = (Math.PI * 2 * i) / stats.count;
      }

      this.spawnProjectile({
        weaponId: 'shuriken',
        style: 'shuriken',
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(ang) * stats.speed,
        vy: Math.sin(ang) * stats.speed,
        radius: stats.area,
        damage: dmg,
        critChance: stats.critChance,
        pierceLeft: stats.pierce,
        maxLife: owned.evolved ? 1.65 : 1.4,
        evolved: owned.evolved,
        explosionRadius: 0,
        targetIdx: -1,
      });
    }
  }

  private fireOrb(
    owned: OwnedWeapon,
    stats: typeof CONFIG.WEAPONS.orb.evolvedStats,
    mightMult: number
  ): void {
    const nearest = this.findNearestMonsters(this.player.x, this.player.y, 620, stats.count);
    if (nearest.length === 0) return;

    sound.playOrb();
    const dmg = stats.damage * mightMult;

    for (let i = 0; i < stats.count; i++) {
      const targetIdx = nearest[i % nearest.length];
      const target = this.monsters[targetIdx];
      const ang = Math.atan2(target.y - this.player.y, target.x - this.player.x) + (i - 0.5) * 0.16;

      this.spawnProjectile({
        weaponId: 'orb',
        style: 'orb',
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(ang) * stats.speed,
        vy: Math.sin(ang) * stats.speed,
        radius: owned.evolved ? 18 : stats.area * 0.72,
        damage: dmg,
        critChance: stats.critChance,
        pierceLeft: stats.pierce,
        maxLife: 2.3,
        evolved: owned.evolved,
        explosionRadius: owned.evolved ? stats.area : 0,
        targetIdx,
      });
    }
  }

  private fireArrows(
    owned: OwnedWeapon,
    stats: typeof CONFIG.WEAPONS.arrow.evolvedStats,
    mightMult: number
  ): void {
    sound.playArrow();
    const baseAngle = Math.atan2(this.player.moveDirY, this.player.moveDirX);
    const dmg = stats.damage * mightMult;
    const spreadStep = owned.evolved ? 0.11 : 0.14;

    for (let i = 0; i < stats.count; i++) {
      const offset = (i - (stats.count - 1) * 0.5) * spreadStep;
      const ang = baseAngle + offset;

      this.spawnProjectile({
        weaponId: 'arrow',
        style: 'arrow',
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(ang) * stats.speed,
        vy: Math.sin(ang) * stats.speed,
        radius: stats.area,
        damage: dmg,
        critChance: stats.critChance,
        pierceLeft: stats.pierce,
        maxLife: 1.35,
        evolved: owned.evolved,
        explosionRadius: 0,
        targetIdx: -1,
      });
    }

    // Evolved Arrow Rain drops extra arrows from above onto nearby clusters!
    if (owned.evolved) {
      const targets = this.findNearestMonsters(this.player.x, this.player.y, 440, 3);
      for (let t = 0; t < targets.length; t++) {
        const m = this.monsters[targets[t]];
        this.spawnProjectile({
          weaponId: 'arrow',
          style: 'arrow_rain',
          x: m.x + (Math.random() - 0.5) * 40,
          y: m.y - 260,
          vx: 0,
          vy: 780,
          radius: 26,
          damage: dmg * 1.15,
          critChance: stats.critChance,
          pierceLeft: 12,
          maxLife: 0.55,
          evolved: true,
          explosionRadius: 0,
          targetIdx: -1,
        });
      }
    }
  }

  private updateGuardianShields(
    owned: OwnedWeapon,
    stats: typeof CONFIG.WEAPONS.shield.evolvedStats,
    mightMult: number,
    dt: number
  ): void {
    this.player.shieldAngle += stats.speed * dt;
    const dmg = stats.damage * mightMult;
    const shieldHitRadius = owned.evolved ? 22 : 15;

    for (let i = 0; i < stats.count; i++) {
      const ang = this.player.shieldAngle + (Math.PI * 2 * i) / stats.count;
      const sx = this.player.x + Math.cos(ang) * stats.area;
      const sy = this.player.y + Math.sin(ang) * stats.area;

      const candidates = this.grid.query(sx, sy, shieldHitRadius + 36);
      for (let c = 0; c < candidates.length; c++) {
        const mIdx = candidates[c];
        const m = this.monsters[mIdx];
        if (!m.active || m.shieldHitCooldown > 0) continue;
        const dist = Math.hypot(m.x - sx, m.y - sy);
        if (dist <= m.radius + shieldHitRadius) {
          m.shieldHitCooldown = 0.34;
          const kbDirX = (m.x - this.player.x) / (Math.hypot(m.x - this.player.x, m.y - this.player.y) || 1);
          const kbDirY = (m.y - this.player.y) / (Math.hypot(m.x - this.player.x, m.y - this.player.y) || 1);
          this.damageMonster(mIdx, dmg, stats.critChance, owned, kbDirX * 165, kbDirY * 165);
        }
      }

      this.hitCratesInRadius(sx, sy, shieldHitRadius + 10, dmg);
    }
  }

  private fireHolyLight(
    owned: OwnedWeapon,
    stats: typeof CONFIG.WEAPONS.holy.evolvedStats,
    mightMult: number
  ): void {
    sound.playHoly();
    const dmg = stats.damage * mightMult;
    const targets = this.findNearestMonsters(this.player.x, this.player.y, 440, stats.count);

    for (let i = 0; i < stats.count; i++) {
      let px: number;
      let py: number;
      if (i < targets.length) {
        const m = this.monsters[targets[i]];
        px = m.x + (Math.random() - 0.5) * 24;
        py = m.y + (Math.random() - 0.5) * 24;
      } else {
        const ang = Math.random() * Math.PI * 2;
        const r = 70 + Math.random() * 210;
        px = this.player.x + Math.cos(ang) * r;
        py = this.player.y + Math.sin(ang) * r;
      }

      this.spawnHolyPillar(px, py, stats.area, owned.evolved);

      const candidates = this.grid.query(px, py, stats.area + 36);
      for (let c = 0; c < candidates.length; c++) {
        const mIdx = candidates[c];
        const m = this.monsters[mIdx];
        if (!m.active) continue;
        if (Math.hypot(m.x - px, m.y - py) <= stats.area + m.radius) {
          this.damageMonster(mIdx, dmg, stats.critChance, owned, 0, 0);
        }
      }
      this.hitCratesInRadius(px, py, stats.area, dmg);
    }
  }

  private updateMonsters(dt: number): void {
    // Rebuild SpatialGrid every frame with zero allocations
    this.grid.clear();
    for (let i = 0; i < this.activeMonsterIndices.length; i++) {
      const idx = this.activeMonsterIndices[i];
      const m = this.monsters[idx];
      this.grid.insert(idx, m.x, m.y);
    }

    const viewW = this.canvas.clientWidth || 1280;
    const viewH = this.canvas.clientHeight || 720;
    const despawnDist = Math.hypot(viewW * 0.5, viewH * 0.5) + 420;

    for (let i = this.activeMonsterIndices.length - 1; i >= 0; i--) {
      const idx = this.activeMonsterIndices[i];
      const m = this.monsters[idx];
      if (!m.active) {
        this.activeMonsterIndices.splice(i, 1);
        continue;
      }

      m.animTime += dt * 7;
      if (m.hitFlash > 0) m.hitFlash = Math.max(0, m.hitFlash - dt);
      if (m.shieldHitCooldown > 0) m.shieldHitCooldown = Math.max(0, m.shieldHitCooldown - dt);

      const dx = this.player.x - m.x;
      const dy = this.player.y - m.y;
      const dist = Math.hypot(dx, dy);

      // Despawn far non-boss monsters and recycle them closer to player edge
      if (!m.isBoss && dist > despawnDist) {
        const ang = Math.random() * Math.PI * 2;
        const r = Math.hypot(viewW * 0.5, viewH * 0.5) + 70;
        m.x = this.player.x + Math.cos(ang) * r;
        m.y = this.player.y + Math.sin(ang) * r;
        continue;
      }

      // Boss special telegraph attack!
      if (m.isBoss) {
        if (m.bossTelegraphTimer > 0) {
          m.bossTelegraphTimer -= dt;
          if (m.bossTelegraphTimer <= 0) {
            // Unleash radial burst shockwave
            this.spawnShockwave(m.bossTelegraphX, m.bossTelegraphY, 130, '#ef4444');
            this.triggerShake(0.18, 4);
            if (Math.hypot(this.player.x - m.bossTelegraphX, this.player.y - m.bossTelegraphY) < 130) {
              this.damagePlayer(Math.round(m.damage * 1.35));
            }
          }
        } else {
          m.bossAttackTimer -= dt;
          if (m.bossAttackTimer <= 0 && dist < 380) {
            m.bossAttackTimer = m.kind === 'boss_final' ? 3.8 : 5.2;
            m.bossTelegraphTimer = 1.1;
            m.bossTelegraphX = this.player.x;
            m.bossTelegraphY = this.player.y;
          }
        }
      }

      const dirX = dist > 0.001 ? dx / dist : 0;
      const dirY = dist > 0.001 ? dy / dist : 0;

      // Soft separation using spatial grid so 500+ monsters don't stack on a single point
      let sepX = 0;
      let sepY = 0;
      const neighbors = this.grid.query(m.x, m.y, m.radius * 2.2);
      const maxCheck = Math.min(neighbors.length, 14);
      for (let n = 0; n < maxCheck; n++) {
        const nIdx = neighbors[n];
        if (nIdx === idx) continue;
        const other = this.monsters[nIdx];
        const odx = m.x - other.x;
        const ody = m.y - other.y;
        const minDist = m.radius + other.radius;
        const dSq = odx * odx + ody * ody;
        if (dSq > 0.01 && dSq < minDist * minDist) {
          const d = Math.sqrt(dSq);
          const push = (minDist - d) / minDist;
          sepX += (odx / d) * push * 95;
          sepY += (ody / d) * push * 95;
        }
      }

      // Decay knockback velocity smoothly
      m.vx *= Math.pow(0.05, dt);
      m.vy *= Math.pow(0.05, dt);

      m.x += (dirX * m.speed + sepX + m.vx) * dt;
      m.y += (dirY * m.speed + sepY + m.vy) * dt;

      if (Math.abs(dirX) > 0.05) {
        m.facing = dirX >= 0 ? 1 : -1;
      }

      // Player contact damage
      if (dist < m.radius + CONFIG.PLAYER.RADIUS - 2) {
        this.damagePlayer(m.damage);
      }
    }
  }

  private damagePlayer(amount: number): void {
    if (this.player.invulnTimer > 0 || this.phase !== 'PLAYING') return;
    this.player.hp = Math.max(0, this.player.hp - amount);
    this.player.invulnTimer = CONFIG.PLAYER.INVULN_DURATION;
    sound.playPlayerHurt();
    this.triggerShake(0.18, 5);
    this.spawnDamageNumber(this.player.x, this.player.y - 24, `-${amount}`, true, false);

    if (this.player.hp <= 0) {
      this.phase = 'GAME_OVER';
      this.clearKeys();
      this.emitHud();
    }
  }

  private updateProjectiles(dt: number): void {
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      // Homing steering for Magic Orb
      if (p.style === 'orb') {
        if (p.targetIdx < 0 || !this.monsters[p.targetIdx]?.active) {
          const nearest = this.findNearestMonsters(p.x, p.y, 380, 1);
          p.targetIdx = nearest.length > 0 ? nearest[0] : -1;
        }
        if (p.targetIdx >= 0) {
          const t = this.monsters[p.targetIdx];
          const desiredAng = Math.atan2(t.y - p.y, t.x - p.x);
          const spd = Math.hypot(p.vx, p.vy);
          const curAng = Math.atan2(p.vy, p.vx);
          let diff = desiredAng - curAng;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const turnRate = (p.evolved ? 6.5 : 5.2) * dt;
          const nextAng = curAng + Math.max(-turnRate, Math.min(turnRate, diff));
          p.vx = Math.cos(nextAng) * spd;
          p.vy = Math.sin(nextAng) * spd;
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.style === 'shuriken') {
        p.spin += dt * 18;
      }

      // Check crates
      this.hitCratesInRadius(p.x, p.y, p.radius + 6, p.damage);

      // Check monsters via SpatialGrid
      const candidates = this.grid.query(p.x, p.y, p.radius + 42);
      const ownerWeapon = this.weapons.find((w) => w.id === p.weaponId);

      for (let c = 0; c < candidates.length; c++) {
        const mIdx = candidates[c];
        if (p.hitSet.has(mIdx)) continue;
        const m = this.monsters[mIdx];
        if (!m.active) continue;

        if (Math.hypot(m.x - p.x, m.y - p.y) <= p.radius + m.radius) {
          p.hitSet.add(mIdx);

          if (p.style === 'orb' && p.evolved && p.explosionRadius > 0) {
            // Nova Core Orb AoE detonation!
            this.spawnShockwave(p.x, p.y, p.explosionRadius, '#c084fc');
            this.spawnStarBurst(p.x, p.y, 10, '#f0abfc');
            const blastTargets = this.grid.query(p.x, p.y, p.explosionRadius + 30);
            for (let b = 0; b < blastTargets.length; b++) {
              const bIdx = blastTargets[b];
              const bm = this.monsters[bIdx];
              if (!bm.active) continue;
              if (Math.hypot(bm.x - p.x, bm.y - p.y) <= p.explosionRadius + bm.radius) {
                this.damageMonster(bIdx, p.damage, p.critChance, ownerWeapon, 0, 0);
              }
            }
            p.active = false;
            break;
          } else {
            const spd = Math.hypot(p.vx, p.vy) || 1;
            this.damageMonster(
              mIdx,
              p.damage,
              p.critChance,
              ownerWeapon,
              (p.vx / spd) * 75,
              (p.vy / spd) * 75
            );
            p.pierceLeft -= 1;
            if (p.pierceLeft <= 0) {
              p.active = false;
              break;
            }
          }
        }
      }
    }
  }

  private damageMonster(
    mIdx: number,
    rawDamage: number,
    critChance: number,
    weapon: OwnedWeapon | undefined,
    kbX: number,
    kbY: number
  ): void {
    const m = this.monsters[mIdx];
    if (!m.active) return;

    const isCrit = Math.random() < critChance;
    const dmg = Math.max(1, Math.round(rawDamage * (isCrit ? 1.85 : 1) * (0.95 + Math.random() * 0.1)));
    m.hp -= dmg;
    m.hitFlash = 0.09;

    const cfg = CONFIG.MONSTERS[m.kind];
    const resist = 1 - cfg.knockbackResist;
    m.vx += kbX * resist;
    m.vy += kbY * resist;

    if (weapon) {
      weapon.totalDamage += dmg;
    }

    sound.playHit(isCrit);
    this.spawnDamageNumber(m.x, m.y - m.radius - 6, `${dmg}${isCrit ? '!' : ''}`, isCrit, false);

    if (m.hp <= 0) {
      this.killMonster(mIdx);
    }
  }

  private killMonster(mIdx: number): void {
    const m = this.monsters[mIdx];
    if (!m.active) return;
    m.active = false;
    this.player.kills += 1;

    // Star death particle burst
    const starColor =
      m.kind === 'jelly' || m.kind === 'boss_jelly'
        ? '#6ee7b7'
        : m.kind === 'ghost' || m.kind === 'boss_ghost'
          ? '#d8b4fe'
          : '#fde047';
    this.spawnStarBurst(m.x, m.y, m.isBoss ? 22 : m.isElite ? 12 : 5, starColor);

    // Drops
    if (m.kind === 'boss_final') {
      sound.playVictory();
      this.phase = 'VICTORY';
      this.clearKeys();
      this.emitHud();
      return;
    }

    if (m.isBoss || m.isElite) {
      this.spawnPickup('chest', m.x, m.y, 1, true);
      if (m.isBoss) {
        this.triggerShake(0.28, 6);
        for (let i = 0; i < 6; i++) {
          const ang = (Math.PI * 2 * i) / 6;
          this.spawnPickup('coin', m.x + Math.cos(ang) * 24, m.y + Math.sin(ang) * 24, 5, true);
          this.spawnPickup('exp_large', m.x + Math.cos(ang) * 32, m.y + Math.sin(ang) * 32, 20, true);
        }
      }
    } else {
      const gemKind: PickupKind =
        m.expValue >= 18 ? 'exp_large' : m.expValue >= 5 ? 'exp_medium' : 'exp_small';
      this.spawnPickup(gemKind, m.x, m.y, m.expValue, true);

      if (Math.random() < m.coinChance) {
        this.spawnPickup('coin', m.x + (Math.random() - 0.5) * 14, m.y + (Math.random() - 0.5) * 14, 1, true);
      }
    }
  }

  private hitCratesInRadius(x: number, y: number, radius: number, dmg: number): void {
    for (let i = 0; i < this.crates.length; i++) {
      const c = this.crates[i];
      if (!c.active) continue;
      if (Math.hypot(c.x - x, c.y - y) <= radius + 16) {
        c.hp -= dmg;
        c.hitFlash = 0.08;
        if (c.hp <= 0) {
          c.active = false;
          this.spawnStarBurst(c.x, c.y, 8, '#e09f3e');
          const roll = Math.random();
          const drop: PickupKind =
            roll < 0.45 ? 'potion' : roll < 0.78 ? 'magnet_all' : 'bomb';
          this.spawnPickup(drop, c.x, c.y, 1, true);
        }
      }
    }
  }

  private updatePickups(dt: number): void {
    const magnetRad = this.getMagnetRadius();

    for (let i = 0; i < this.pickups.length; i++) {
      const pk = this.pickups[i];
      if (!pk.active) continue;

      pk.bobPhase += dt * 4;
      if (pk.popZ > 0 || pk.popVz !== 0) {
        pk.popZ += pk.popVz * dt;
        pk.popVz -= 340 * dt;
        if (pk.popZ <= 0) {
          pk.popZ = 0;
          pk.popVz = 0;
        }
      }

      const dx = this.player.x - pk.x;
      const dy = this.player.y - pk.y;
      const dist = Math.hypot(dx, dy);

      // Chests, potions, magnets, bombs require walking close (unless mega-magnet for gems/coins)
      const isGemOrCoin =
        pk.kind === 'exp_small' ||
        pk.kind === 'exp_medium' ||
        pk.kind === 'exp_large' ||
        pk.kind === 'coin';

      if (isGemOrCoin && dist <= magnetRad) {
        pk.magnetized = true;
      }

      if (pk.magnetized) {
        const pullSpeed = 480;
        const d = dist || 1;
        pk.x += (dx / d) * pullSpeed * dt;
        pk.y += (dy / d) * pullSpeed * dt;
      }

      if (dist <= CONFIG.PLAYER.PICKUP_COLLECT_RADIUS) {
        this.collectPickup(pk);
      }
    }
  }

  private collectPickup(pk: PickupSlot): void {
    pk.active = false;

    switch (pk.kind) {
      case 'exp_small':
      case 'exp_medium':
      case 'exp_large': {
        this.gemCombo += 1;
        this.gemComboTimer = 0.65;
        sound.playGem(this.gemCombo);
        this.player.exp += pk.value;
        if (this.player.exp >= this.player.expToNext) {
          this.triggerLevelUp();
        }
        break;
      }
      case 'coin':
        sound.playCoin();
        this.player.coins += pk.value;
        break;
      case 'potion': {
        sound.playGem(8);
        const heal = 35;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
        this.spawnDamageNumber(this.player.x, this.player.y - 26, `+${heal}`, false, true);
        this.spawnStarBurst(this.player.x, this.player.y, 8, '#4ade80');
        break;
      }
      case 'magnet_all': {
        sound.playChest();
        this.spawnShockwave(this.player.x, this.player.y, 160, '#38bdf8');
        for (let i = 0; i < this.pickups.length; i++) {
          const item = this.pickups[i];
          if (!item.active) continue;
          if (
            item.kind === 'exp_small' ||
            item.kind === 'exp_medium' ||
            item.kind === 'exp_large' ||
            item.kind === 'coin'
          ) {
            item.magnetized = true;
          }
        }
        break;
      }
      case 'bomb': {
        sound.playBomb();
        this.bombFlashTimer = 0.35;
        this.triggerShake(0.35, 9);
        this.spawnShockwave(this.player.x, this.player.y, 440, '#fde047');
        const viewW = (this.canvas.clientWidth || 1280) * 0.65;
        const viewH = (this.canvas.clientHeight || 720) * 0.65;
        for (let i = 0; i < this.activeMonsterIndices.length; i++) {
          const mIdx = this.activeMonsterIndices[i];
          const m = this.monsters[mIdx];
          if (!m.active) continue;
          if (
            Math.abs(m.x - this.player.x) < viewW &&
            Math.abs(m.y - this.player.y) < viewH
          ) {
            const bombDmg = m.isBoss ? Math.round(m.maxHp * 0.14) : 9999;
            this.damageMonster(mIdx, bombDmg, 0, undefined, 0, 0);
          }
        }
        break;
      }
      case 'chest': {
        this.openTreasureChest();
        break;
      }
    }
  }

  private openTreasureChest(): void {
    sound.playChest();
    this.triggerShake(0.22, 4);

    // 1. Check for eligible weapon evolution (Lv.8 + paired passive >= Lv.1)
    for (let i = 0; i < this.weapons.length; i++) {
      const w = this.weapons[i];
      if (w.evolved || w.level < 8) continue;
      const def = CONFIG.WEAPONS[w.id];
      if (this.getPassiveLevel(def.pairedPassive) >= 1) {
        w.evolved = true;
        this.chestReward = {
          type: 'evolution',
          title: `${def.evolvedName} 각성!`,
          subtitle: `${def.name} + ${CONFIG.PASSIVES[def.pairedPassive].name} 조합으로 무기가 진화했습니다!`,
          itemId: w.id,
          itemKind: 'weapon',
          coinsGained: 25,
          healGained: 25,
        };
        this.player.coins += 25;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 25);
        this.phase = 'CHEST';
        this.clearKeys();
        this.emitHud();
        return;
      }
    }

    // 2. Otherwise upgrade an existing non-max weapon or passive
    const upgradeableWeapons = this.weapons.filter((w) => w.level < 8);
    const upgradeablePassives = this.passives.filter((p) => p.level < 5);

    if (upgradeableWeapons.length > 0 || upgradeablePassives.length > 0) {
      const pickWeapon =
        upgradeableWeapons.length > 0 &&
        (upgradeablePassives.length === 0 || Math.random() < 0.7);
      if (pickWeapon) {
        const w = upgradeableWeapons[Math.floor(Math.random() * upgradeableWeapons.length)];
        w.level += 1;
        const def = CONFIG.WEAPONS[w.id];
        this.chestReward = {
          type: 'upgrade',
          title: `${def.name} Lv.${w.level} 강화!`,
          subtitle: def.levels[w.level - 1].summary,
          itemId: w.id,
          itemKind: 'weapon',
          coinsGained: 15,
          healGained: 15,
        };
      } else {
        const p = upgradeablePassives[Math.floor(Math.random() * upgradeablePassives.length)];
        p.level += 1;
        if (p.id === 'maxHp') {
          this.player.maxHp += CONFIG.PASSIVES.maxHp.bonusPerLevel;
        }
        const def = CONFIG.PASSIVES[p.id];
        this.chestReward = {
          type: 'upgrade',
          title: `${def.name} Lv.${p.level} 강화!`,
          subtitle: `${def.statLabel} ${def.formatValue(p.level)}`,
          itemId: p.id,
          itemKind: 'passive',
          coinsGained: 15,
          healGained: 15,
        };
      }
      this.player.coins += 15;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 15);
    } else {
      this.player.coins += 50;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 40);
      this.chestReward = {
        type: 'bonus',
        title: '황금 보물상자!',
        subtitle: '모든 장비가 최고 레벨입니다! 코인과 체력을 획득했습니다.',
        coinsGained: 50,
        healGained: 40,
      };
    }

    this.phase = 'CHEST';
    this.clearKeys();
    this.emitHud();
  }

  private triggerLevelUp(): void {
    this.player.exp -= this.player.expToNext;
    this.player.level += 1;
    this.player.expToNext = CONFIG.EXP.requirementForLevel(this.player.level);

    sound.playLevelUp();
    this.levelUpBeamTimer = 1.25;
    this.spawnStarBurst(this.player.x, this.player.y - 16, 14, '#fde047');

    this.upgradeChoices = this.generateUpgradeChoices(3);
    if (this.upgradeChoices.length === 0) {
      // Maxed everything: grant bonus heal + coins
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20);
      this.player.coins += 20;
      this.emitHud();
      return;
    }

    this.phase = 'LEVEL_UP';
    this.clearKeys();
    this.emitHud();
  }

  private generateUpgradeChoices(count: number): UpgradeChoice[] {
    const pool: UpgradeChoice[] = [];
    const weaponIds = Object.keys(CONFIG.WEAPONS) as WeaponId[];
    const passiveIds = Object.keys(CONFIG.PASSIVES) as PassiveId[];

    const canAddNewWeapon = this.weapons.length < 6;
    const canAddNewPassive = this.passives.length < 5;

    for (const wid of weaponIds) {
      const def = CONFIG.WEAPONS[wid];
      const owned = this.weapons.find((w) => w.id === wid);
      if (owned) {
        if (owned.level < 8) {
          const nextLvl = owned.level + 1;
          const curStats = def.levels[owned.level - 1];
          const nextStats = def.levels[nextLvl - 1];
          const paired = CONFIG.PASSIVES[def.pairedPassive];
          pool.push({
            kind: 'weapon',
            id: wid,
            name: def.name,
            isNew: false,
            currentLevel: owned.level,
            nextLevel: nextLvl,
            maxLevel: 8,
            description: nextStats.summary,
            effectDiff: `피해 ${curStats.damage}→${nextStats.damage} · 개수 ${curStats.count}→${nextStats.count}`,
            synergyHint: `진화 조합: ${paired.name}`,
            accentColor: def.accentColor,
          });
        }
      } else if (canAddNewWeapon) {
        const s1 = def.levels[0];
        const paired = CONFIG.PASSIVES[def.pairedPassive];
        pool.push({
          kind: 'weapon',
          id: wid,
          name: def.name,
          isNew: true,
          currentLevel: 0,
          nextLevel: 1,
          maxLevel: 8,
          description: def.description,
          effectDiff: s1.summary,
          synergyHint: `진화 조합: ${paired.name}`,
          accentColor: def.accentColor,
        });
      }
    }

    for (const pid of passiveIds) {
      const def = CONFIG.PASSIVES[pid];
      const owned = this.passives.find((p) => p.id === pid);
      if (owned) {
        if (owned.level < def.maxLevel) {
          const nextLvl = owned.level + 1;
          pool.push({
            kind: 'passive',
            id: pid,
            name: def.name,
            isNew: false,
            currentLevel: owned.level,
            nextLevel: nextLvl,
            maxLevel: def.maxLevel,
            description: def.description,
            effectDiff: `${def.statLabel} ${def.formatValue(owned.level)} → ${def.formatValue(nextLvl)}`,
            accentColor: def.accentColor,
          });
        }
      } else if (canAddNewPassive) {
        pool.push({
          kind: 'passive',
          id: pid,
          name: def.name,
          isNew: true,
          currentLevel: 0,
          nextLevel: 1,
          maxLevel: def.maxLevel,
          description: def.description,
          effectDiff: `${def.statLabel} ${def.formatValue(1)}`,
          accentColor: def.accentColor,
        });
      }
    }

    // Shuffle Fisher-Yates
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }

    return pool.slice(0, count);
  }

  private updateVisualEffects(dt: number): void {
    for (let i = 0; i < this.crates.length; i++) {
      if (this.crates[i].active && this.crates[i].hitFlash > 0) {
        this.crates[i].hitFlash = Math.max(0, this.crates[i].hitFlash - dt);
      }
    }

    for (let i = 0; i < this.damageNumbers.length; i++) {
      const dn = this.damageNumbers[i];
      if (!dn.active) continue;
      dn.life -= dt;
      if (dn.life <= 0) {
        dn.active = false;
        continue;
      }
      dn.y += dn.vy * dt;
      dn.vy *= Math.pow(0.15, dt);
    }

    for (let i = 0; i < this.particles.length; i++) {
      const pt = this.particles[i];
      if (!pt.active) continue;
      pt.life -= dt;
      if (pt.life <= 0) {
        pt.active = false;
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= Math.pow(0.12, dt);
      pt.vy *= Math.pow(0.12, dt);
    }

    for (let i = 0; i < this.slashes.length; i++) {
      const sl = this.slashes[i];
      if (!sl.active) continue;
      sl.life -= dt;
      if (sl.life <= 0) sl.active = false;
    }

    for (let i = 0; i < this.holyPillars.length; i++) {
      const hp = this.holyPillars[i];
      if (!hp.active) continue;
      hp.life -= dt;
      if (hp.life <= 0) {
        hp.active = false;
        continue;
      }
      // Evolved Holy Pillar heals player when light touches them!
      if (
        hp.evolved &&
        !hp.healedPlayer &&
        Math.hypot(this.player.x - hp.x, this.player.y - hp.y) <= hp.radius + CONFIG.PLAYER.RADIUS
      ) {
        hp.healedPlayer = true;
        const healAmt = 3;
        if (this.player.hp < this.player.maxHp) {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmt);
          this.spawnDamageNumber(this.player.x, this.player.y - 26, `+${healAmt}`, false, true);
        }
      }
    }

    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) continue;
      sw.life -= dt;
      if (sw.life <= 0) sw.active = false;
    }
  }

  // Helper Spawners
  private findNearestMonsters(x: number, y: number, maxRange: number, limit: number): number[] {
    const candidates = this.grid.query(x, y, maxRange);
    const list: Array<{ idx: number; distSq: number }> = [];
    const maxRangeSq = maxRange * maxRange;

    for (let i = 0; i < candidates.length; i++) {
      const idx = candidates[i];
      const m = this.monsters[idx];
      if (!m.active) continue;
      const dx = m.x - x;
      const dy = m.y - y;
      const dSq = dx * dx + dy * dy;
      if (dSq <= maxRangeSq) {
        list.push({ idx, distSq: dSq });
      }
    }
    list.sort((a, b) => a.distSq - b.distSq);
    return list.slice(0, limit).map((e) => e.idx);
  }

  private spawnProjectile(cfg: Omit<ProjectileSlot, 'active' | 'life' | 'spin' | 'hitSet'>): void {
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (!p.active) {
        p.active = true;
        p.weaponId = cfg.weaponId;
        p.style = cfg.style;
        p.x = cfg.x;
        p.y = cfg.y;
        p.vx = cfg.vx;
        p.vy = cfg.vy;
        p.radius = cfg.radius;
        p.damage = cfg.damage;
        p.critChance = cfg.critChance;
        p.pierceLeft = cfg.pierceLeft;
        p.life = cfg.maxLife;
        p.maxLife = cfg.maxLife;
        p.spin = 0;
        p.evolved = cfg.evolved;
        p.explosionRadius = cfg.explosionRadius;
        p.hitSet.clear();
        p.targetIdx = cfg.targetIdx;
        return;
      }
    }
  }

  private spawnPickup(kind: PickupKind, x: number, y: number, value: number, pop: boolean): void {
    for (let i = 0; i < this.pickups.length; i++) {
      const pk = this.pickups[i];
      if (!pk.active) {
        pk.active = true;
        pk.kind = kind;
        pk.x = x;
        pk.y = y;
        pk.value = value;
        pk.magnetized = false;
        pk.bobPhase = Math.random() * Math.PI * 2;
        pk.popZ = pop ? 2 : 0;
        pk.popVz = pop ? 95 + Math.random() * 55 : 0;
        return;
      }
    }
  }

  private spawnDamageNumber(
    x: number,
    y: number,
    text: string,
    isCrit: boolean,
    isHeal: boolean
  ): void {
    // Stack upward if another active damage number is nearby so they don't overlap!
    let adjustedY = y;
    for (let i = 0; i < this.damageNumbers.length; i++) {
      const other = this.damageNumbers[i];
      if (!other.active) continue;
      if (Math.abs(other.x - x) < 26 && Math.abs(other.y - adjustedY) < 16) {
        adjustedY -= 16;
      }
    }

    for (let i = 0; i < this.damageNumbers.length; i++) {
      const dn = this.damageNumbers[i];
      if (!dn.active) {
        dn.active = true;
        dn.x = x + (Math.random() - 0.5) * 10;
        dn.y = adjustedY;
        dn.vy = isCrit ? -68 : -50;
        dn.text = text;
        dn.isCrit = isCrit;
        dn.isHeal = isHeal;
        dn.life = isCrit ? 0.78 : 0.62;
        dn.maxLife = dn.life;
        return;
      }
    }
  }

  private spawnStarBurst(x: number, y: number, count: number, color: string): void {
    let spawned = 0;
    for (let i = 0; i < this.particles.length && spawned < count; i++) {
      const pt = this.particles[i];
      if (!pt.active) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 65 + Math.random() * 140;
        pt.active = true;
        pt.x = x;
        pt.y = y;
        pt.vx = Math.cos(ang) * spd;
        pt.vy = Math.sin(ang) * spd;
        pt.size = 4 + Math.random() * 4;
        pt.color = color;
        pt.life = 0.35 + Math.random() * 0.2;
        pt.maxLife = pt.life;
        pt.isStar = true;
        spawned++;
      }
    }
  }

  private spawnSlashEffect(
    x: number,
    y: number,
    angle: number,
    radius: number,
    evolved: boolean
  ): void {
    for (let i = 0; i < this.slashes.length; i++) {
      const s = this.slashes[i];
      if (!s.active) {
        s.active = true;
        s.x = x;
        s.y = y;
        s.angle = angle;
        s.radius = radius;
        s.life = evolved ? 0.26 : 0.2;
        s.maxLife = s.life;
        s.evolved = evolved;
        return;
      }
    }
  }

  private spawnHolyPillar(x: number, y: number, radius: number, evolved: boolean): void {
    for (let i = 0; i < this.holyPillars.length; i++) {
      const p = this.holyPillars[i];
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        p.radius = radius;
        p.life = evolved ? 0.85 : 0.52;
        p.maxLife = p.life;
        p.evolved = evolved;
        p.healedPlayer = false;
        return;
      }
    }
  }

  private spawnShockwave(x: number, y: number, maxRadius: number, color: string): void {
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) {
        sw.active = true;
        sw.x = x;
        sw.y = y;
        sw.maxRadius = maxRadius;
        sw.color = color;
        sw.life = 0.32;
        sw.maxLife = 0.32;
        return;
      }
    }
  }

  private triggerShake(duration: number, intensity: number): void {
    this.shakeTimer = Math.max(this.shakeTimer, duration);
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  // Deterministic tile hash for infinite seamless Maple-style meadow
  private tileHash(tx: number, ty: number): number {
    let h = Math.imul(tx, 374761393) + Math.imul(ty, 668265263);
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    const viewW = this.canvas.clientWidth || 1280;
    const viewH = this.canvas.clientHeight || 720;

    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeTimer > 0) {
      const mag = this.shakeIntensity * (this.shakeTimer / 0.35);
      shakeX = (Math.random() - 0.5) * mag * 2;
      shakeY = (Math.random() - 0.5) * mag * 2;
    }

    const ox = Math.round(viewW * 0.5 - this.camX + shakeX);
    const oy = Math.round(viewH * 0.5 - this.camY + shakeY);

    // 1. Bright Maple-like Grass & Dirt Ground
    this.renderInfiniteForestGround(ctx, viewW, viewH, ox, oy);

    ctx.save();
    ctx.translate(ox, oy);

    if (this.phase === 'TITLE') {
      this.renderTitleAttractScene(ctx);
      ctx.restore();
      return;
    }

    // 2. Ground Auras: Boss Telegraphs & Holy Pillars base
    this.renderGroundAuras(ctx);

    // 3. Pickups & Crates
    this.renderPickupsAndCrates(ctx);

    // 4. Monsters (sorted loosely or direct for 60fps; bosses drawn after regular)
    this.renderMonsters(ctx);

    // 5. Player + Tiny Overhead HP Bar + Level Up Golden Beam
    this.renderPlayer(ctx);

    // 6. Guardian Shields & Projectiles & Slashes & Holy Light Columns
    this.renderWeaponsAndProjectiles(ctx);

    // 7. Particles, Shockwaves & Floating Damage Numbers
    this.renderParticlesAndDamageNumbers(ctx);

    // 8. Tree Canopies over world (fading gently if near player so nothing is obscured)
    this.renderForestTrees(ctx, viewW, viewH);

    ctx.restore();

    // Screen-wide bomb flash
    if (this.bombFlashTimer > 0) {
      ctx.fillStyle = `rgba(255, 252, 220, ${Math.min(0.85, this.bombFlashTimer * 2.2)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }
  }

  private renderInfiniteForestGround(
    ctx: CanvasRenderingContext2D,
    viewW: number,
    viewH: number,
    ox: number,
    oy: number
  ): void {
    // Base bright pastel meadow green
    ctx.fillStyle = '#8ad464';
    ctx.fillRect(0, 0, viewW, viewH);

    const tileSize = 48;
    const startTx = Math.floor((-ox) / tileSize) - 1;
    const endTx = Math.floor((viewW - ox) / tileSize) + 1;
    const startTy = Math.floor((-oy) / tileSize) - 1;
    const endTy = Math.floor((viewH - oy) / tileSize) + 1;

    for (let ty = startTy; ty <= endTy; ty++) {
      for (let tx = startTx; tx <= endTx; tx++) {
        const sx = Math.round(tx * tileSize + ox);
        const sy = Math.round(ty * tileSize + oy);
        const r = this.tileHash(tx, ty);

        // Checkerboard subtle grass tone
        if ((tx + ty) % 2 === 0) {
          ctx.fillStyle = '#82cb5c';
          ctx.fillRect(sx, sy, tileSize, tileSize);
        }

        // Occasional cozy dirt patch
        if (r < 0.085) {
          ctx.fillStyle = '#e5c48e';
          ctx.fillRect(sx + 6, sy + 10, 34, 26);
          ctx.fillStyle = '#d4af75';
          ctx.fillRect(sx + 10, sy + 14, 10, 6);
          ctx.fillRect(sx + 26, sy + 24, 8, 5);
        } else if (r < 0.24) {
          // Cute grass tuft blades
          ctx.fillStyle = '#6bb449';
          ctx.fillRect(sx + 12, sy + 18, 3, 6);
          ctx.fillRect(sx + 18, sy + 16, 3, 8);
          ctx.fillRect(sx + 24, sy + 20, 3, 4);
        } else if (r < 0.34) {
          // Cute pastel wildflowers!
          const flowerColors = ['#fff59d', '#ffb3c6', '#bae6fd', '#ffffff'];
          const fc = flowerColors[Math.floor(r * 100) % flowerColors.length];
          ctx.fillStyle = '#4e9a36';
          ctx.fillRect(sx + 21, sy + 24, 3, 6);
          ctx.fillStyle = fc;
          ctx.fillRect(sx + 18, sy + 18, 9, 6);
          ctx.fillRect(sx + 21, sy + 15, 3, 12);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(sx + 21, sy + 20, 3, 3);
        }
      }
    }
  }

  private renderForestTrees(ctx: CanvasRenderingContext2D, viewW: number, viewH: number): void {
    const tileSize = 48;
    const startTx = Math.floor((this.camX - viewW * 0.5) / tileSize) - 2;
    const endTx = Math.floor((this.camX + viewW * 0.5) / tileSize) + 2;
    const startTy = Math.floor((this.camY - viewH * 0.5) / tileSize) - 2;
    const endTy = Math.floor((this.camY + viewH * 0.5) / tileSize) + 2;

    for (let ty = startTy; ty <= endTy; ty++) {
      for (let tx = startTx; tx <= endTx; tx++) {
        // Space decorative trees on a coarse grid so they never crowd
        if (Math.abs(tx % 4) !== 0 || Math.abs(ty % 4) !== 0) continue;
        const r = this.tileHash(tx * 7, ty * 13);
        if (r > 0.38) continue;

        const wx = tx * tileSize + 24;
        const wy = ty * tileSize + 24;
        // Keep starting spawn clearing open
        if (Math.hypot(wx, wy) < 160) continue;

        const nearPlayer = Math.hypot(wx - this.player.x, wy - this.player.y) < 75;
        ctx.save();
        if (nearPlayer) ctx.globalAlpha = 0.45;

        // Ground shadow
        ctx.fillStyle = 'rgba(30, 58, 32, 0.22)';
        ctx.beginPath();
        ctx.ellipse(wx, wy + 16, 22, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pixel tree trunk
        ctx.fillStyle = '#24182b';
        ctx.fillRect(wx - 9, wy - 6, 18, 22);
        ctx.fillStyle = '#9c6644';
        ctx.fillRect(wx - 6, wy - 4, 12, 17);
        ctx.fillStyle = '#7f5539';
        ctx.fillRect(wx, wy - 4, 6, 17);

        // Cute rounded pixel canopy
        ctx.fillStyle = '#24182b';
        ctx.fillRect(wx - 24, wy - 44, 48, 40);
        ctx.fillStyle = '#40916c';
        ctx.fillRect(wx - 21, wy - 41, 42, 34);
        ctx.fillStyle = '#52b788';
        ctx.fillRect(wx - 18, wy - 38, 36, 22);
        ctx.fillStyle = '#74c69d';
        ctx.fillRect(wx - 12, wy - 36, 20, 10);

        ctx.restore();
      }
    }
  }

  private renderTitleAttractScene(ctx: CanvasRenderingContext2D): void {
    // Draw cute hopping monsters & patrolling hero in background of Title Screen
    const t = this.titleTime;
    const px = Math.sin(t * 0.4) * 50;
    const py = Math.cos(t * 0.3) * 30;
    const facingRight = Math.cos(t * 0.4) >= 0;
    const hop = Math.abs(Math.sin(t * 7)) * 4;

    // Shadow
    ctx.fillStyle = 'rgba(25, 45, 25, 0.25)';
    ctx.beginPath();
    ctx.ellipse(px, py + 28, 20, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(px, py - hop);
    if (this.sprites.heroSheet) {
      const sheet = this.sprites.heroSheet;
      const unitScale = 68 / sheet.baseHeight;
      const frame = sheet.walk[Math.floor(t * 6) % sheet.walk.length];
      const w = Math.round(frame.width * unitScale);
      const h = Math.round(frame.height * unitScale);
      if (!facingRight) ctx.scale(-1, 1);
      ctx.drawImage(frame, Math.round(-w / 2), Math.round(28 - h), w, h);
    } else {
      const frameIdx = Math.floor(t * 7) % 3;
      const pSprite = this.sprites.player.frames[frameIdx];
      const scale = 3.2;
      if (!facingRight) ctx.scale(-1, 1);
      ctx.drawImage(
        pSprite,
        Math.round((-pSprite.width * scale) / 2),
        Math.round((-pSprite.height * scale) / 2),
        Math.round(pSprite.width * scale),
        Math.round(pSprite.height * scale)
      );
    }
    ctx.restore();

    // Cute orbiting jellies & acorns around the title meadow
    const critters: Array<{ kind: MonsterKind; r: number; spd: number; phase: number }> = [
      { kind: 'jelly', r: 170, spd: 0.4, phase: 0 },
      { kind: 'jelly', r: 210, spd: 0.32, phase: 2.1 },
      { kind: 'acorn', r: 190, spd: -0.45, phase: 1.0 },
      { kind: 'ghost', r: 240, spd: 0.28, phase: 4.0 },
    ];
    for (const c of critters) {
      const ang = t * c.spd + c.phase;
      const mx = Math.cos(ang) * c.r;
      const my = Math.sin(ang) * (c.r * 0.65);
      const hop = Math.abs(Math.sin(t * 5 + c.phase)) * 8;
      const frames = this.sprites.monsters[c.kind].frames;
      const spr = frames[Math.floor(t * 4) % frames.length];
      ctx.fillStyle = 'rgba(25, 45, 25, 0.22)';
      ctx.beginPath();
      ctx.ellipse(mx, my + 16, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(spr, mx - spr.width * 1.2, my - spr.height * 1.2 - hop, spr.width * 2.4, spr.height * 2.4);
    }
  }

  private renderGroundAuras(ctx: CanvasRenderingContext2D): void {
    // Boss telegraph circles
    for (let i = 0; i < this.activeMonsterIndices.length; i++) {
      const m = this.monsters[this.activeMonsterIndices[i]];
      if (!m.active || !m.isBoss || m.bossTelegraphTimer <= 0) continue;
      const prog = 1 - m.bossTelegraphTimer / 1.1;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
      ctx.beginPath();
      ctx.arc(m.bossTelegraphX, m.bossTelegraphY, 130, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(m.bossTelegraphX, m.bossTelegraphY, 130 * prog, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Holy Pillars ground glow
    for (let i = 0; i < this.holyPillars.length; i++) {
      const hp = this.holyPillars[i];
      if (!hp.active) continue;
      const alpha = Math.min(1, hp.life / 0.2);
      ctx.save();
      ctx.globalAlpha = alpha * 0.45;
      ctx.fillStyle = hp.evolved ? '#4ade80' : '#fde047';
      ctx.beginPath();
      ctx.ellipse(hp.x, hp.y, hp.radius, hp.radius * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderPickupsAndCrates(ctx: CanvasRenderingContext2D): void {
    // Wooden Crates
    for (let i = 0; i < this.crates.length; i++) {
      const c = this.crates[i];
      if (!c.active) continue;
      ctx.fillStyle = 'rgba(25, 45, 25, 0.25)';
      ctx.beginPath();
      ctx.ellipse(c.x, c.y + 13, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      const spr = this.sprites.crate;
      const w = spr.width * 2.2;
      const h = spr.height * 2.2;
      ctx.drawImage(spr, Math.round(c.x - w / 2), Math.round(c.y - h / 2), Math.round(w), Math.round(h));
      if (c.hitFlash > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(Math.round(c.x - w / 2), Math.round(c.y - h / 2), Math.round(w), Math.round(h));
      }
    }

    // Pickups
    for (let i = 0; i < this.pickups.length; i++) {
      const pk = this.pickups[i];
      if (!pk.active) continue;

      let spr: HTMLCanvasElement;
      let scale = 2.0;
      switch (pk.kind) {
        case 'exp_small':
          spr = this.sprites.expSmall;
          scale = 1.7;
          break;
        case 'exp_medium':
          spr = this.sprites.expMedium;
          scale = 2.0;
          break;
        case 'exp_large':
          spr = this.sprites.expLarge;
          scale = 2.3;
          break;
        case 'coin':
          spr = this.sprites.coin;
          scale = 2.1;
          break;
        case 'potion':
          spr = this.sprites.potion;
          scale = 2.3;
          break;
        case 'magnet_all':
          spr = this.sprites.magnetAll;
          scale = 2.3;
          break;
        case 'bomb':
          spr = this.sprites.bomb;
          scale = 2.3;
          break;
        case 'chest':
          spr = this.sprites.chest;
          scale = 2.6;
          break;
      }

      const bob = Math.sin(pk.bobPhase) * 2.5 + pk.popZ;
      const w = Math.round(spr.width * scale);
      const h = Math.round(spr.height * scale);

      if (pk.kind === 'chest') {
        // Golden sparkle ring around Treasure Chest
        ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
        ctx.beginPath();
        ctx.arc(pk.x, pk.y, 24 + Math.sin(pk.bobPhase) * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(20, 40, 20, 0.22)';
      ctx.beginPath();
      ctx.ellipse(pk.x, pk.y + h * 0.42, w * 0.35, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.drawImage(spr, Math.round(pk.x - w / 2), Math.round(pk.y - h / 2 - bob), w, h);
    }
  }

  private renderMonsters(ctx: CanvasRenderingContext2D): void {
    const viewW = (this.canvas.clientWidth || 1280) * 0.5 + 90;
    const viewH = (this.canvas.clientHeight || 720) * 0.5 + 90;

    for (let i = 0; i < this.activeMonsterIndices.length; i++) {
      const m = this.monsters[this.activeMonsterIndices[i]];
      if (!m.active) continue;

      // Frustum cull offscreen monsters for peak 60fps
      if (Math.abs(m.x - this.camX) > viewW || Math.abs(m.y - this.camY) > viewH) continue;

      const cfg = CONFIG.MONSTERS[m.kind];
      const pair = this.sprites.monsters[m.kind];
      const frameIdx = Math.floor(m.animTime) % pair.frames.length;
      const spr = m.hitFlash > 0 ? pair.flashFrames[frameIdx] : pair.frames[frameIdx];

      const hop = m.kind === 'jelly' || m.kind === 'boss_jelly' ? Math.abs(Math.sin(m.animTime * 0.9)) * 5 : 0;
      const w = Math.round(spr.width * cfg.scale);
      const h = Math.round(spr.height * cfg.scale);

      // Soft oval shadow
      ctx.fillStyle = 'rgba(20, 40, 20, 0.26)';
      ctx.beginPath();
      ctx.ellipse(m.x, m.y + h * 0.38, cfg.shadowRadius, cfg.shadowRadius * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(Math.round(m.x), Math.round(m.y - hop));
      if (m.kind === 'ghost' || m.kind === 'boss_ghost') {
        ctx.globalAlpha = 0.82;
      }
      if (m.facing < 0) ctx.scale(-1, 1);
      ctx.drawImage(spr, Math.round(-w / 2), Math.round(-h / 2), w, h);
      ctx.restore();

      // Overhead Boss HP Bar (and Elite HP bar)
      if (m.isBoss || m.isElite) {
        const barW = m.isBoss ? 78 : 42;
        const barH = m.isBoss ? 8 : 5;
        const bx = Math.round(m.x - barW / 2);
        const by = Math.round(m.y - h / 2 - 14);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
        ctx.fillStyle = m.isBoss ? '#ef4444' : '#f59e0b';
        ctx.fillRect(bx, by, Math.max(0, Math.round((barW * m.hp) / m.maxHp)), barH);
      }
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D): void {
    const p = this.player;
    const blinkHide = p.invulnTimer > 0 && Math.floor(p.invulnTimer * 24) % 2 === 0;
    const idleBob = p.isMoving
      ? Math.abs(Math.sin(p.walkTime * 1.15)) * 3.5
      : Math.sin(p.walkTime) * 1.5;

    // Level-up golden light beam behind/over player
    if (this.levelUpBeamTimer > 0) {
      const alpha = Math.min(1, this.levelUpBeamTimer / 0.5);
      ctx.save();
      ctx.globalAlpha = alpha * 0.55;
      const grad = ctx.createLinearGradient(p.x - 28, p.y, p.x + 28, p.y);
      grad.addColorStop(0, 'rgba(253, 224, 71, 0)');
      grad.addColorStop(0.5, 'rgba(254, 240, 138, 0.95)');
      grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(p.x - 36, p.y - 420, 72, 440);
      ctx.restore();
    }

    let drawH = 64;
    // Shadow
    ctx.fillStyle = 'rgba(20, 40, 20, 0.3)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 24, 17, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!blinkHide) {
      ctx.save();
      ctx.translate(Math.round(p.x), Math.round(p.y - idleBob));

      if (this.sprites.heroSheet) {
        const sheet = this.sprites.heroSheet;
        const unitScale = 64 / sheet.baseHeight;
        const isFlash = p.invulnTimer > 0.28;
        let frame: HTMLCanvasElement;
        if (p.fishSwingTimer > 0) {
          frame = isFlash ? sheet.swingFlash : sheet.swing;
        } else if (p.isMoving) {
          const walkIdx = Math.floor(p.walkTime * 0.8) % sheet.walk.length;
          frame = isFlash ? sheet.walkFlash[walkIdx] : sheet.walk[walkIdx];
        } else {
          frame = isFlash ? sheet.idleFlash : sheet.idle;
        }

        const w = Math.round(frame.width * unitScale);
        const h = Math.round(frame.height * unitScale);
        // All sheet frames are normalized to face RIGHT (+1); flip when facing LEFT (-1)
        if (p.facing < 0) ctx.scale(-1, 1);
        const footAnchorY = p.fishSwingTimer > 0 ? 27 : 24;
        ctx.drawImage(frame, Math.round(-w / 2), Math.round(footAnchorY - h), w, h);
      } else {
        const scale = CONFIG.PLAYER.SPRITE_SCALE;
        const frameIdx = p.isMoving ? Math.floor(p.walkTime) % 3 : 0;
        const spr =
          p.invulnTimer > 0.28
            ? this.sprites.player.flashFrames[frameIdx]
            : this.sprites.player.frames[frameIdx];
        const w = Math.round(spr.width * scale);
        drawH = Math.round(spr.height * scale);
        if (p.facing < 0) ctx.scale(-1, 1);
        ctx.drawImage(spr, Math.round(-w / 2), Math.round(-drawH / 2), w, drawH);
      }

      ctx.restore();
    }

    // Tiny HP bar right above player's head
    const hpW = 40;
    const hpH = 5;
    const hx = Math.round(p.x - hpW / 2);
    const hy = Math.round(p.y - drawH / 2 - 12);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(hx - 1, hy - 1, hpW + 2, hpH + 2);
    const hpRatio = Math.max(0, p.hp / p.maxHp);
    ctx.fillStyle = hpRatio > 0.35 ? '#4ade80' : '#ef4444';
    ctx.fillRect(hx, hy, Math.round(hpW * hpRatio), hpH);

    // Floating sparkling "LEVEL UP!" text
    if (this.levelUpBeamTimer > 0) {
      ctx.save();
      ctx.font = 'bold 18px "Jua", sans-serif';
      ctx.textAlign = 'center';
      const ly = Math.round(p.y - drawH / 2 - 28 - (1.25 - this.levelUpBeamTimer) * 24);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#24182b';
      ctx.strokeText('LEVEL UP!', p.x, ly);
      ctx.fillStyle = '#fde047';
      ctx.fillText('LEVEL UP!', p.x, ly);
      ctx.restore();
    }
  }

  private renderWeaponsAndProjectiles(ctx: CanvasRenderingContext2D): void {
    // 1. Guardian Shields
    const shieldWeapon = this.weapons.find((w) => w.id === 'shield');
    if (shieldWeapon) {
      const def = CONFIG.WEAPONS.shield;
      const stats = shieldWeapon.evolved ? def.evolvedStats : def.levels[shieldWeapon.level - 1];
      if (shieldWeapon.evolved) {
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, stats.area, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 0; i < stats.count; i++) {
        const ang = this.player.shieldAngle + (Math.PI * 2 * i) / stats.count;
        const sx = Math.round(this.player.x + Math.cos(ang) * stats.area);
        const sy = Math.round(this.player.y + Math.sin(ang) * stats.area);
        const r = shieldWeapon.evolved ? 15 : 11;

        ctx.fillStyle = '#24182b';
        ctx.beginPath();
        ctx.arc(sx, sy, r + 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = shieldWeapon.evolved ? '#fde047' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(sx - 2, sy - 2, r * 0.48, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Greatsword Crescent Slash Trails
    for (let i = 0; i < this.slashes.length; i++) {
      const sl = this.slashes[i];
      if (!sl.active) continue;
      const t = sl.life / sl.maxLife;
      ctx.save();
      ctx.translate(sl.x, sl.y);
      ctx.rotate(sl.angle);
      ctx.globalAlpha = Math.min(1, t * 1.4);

      ctx.strokeStyle = sl.evolved ? '#7dd3fc' : '#ffffff';
      ctx.lineWidth = sl.evolved ? 26 * t : 18 * t;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, sl.radius * 0.78, -Math.PI * 0.48, Math.PI * 0.48);
      ctx.stroke();

      ctx.strokeStyle = sl.evolved ? '#ffffff' : '#bae6fd';
      ctx.lineWidth = sl.evolved ? 10 * t : 6 * t;
      ctx.beginPath();
      ctx.arc(0, 0, sl.radius * 0.85, -Math.PI * 0.42, Math.PI * 0.42);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Holy Pillars of Light
    for (let i = 0; i < this.holyPillars.length; i++) {
      const hp = this.holyPillars[i];
      if (!hp.active) continue;
      const t = hp.life / hp.maxLife;
      const beamW = hp.radius * 1.35 * (0.6 + 0.4 * t);
      ctx.save();
      ctx.globalAlpha = Math.min(0.88, t * 1.6);
      const grad = ctx.createLinearGradient(hp.x - beamW / 2, hp.y, hp.x + beamW / 2, hp.y);
      grad.addColorStop(0, 'rgba(253, 224, 71, 0)');
      grad.addColorStop(0.5, hp.evolved ? '#bef264' : '#fef08a');
      grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(hp.x - beamW / 2, hp.y - 360, beamW, 360);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(hp.x - beamW * 0.14, hp.y - 360, beamW * 0.28, 360);
      ctx.restore();
    }

    // 4. Projectiles
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (!p.active) continue;

      ctx.save();
      ctx.translate(Math.round(p.x), Math.round(p.y));

      if (p.style === 'shuriken') {
        ctx.rotate(p.spin);
        const s = p.evolved ? 13 : 9;
        ctx.fillStyle = '#24182b';
        ctx.fillRect(-s - 1, -3, (s + 1) * 2, 6);
        ctx.fillRect(-3, -s - 1, 6, (s + 1) * 2);
        ctx.fillStyle = p.evolved ? '#fde047' : '#e2e8f0';
        ctx.fillRect(-s, -2, s * 2, 4);
        ctx.fillRect(-2, -s, 4, s * 2);
        ctx.fillStyle = p.evolved ? '#f59e0b' : '#38bdf8';
        ctx.fillRect(-3, -3, 6, 6);
      } else if (p.style === 'orb') {
        const r = p.radius;
        ctx.fillStyle = p.evolved ? 'rgba(244, 114, 182, 0.35)' : 'rgba(192, 132, 252, 0.35)';
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#24182b';
        ctx.beginPath();
        ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = p.evolved ? '#fbbf24' : '#c084fc';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-r * 0.25, -r * 0.25, r * 0.38, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.style === 'arrow' || p.style === 'arrow_rain') {
        ctx.rotate(Math.atan2(p.vy, p.vx));
        ctx.fillStyle = '#24182b';
        ctx.fillRect(-13, -3, 24, 6);
        ctx.fillStyle = p.evolved ? '#4ade80' : '#f8fafc';
        ctx.fillRect(-11, -1.5, 19, 3);
        ctx.fillStyle = p.evolved ? '#fde047' : '#94a3b8';
        ctx.fillRect(6, -4, 6, 8);
      } else if (p.style === 'sword_wave') {
        ctx.rotate(Math.atan2(p.vy, p.vx));
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(-30, 0, 74, -Math.PI * 0.42, Math.PI * 0.42);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(-28, 0, 76, -Math.PI * 0.38, Math.PI * 0.38);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private renderParticlesAndDamageNumbers(ctx: CanvasRenderingContext2D): void {
    // Shockwave rings
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) continue;
      const prog = 1 - sw.life / sw.maxLife;
      ctx.save();
      ctx.globalAlpha = 1 - prog;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 5 * (1 - prog) + 1;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.maxRadius * prog, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Small star particles
    for (let i = 0; i < this.particles.length; i++) {
      const pt = this.particles[i];
      if (!pt.active) continue;
      ctx.save();
      ctx.globalAlpha = Math.min(1, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      const s = pt.size;
      ctx.fillRect(Math.round(pt.x - s / 2), Math.round(pt.y - 1), s, 2);
      ctx.fillRect(Math.round(pt.x - 1), Math.round(pt.y - s / 2), 2, s);
      ctx.restore();
    }

    // Bold Orange Damage Numbers & Larger Crimson Crits
    ctx.textAlign = 'center';
    for (let i = 0; i < this.damageNumbers.length; i++) {
      const dn = this.damageNumbers[i];
      if (!dn.active) continue;
      const alpha = Math.min(1, dn.life / (dn.maxLife * 0.4));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = dn.isCrit
        ? '800 20px "JetBrains Mono", sans-serif'
        : '800 14px "JetBrains Mono", sans-serif';
      ctx.lineWidth = dn.isCrit ? 4 : 3;
      ctx.strokeStyle = '#1e1326';
      ctx.strokeText(dn.text, Math.round(dn.x), Math.round(dn.y));
      ctx.fillStyle = dn.isHeal ? '#4ade80' : dn.isCrit ? '#ef4444' : '#fb923c';
      ctx.fillText(dn.text, Math.round(dn.x), Math.round(dn.y));
      ctx.restore();
    }
  }

  public emitHud(): void {
    let activeBoss: BossHudInfo | null = null;
    for (let i = 0; i < this.activeMonsterIndices.length; i++) {
      const m = this.monsters[this.activeMonsterIndices[i]];
      if (m.active && m.isBoss) {
        activeBoss = {
          name: CONFIG.MONSTERS[m.kind].name,
          hp: Math.max(0, m.hp),
          maxHp: m.maxHp,
          isFinal: m.kind === 'boss_final',
        };
        break;
      }
    }

    this.onHudUpdate({
      phase: this.phase,
      elapsedSeconds: this.elapsedSeconds,
      targetSeconds: CONFIG.GAME.TARGET_SURVIVAL_SECONDS,
      level: this.player.level,
      exp: this.player.exp,
      expToNext: this.player.expToNext,
      hp: Math.ceil(this.player.hp),
      maxHp: this.player.maxHp,
      kills: this.player.kills,
      coins: this.player.coins,
      weapons: this.weapons.map((w) => ({
        id: w.id,
        name: w.evolved ? CONFIG.WEAPONS[w.id].evolvedName : CONFIG.WEAPONS[w.id].name,
        level: w.level,
        evolved: w.evolved,
        totalDamage: w.totalDamage,
      })),
      passives: this.passives.map((p) => ({
        id: p.id,
        name: CONFIG.PASSIVES[p.id].name,
        level: p.level,
      })),
      upgradeChoices: this.upgradeChoices,
      chestReward: this.chestReward,
      boss: activeBoss,
      waveBanner: this.waveBannerText,
      muted: sound.muted,
      stats: {
        mightBonusPct: Math.round(this.getPassiveLevel('might') * CONFIG.PASSIVES.might.bonusPerLevel * 100),
        speedBonusPct: Math.round(this.getPassiveLevel('speed') * CONFIG.PASSIVES.speed.bonusPerLevel * 100),
        cooldownRedPct: Math.round(this.getPassiveLevel('cooldown') * CONFIG.PASSIVES.cooldown.bonusPerLevel * 100),
        magnetBonusPct: Math.round(this.getPassiveLevel('magnet') * CONFIG.PASSIVES.magnet.bonusPerLevel * 100),
      },
    });
  }
}
