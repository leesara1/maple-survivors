import { MonsterKind, PassiveId, WeaponId } from './types';

const PALETTE: Record<string, string> = {
  '.': 'transparent',
  '#': '#24182b', // dark plum-black crisp pixel outline
  'W': '#ffffff',
  'S': '#ffd8be', // warm peach skin
  's': '#f4b698', // skin shadow
  'R': '#ff6b81', // blush / red scarf
  'r': '#d63f57', // scarf shadow
  'K': '#2b2d42', // black hair
  'k': '#4a4e69', // hair highlight
  'B': '#4ea8de', // tunic blue
  'b': '#3578a8', // tunic shadow
  'C': '#72efdd', // sky-blue greatsword blade
  'c': '#48bfe3', // greatsword mid
  'D': '#bde0fe', // sword highlight
  'G': '#ffd166', // gold
  'g': '#e09f3e', // gold shadow
  'M': '#6ee7b7', // mint jelly
  'm': '#34d399', // mint shadow
  'A': '#b07d4f', // acorn body
  'a': '#875a36', // acorn shadow
  'L': '#52b788', // leaf green
  'l': '#2d6a4f', // leaf shadow
  'P': '#d8b4fe', // ghost lavender
  'p': '#a855f7', // ghost shadow
  'T': '#94a3b8', // golem stone
  't': '#64748b', // stone shadow
  'Y': '#fde047', // bright yellow
  'O': '#fb923c', // orange
  'V': '#7e22ce', // deep violet
  'v': '#581c87', // darker violet
  'E': '#ef4444', // crimson eye/gem
  'U': '#38bdf8', // sky gem
};

function renderMatrixToCanvas(
  rows: string[],
  customPalette?: Record<string, string>
): HTMLCanvasElement {
  const h = rows.length;
  const w = rows[0].length;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (!ch || ch === '.') continue;
      const color = (customPalette && customPalette[ch]) || PALETTE[ch];
      if (!color || color === 'transparent') continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return canvas;
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

export interface SpriteFramePair {
  frames: HTMLCanvasElement[];
  flashFrames: HTMLCanvasElement[];
}

// 18x20 Cute Black-Haired Warrior with Giant Sky-Blue Greatsword on shoulder
const PLAYER_FRAME_0 = [
  '............###...',
  '...........#DDC#..',
  '....#####.#DDCC#..',
  '...#KKKKK##DCC#...',
  '..#KKkKKKK#CC#....',
  '.#KKKKKKK#CC#.....',
  '.#KKSSSSK#C#......',
  '.#KSS#SS#S#.......',
  '.#KSRSSSRK#.......',
  '..#SSSSSS#........',
  '...##RRR##........',
  '..#BBBBBR#........',
  '.#SBbBBBb#........',
  '.#S#BBBB#.........',
  '..##bBBb#.........',
  '...#KK#KK#........',
  '...#KK.#KK#.......',
  '...###..###.......',
];

const PLAYER_FRAME_1 = [
  '............###...',
  '...........#DDC#..',
  '....#####.#DDCC#..',
  '...#KKKKK##DCC#...',
  '..#KKkKKKK#CC#....',
  '.#KKKKKKK#CC#.....',
  '.#KKSSSSK#C#......',
  '.#KSS#SS#S#.......',
  '.#KSRSSSRK#.......',
  '..#SSSSSS#........',
  '...##RRR##........',
  '..#BBBBBR#........',
  '.#SBbBBBb#........',
  '.#S#BBBB#.........',
  '..##bBBb#.........',
  '..#KK#.#KK#.......',
  '.#KK#...#KK#......',
  '.###.....###......',
];

const PLAYER_FRAME_2 = [
  '............###...',
  '...........#DDC#..',
  '....#####.#DDCC#..',
  '...#KKKKK##DCC#...',
  '..#KKkKKKK#CC#....',
  '.#KKKKKKK#CC#.....',
  '.#KKSSSSK#C#......',
  '.#KSS#SS#S#.......',
  '.#KSRSSSRK#.......',
  '..#SSSSSS#........',
  '...##RRR##........',
  '..#BBBBBR#........',
  '..#BBBBbS#........',
  '..#BBBB##.........',
  '..##bBBb#.........',
  '....#KK#KK#.......',
  '....#KK.#KK#......',
  '....###..###......',
];

// Jelly Drop (16x16)
const JELLY_0 = [
  '................',
  '......####......',
  '....##MMMM##....',
  '...#MMWWMMMM#...',
  '..#MMWMMMMMMM#..',
  '..#MMMMMMMMMM#..',
  '.#MMM#MMMM#MMM#.',
  '.#MMRMMMMMMRMM#.',
  '.#MMMMMMMMMMMM#.',
  '.#MmmMMMMMMmmM#.',
  '..#mmmmmmmmmm#..',
  '...##########...',
  '................',
];

const JELLY_1 = [
  '................',
  '................',
  '.....######.....',
  '...##MMMMMM##...',
  '..#MMWWMMMMMM#..',
  '.#MMWMMMMMMMMM#.',
  '.#MMM#MMMM#MMM#.',
  '.#MMRMMMMMMRMM#.',
  '.#MMMMMMMMMMMM#.',
  '.#mmmmmmmmmmmm#.',
  '..############..',
  '................',
];

// Acorn Soldier (16x16)
const ACORN_0 = [
  '.......##.......',
  '......#LL#......',
  '....########....',
  '...#aaaaaaaa#...',
  '..#aaAAaaAAaa#..',
  '..############..',
  '..#SSSSSSSSSS#..',
  '..#SS#SSSS#SS#..',
  '..#SSRSSSSRSS#..',
  '...#SSSSSSSS#...',
  '...##BBBBBB##...',
  '..#G#BBBBBB#L#..',
  '...#.#AA#AA#....',
  '.....###.###....',
];

const ACORN_1 = [
  '.......##.......',
  '......#LL#......',
  '....########....',
  '...#aaaaaaaa#...',
  '..#aaAAaaAAaa#..',
  '..############..',
  '..#SSSSSSSSSS#..',
  '..#SS#SSSS#SS#..',
  '..#SSRSSSSRSS#..',
  '...#SSSSSSSS#...',
  '...##BBBBBB##...',
  '..#G#BBBBBB#L#..',
  '....#AA#.#AA#...',
  '....###...###...',
];

// Wisp Ghost (16x16)
const GHOST_0 = [
  '.....######.....',
  '...##PPPPPP##...',
  '..#PPWWPPPPPP#..',
  '.#PPPPPPPPPPPP#.',
  '.#PPP#PPPP#PPP#.',
  '.#PPPVPPPPvPPP#.',
  '.#PPPPPPPPPPPP#.',
  '.#PPppppppppPP#.',
  '.#PppPPPPPPppP#.',
  '..#p#.####.#p#..',
  '..##........##..',
  '................',
];

const GHOST_1 = [
  '................',
  '.....######.....',
  '...##PPPPPP##...',
  '..#PPWWPPPPPP#..',
  '.#PPPPPPPPPPPP#.',
  '.#PPP#PPPP#PPP#.',
  '.#PPPVPPPPvPPP#.',
  '.#PPPPPPPPPPPP#.',
  '.#PPppppppppPP#.',
  '..#pp#.##.#pp#..',
  '...##......##...',
  '................',
];

// Elite Mossy Stone Golem (20x20)
const GOLEM_0 = [
  '.......##..##.......',
  '......#LL##LL#......',
  '....############....',
  '...#TTTTTTTTTTTT#...',
  '..#TTLLTTTTTTLLTT#..',
  '..#TTTTTTTTTTTTTT#..',
  '.#TTT#O#TTTT#O#TTT#.',
  '.#TTT###TTTT###TTT#.',
  '.#TTTTTTTTTTTTTTTT#.',
  '.#TTtTTTTTTTTTTtTT#.',
  '#TTT#tttttttttt#TTT#',
  '#TT##TTTTTTTTTT##TT#',
  '#TT#.#TTttttTT#.#TT#',
  '.##..#TT#..#TT#..##.',
  '.....#tt#..#tt#.....',
  '.....###....###.....',
];

const GOLEM_1 = [
  '.......##..##.......',
  '......#LL##LL#......',
  '....############....',
  '...#TTTTTTTTTTTT#...',
  '..#TTLLTTTTTTLLTT#..',
  '..#TTTTTTTTTTTTTT#..',
  '.#TTT#O#TTTT#O#TTT#.',
  '.#TTT###TTTT###TTT#.',
  '.#TTTTTTTTTTTTTTTT#.',
  '.#TTtTTTTTTTTTTtTT#.',
  '#TTT#tttttttttt#TTT#',
  '.#TT#TTTTTTTTTT#TT#.',
  '..##.#TTttttTT#.##..',
  '....#TT#....#TT#....',
  '....#tt#....#tt#....',
  '....###......###....',
];

// Bosses (22x22)
const BOSS_JELLY_0 = [
  '......##..##..##......',
  '......#G##GG##G#......',
  '......#GGGGGGGG#......',
  '......##########......',
  '....##MMMMMMMMMM##....',
  '...#MMWWMMMMMMMMMM#...',
  '..#MMWMMMMMMMMMMMMM#..',
  '.#MMMMMMMMMMMMMMMMMM#.',
  '.#MMMM##MMMMMM##MMMM#.',
  '.#MMMM##MMMMMM##MMMM#.',
  '.#MMRRMMMMMMMMMMRRMM#.',
  '.#MMMMMMMMMMMMMMMMMM#.',
  '.#MmmMMMMMMMMMMMMmmM#.',
  '..#mmmmmmmmmmmmmmmm#..',
  '...################...',
];

const BOSS_ACORN_0 = [
  '....###........###....',
  '...#GGG########GGG#...',
  '....#LLLLLLLLLLLL#....',
  '...##aaaaaaaaaaaa##...',
  '..#aaAAaaAAaaAAaaAA#..',
  '..##################..',
  '..#SSSSSSSSSSSSSSSS#..',
  '..#SSS#E#SSSS#E#SSS#..',
  '..#SSS###SSSS###SSS#..',
  '..#SSRRSSSSSSSSRRSS#..',
  '...##GGGGGGGGGGGG##...',
  '..#G#GGGBBBBBBGGG#G#..',
  '.#G#.#GGGGGGGGGG#.#G#.',
  '.##...#AA#..#AA#...##.',
  '......###....###......',
];

const BOSS_GHOST_0 = [
  '.....##...##...##.....',
  '.....#V###VV###V#.....',
  '......#YYYYYYYY#......',
  '....###PPPPPPPP###....',
  '..##PPPPPPPPPPPPPP##..',
  '.#PPPPWWPPPPPPPPPPPP#.',
  '.#PPPPPPPPPPPPPPPPPP#.',
  '.#PPPP#E#PPPP#E#PPPP#.',
  '.#PPPP###PPPP###PPPP#.',
  '.#PPPPPPPPPPPPPPPPPP#.',
  '.#PPPppppppppppppPPP#.',
  '.#PPpp#pppppppp#ppPP#.',
  '..#p#..##pppp##..#p#..',
  '..##.....####.....##..',
];

const BOSS_FINAL_0 = [
  '..##..............##..',
  '.#EE#....####....#EE#.',
  '.#VV#..##VVVV##..#VV#.',
  '..#VV##VVVVVVVV##VV#..',
  '..#VVVVVVVVVVVVVVVV#..',
  '.#VVVV#E#VVVV#E#VVVV#.',
  '.#VVVV#Y#VVVV#Y#VVVV#.',
  '.#VVVVVVVVVVVVVVVVVV#.',
  '.#VVvvVVVVVVVVVVvvVV#.',
  '#VVV#GGGGGGGGGGGG#VVV#',
  '#VV#.#VVvvVVvvVV#.#VV#',
  '#VV#.#VVVVVVVVVV#.#VV#',
  '.##...#VV#..#VV#...##.',
  '......#vv#..#vv#......',
  '......###....###......',
];

// Field Objects
const CRATE_MATRIX = [
  '##############',
  '#aaaaaaaaaaaa#',
  '#aAAaAAAAaAAa#',
  '#aAaTTTTTTaAa#',
  '#aAAaAAAAaAAa#',
  '#aaaaAAAAaaaa#',
  '#aAAaAAAAaAAa#',
  '#aAaTTTTTTaAa#',
  '#aAAaAAAAaAAa#',
  '#aaaaaaaaaaaa#',
  '##############',
];

const CHEST_CLOSED = [
  '................',
  '..############..',
  '.#GGGGGGGGGGGG#.',
  '.#GaaGaaaaGaaG#.',
  '.#GGGGGGGGGGGG#.',
  '.#GaaGGYYGGaaG#.',
  '.#GaaGGggGGaaG#.',
  '.#GaaGaaaaGaaG#.',
  '.#GGGGGGGGGGGG#.',
  '..############..',
];

const GEM_MATRIX = [
  '....##....',
  '...#WW#...',
  '..#WXXx#..',
  '.#WXXXXx#.',
  '.#XXXXXX#.',
  '.#xXXXXx#.',
  '..#xxxx#..',
  '...####...',
];

const COIN_MATRIX = [
  '..####..',
  '.#GGGG#.',
  '#GGWWGG#',
  '#GGYgGG#',
  '#GGYgGG#',
  '#GGggGG#',
  '.#gggg#.',
  '..####..',
];

const POTION_MATRIX = [
  '....####....',
  '....#aa#....',
  '...######...',
  '..#WWWWWW#..',
  '.#WWRRRRWW#.',
  '.#WRRRRRRR#.',
  '.#RRRRRRRR#.',
  '.#RrrrrrrR#.',
  '..########..',
];

const MAGNET_MATRIX = [
  '.###....###.',
  '#RRR#..#UUU#',
  '#RRR#..#UUU#',
  '#RRR#..#UUU#',
  '#TTT#..#TTT#',
  '.#TTT##TTT#.',
  '..#TTTTTT#..',
  '...######...',
];

const BOMB_MATRIX = [
  '......#Y#...',
  '.....#O#....',
  '...######...',
  '..#KKkKKKK#.',
  '.#KKWKKKKKK#',
  '.#KKKKKKKKK#',
  '.#KKkKKKkKK#',
  '..#KKKKKKK#.',
  '...#######..',
];

// 14x14 Crisp Pixel Icons for Weapons & Passives
const ICON_MATRICES: Record<WeaponId | PassiveId, string[]> = {
  greatsword: [
    '..........###.',
    '.........#DDC#',
    '........#DDCC#',
    '.......#DDCC#.',
    '......#DDCC#..',
    '.....#DDCC#...',
    '....#DDCC#....',
    '..###DCC#.....',
    '.#GG#CC#......',
    '..#GGG#.......',
    '..#A#GG#......',
    '.#A#..##......',
    '.##...........',
    '..............',
  ],
  shuriken: [
    '......##......',
    '.....#TT#.....',
    '.....#WT#.....',
    '..###TTT###...',
    '.#TTW#Y#TTT#..',
    '..###TTT###...',
    '.....#Tt#.....',
    '.....#tt#.....',
    '......##......',
    '..............',
    '..............',
    '..............',
    '..............',
    '..............',
  ],
  orb: [
    '....######....',
    '..##PPPPPP##..',
    '.#PPWWWWPPPP#.',
    '.#PPWPPPPPPP#.',
    '#PPPPPPPPPPPP#',
    '#PPPVVVVVVPPP#',
    '#PPPVWWWWVPPP#',
    '#PPPVVVVVVPPP#',
    '.#PPppppppPP#.',
    '.#PppppppppP#.',
    '..##pppppp##..',
    '....######....',
    '..............',
    '..............',
  ],
  arrow: [
    '.........####.',
    '........#TTTT#',
    '.........#WTT#',
    '........#A##T#',
    '.......#A#..#.',
    '......#A#.....',
    '.....#A#......',
    '....#A#.......',
    '..##A#........',
    '.#LL#.........',
    '.#l#..........',
    '..#...........',
    '..............',
    '..............',
  ],
  shield: [
    '..##########..',
    '.#UUUUUUUUUU#.',
    '.#UWWWWWWWWU#.',
    '.#UWCCCCCCWU#.',
    '.#UWCGGGGCWU#.',
    '.#UWCGGGGCWU#.',
    '.#UWCCCCCCWU#.',
    '..#UCCccCCU#..',
    '..#UccCCccU#..',
    '...#UccccU#...',
    '....#UccU#....',
    '.....####.....',
    '..............',
    '..............',
  ],
  holy: [
    '.....####.....',
    '....#WWWW#....',
    '....#WYYW#....',
    '..##WWYYWW##..',
    '.#YYWYYYYWYY#.',
    '..##WWYYWW##..',
    '....#WYYW#....',
    '....#WYYW#....',
    '....#WYYW#....',
    '....#GGGG#....',
    '...#GGGGGG#...',
    '....######....',
    '..............',
    '..............',
  ],
  maxHp: [
    '..###....###..',
    '.#RRR#..#RRR#.',
    '#RWWWR##RRRRR#',
    '#RWRRRRRRRRRR#',
    '#RRRRRRRRRRRR#',
    '.#RRRRrrrrRR#.',
    '..#RRRrrrrR#..',
    '...#RRrrrR#...',
    '....#RrrR#....',
    '.....#rr#.....',
    '......##......',
    '..............',
    '..............',
    '..............',
  ],
  speed: [
    '......####....',
    '.....#WWWW#...',
    '....#WCCCC#...',
    '...#LLLLL#....',
    '..#LLLLLL#....',
    '.#LLLLLLLL##..',
    '.#llLLLLLLll#.',
    '.#GGGGGGGGGG#.',
    '..##########..',
    '..............',
    '..............',
    '..............',
    '..............',
    '..............',
  ],
  might: [
    '..##########..',
    '.#OOOO##OOOO#.',
    '.#OWWO##ORRO#.',
    '.#OORROORROO#.',
    '.#OORRRRRROO#.',
    '.#OORRRRRROO#.',
    '..#OORRRROO#..',
    '..#OOORROOO#..',
    '...#OORROO#...',
    '....#OOOO#....',
    '.....####.....',
    '..............',
    '..............',
    '..............',
  ],
  cooldown: [
    '.........###..',
    '........#CCC#.',
    '.......#CCWW#.',
    '......#CCWW#..',
    '.....#CCWW#...',
    '....#CCWC#....',
    '...#CCWC#.....',
    '..#CCWC#......',
    '.#CCWC#.......',
    '.#CC#.........',
    '.##...........',
    '..............',
    '..............',
    '..............',
  ],
  magnet: [
    '.###......###.',
    '#RRR#....#UUU#',
    '#RRR#....#UUU#',
    '#RRR#....#UUU#',
    '#RRR#....#UUU#',
    '#TTT#....#TTT#',
    '.#TTT####TTT#.',
    '..#TTTTTTTT#..',
    '...########...',
    '..............',
    '..............',
    '..............',
    '..............',
    '..............',
  ],
};

export const UPLOADED_HERO_PATH = '/assets/aistudio/____f2089c1b.png';
export const UPLOADED_FISH_PATH = '/assets/aistudio/________692bfcd6.png';
export const HERO_SPRITESHEET_PATH = '/src/assets/images/tuna_hero_spritesheet_1795066392343.jpg';

function isMagentaBg(r: number, g: number, b: number): boolean {
  return r > 155 && b > 155 && g < 125 && r - g > 55 && b - g > 55;
}

function isMagentaFringe(r: number, g: number, b: number): boolean {
  return r > 115 && b > 115 && g < 115 && (r + b) * 0.5 - g > 38;
}

function extractSheetCell(
  img: HTMLImageElement,
  col: number,
  row: number,
  flipHorizontal: boolean
): HTMLCanvasElement {
  const fullW = img.naturalWidth || img.width;
  const fullH = img.naturalHeight || img.height;
  const halfW = Math.floor(fullW / 2);
  const halfH = Math.floor(fullH / 2);

  // Inset away from outer edges and the center dividing line
  const pad = Math.max(8, Math.floor(halfW * 0.03));
  const sx = col === 0 ? pad : halfW + pad;
  const sy = row === 0 ? pad : halfH + pad;
  const sw = halfW - pad * 2;
  const sh = halfH - pad * 2;

  const cell = document.createElement('canvas');
  cell.width = sw;
  cell.height = sh;
  const ctx = cell.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  const imgData = ctx.getImageData(0, 0, sw, sh);
  const d = imgData.data;
  const visited = new Uint8Array(sw * sh);
  const queue = new Int32Array(sw * sh);
  let qHead = 0;
  let qTail = 0;

  const tryPush = (x: number, y: number) => {
    if (x < 0 || x >= sw || y < 0 || y >= sh) return;
    const p = y * sw + x;
    if (visited[p]) return;
    const idx = p * 4;
    if (isMagentaBg(d[idx], d[idx + 1], d[idx + 2])) {
      visited[p] = 1;
      queue[qTail++] = p;
    }
  };

  // Seed flood fill from all 4 borders of the cell
  for (let x = 0; x < sw; x++) {
    tryPush(x, 0);
    tryPush(x, sh - 1);
  }
  for (let y = 0; y < sh; y++) {
    tryPush(0, y);
    tryPush(sw - 1, y);
  }

  while (qHead < qTail) {
    const p = queue[qHead++];
    d[p * 4 + 3] = 0;
    const px = p % sw;
    const py = (p - px) / sw;
    tryPush(px - 1, py);
    tryPush(px + 1, py);
    tryPush(px, py - 1);
    tryPush(px, py + 1);
  }

  // Clean 1-2px magenta compression halo around dark outlines
  for (let pass = 0; pass < 2; pass++) {
    const toClear: number[] = [];
    for (let y = 1; y < sh - 1; y++) {
      for (let x = 1; x < sw - 1; x++) {
        const p = y * sw + x;
        const idx = p * 4;
        if (d[idx + 3] === 0) continue;
        const hasTransparentNeighbor =
          d[(p - 1) * 4 + 3] === 0 ||
          d[(p + 1) * 4 + 3] === 0 ||
          d[(p - sw) * 4 + 3] === 0 ||
          d[(p + sw) * 4 + 3] === 0;
        if (hasTransparentNeighbor && isMagentaFringe(d[idx], d[idx + 1], d[idx + 2])) {
          toClear.push(p);
        }
      }
    }
    for (let i = 0; i < toClear.length; i++) {
      d[toClear[i] * 4 + 3] = 0;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Crop tightly to opaque pixels
  let minX = sw;
  let minY = sh;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      if (d[(y * sw + x) * 4 + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return cell;
  }

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  const octx = out.getContext('2d')!;
  octx.imageSmoothingEnabled = false;
  if (flipHorizontal) {
    octx.translate(cw, 0);
    octx.scale(-1, 1);
  }
  octx.drawImage(cell, minX, minY, cw, ch, 0, 0, cw, ch);
  return out;
}

export interface HeroSheetFrames {
  idle: HTMLCanvasElement;
  idleFlash: HTMLCanvasElement;
  walk: HTMLCanvasElement[];
  walkFlash: HTMLCanvasElement[];
  swing: HTMLCanvasElement;
  swingFlash: HTMLCanvasElement;
  baseHeight: number;
}

export interface SpriteBank {
  player: SpriteFramePair;
  heroSheet: HeroSheetFrames | null;
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
  icons: Record<WeaponId | PassiveId, string>; // data URLs for React UI
}

let cachedBank: SpriteBank | null = null;

export function getSpriteBank(): SpriteBank {
  if (cachedBank) return cachedBank;

  const pFrames = [
    renderMatrixToCanvas(PLAYER_FRAME_0),
    renderMatrixToCanvas(PLAYER_FRAME_1),
    renderMatrixToCanvas(PLAYER_FRAME_2),
  ];

  const makePair = (matrices: string[][]): SpriteFramePair => {
    const frames = matrices.map((m) => renderMatrixToCanvas(m));
    const flashFrames = frames.map(makeWhiteMask);
    return { frames, flashFrames };
  };

  const icons = {} as Record<WeaponId | PassiveId, string>;
  (Object.keys(ICON_MATRICES) as Array<WeaponId | PassiveId>).forEach((key) => {
    const c = renderMatrixToCanvas(ICON_MATRICES[key]);
    icons[key] = c.toDataURL();
  });
  icons.greatsword = UPLOADED_FISH_PATH;

  const bank: SpriteBank = {
    player: {
      frames: pFrames,
      flashFrames: pFrames.map(makeWhiteMask),
    },
    heroSheet: null,
    monsters: {
      jelly: makePair([JELLY_0, JELLY_1]),
      acorn: makePair([ACORN_0, ACORN_1]),
      ghost: makePair([GHOST_0, GHOST_1]),
      golem: makePair([GOLEM_0, GOLEM_1]),
      boss_jelly: makePair([BOSS_JELLY_0]),
      boss_acorn: makePair([BOSS_ACORN_0]),
      boss_ghost: makePair([BOSS_GHOST_0]),
      boss_final: makePair([BOSS_FINAL_0]),
    },
    crate: renderMatrixToCanvas(CRATE_MATRIX),
    chest: renderMatrixToCanvas(CHEST_CLOSED),
    expSmall: renderMatrixToCanvas(GEM_MATRIX, { X: '#38bdf8', x: '#0284c7' }),
    expMedium: renderMatrixToCanvas(GEM_MATRIX, { X: '#4ade80', x: '#16a34a' }),
    expLarge: renderMatrixToCanvas(GEM_MATRIX, { X: '#fde047', x: '#d97706' }),
    coin: renderMatrixToCanvas(COIN_MATRIX),
    potion: renderMatrixToCanvas(POTION_MATRIX),
    magnetAll: renderMatrixToCanvas(MAGNET_MATRIX),
    bomb: renderMatrixToCanvas(BOMB_MATRIX),
    icons,
  };

  if (typeof Image !== 'undefined') {
    const sheetImg = new Image();
    sheetImg.onload = () => {
      // Top-left (0,0) & Top-right (1,0) already face RIGHT (+1).
      // Bottom-left (0,1) & Bottom-right (1,1) face LEFT (-1), so flip horizontally to unify facing RIGHT (+1).
      const idle = extractSheetCell(sheetImg, 0, 0, false);
      const run1 = extractSheetCell(sheetImg, 1, 0, false);
      const run2 = extractSheetCell(sheetImg, 0, 1, true);
      const swing = extractSheetCell(sheetImg, 1, 1, true);

      bank.heroSheet = {
        idle,
        idleFlash: makeWhiteMask(idle),
        walk: [run1, run2],
        walkFlash: [makeWhiteMask(run1), makeWhiteMask(run2)],
        swing,
        swingFlash: makeWhiteMask(swing),
        baseHeight: idle.height,
      };
    };
    sheetImg.src = HERO_SPRITESHEET_PATH;
  }

  cachedBank = bank;
  return cachedBank;
}
