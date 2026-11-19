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

// ---------------------------------------------------------------------------
// Hero: fisher apprentice (bandana, striped shirt, rubber apron, boots)
// and the frozen tuna weapon. Original pixel art; frames are composed in code.
// ---------------------------------------------------------------------------

const HERO_PALETTE: Record<string, string> = {
  '#': '#24182b',
  'K': '#3a2a26',
  'k': '#5b4038',
  'S': '#ffd8be',
  's': '#f0b08e',
  'R': '#e63946',
  'r': '#a4161a',
  'W': '#ffffff',
  'B': '#5aa9e6',
  'b': '#3b7fb8',
  'O': '#ffb238',
  'o': '#d9822b',
  'T': '#5c677d',
  't': '#3e4a5e',
  'L': '#4caf6a',
  'l': '#2f7a48',
  'E': '#24182b',
  'P': '#ff8fa3',
};

const TUNA_PALETTE: Record<string, string> = {
  '#': '#1a2236',
  'N': '#2f5d9e',
  'n': '#1d3b6e',
  'C': '#6fa8dc',
  'I': '#e3edf6',
  'i': '#a9bacd',
  'Y': '#fde047',
  'W': '#ffffff',
  'F': '#c4f1ff',
  'E': '#0f172a',
};

// 22px wide head rows (facing right)
const HERO_HEAD = [
  '.......########.......',
  '.....##RRRWRRRR##.....',
  '....#RRWRRRRRRWRR#....',
  '...#RRRRRRRRRRRRRR#...',
  '..##rrrrrrrrrrrrrr#...',
  '.#Rr#KKkKKSSSSSSSS#...',
  '#RR##KKKSSSSSSSSSSS#..',
  '.#r#.#KSSSSSSS#SSSS#..',
  '.##..#KSSSSSSS#SSSS#..',
  '.....#SSSSSSSSESSSSS#.',
  '.....#SSSSPPSSSSSPSS#.',
  '......#sSSSSSSSSSSS#..',
  '.......##ssSSSSss##...',
  '.........##ssss##.....',
];

// Torso: arms at sides
const HERO_BODY = [
  '........#BWBWBWB#.....',
  '.......#BWOOOOOOW#....',
  '......#BW#OOOOOO#BW#..',
  '......#SS#OOWOOO#SS#..',
  '.......##bOOOOOOb##...',
  '.........#OOOOOO#.....',
  '.........#oOOOOo#.....',
  '.........#oooooo#.....',
];

// Torso: arms thrust forward for the swing
const HERO_BODY_SWING = [
  '........#BWBWBWB#.....',
  '.......#BWOOOOOOWBWB#.',
  '.......#BOOOOOOOBWBSS#',
  '.......#bOOWOOOO#####.',
  '........#bOOOOOOb#....',
  '.........#OOOOOO#.....',
  '.........#oOOOOo#.....',
  '.........#oooooo#.....',
];

// hero legs idle
const HERO_LEGS_IDLE = [
  '.........#TT##TT#.....',
  '.........#TT##TT#.....',
  '........#LLL##LLL#....',
  '........#LLL##LLL#....',
  '........#lllL#lllL#...',
  '........#########.....',
];

// hero legs walk a
const HERO_LEGS_WALK_A = [
  '.........#TT#TT#......',
  '........#TT#..#TT#....',
  '.......#LLL#..#LLL#...',
  '.......#LLL#..#LLL#...',
  '......#lllL#...#lllL#.',
  '......######...######.',
];

// hero legs walk b
const HERO_LEGS_WALK_B = [
  '..........#TTTT#......',
  '..........#TTTT#......',
  '.........#LLLLL#......',
  '.........#LLLLL#......',
  '.........#lllllL#.....',
  '.........########.....',
];

// 32x15 frozen tuna, head facing right
const FROZEN_TUNA = [
  '................#n#.............',
  '.#..........#..#nnn#............',
  '#n#.......##Y##nnnnn#...........',
  '#Nn#....##Ynnnnnnnnnn####.......',
  '.#Nn#..#YnnnWNNNNNFnnnnFn###....',
  '..#Nn##nnNFNNNNNNNNNNNNNNnnW#...',
  '...#Nn#NNNNCCCCCCCCCCCNNnNNWE##.',
  '...#NNCCCCCCCCCCCCCCCnnCiCCCCCn#',
  '...#Ii#IIIIIIIIIIIIFnnIIiIIIi##.',
  '..#Ii##iiIIIIIFIIIIIIIIIiiF##...',
  '.#Ii#..#Yiiiiiiiiiiiiiii###.....',
  '#Ii#....##Y#iiiiiiii####........',
  '#i#.......##Y#######............',
  '.#..........#...................',
  '................................',
];

// 30x25 frozen tuna carried diagonally over the shoulder
const FROZEN_TUNA_DIAGONAL = [
  '............................#.',
  '........................####n#',
  '.............#......####WWECn#',
  '............#n####.#FnNnNWC##.',
  '.............#nnnn#nnNnNCCIi#.',
  '............#nnnnnnNNNNiCI##..',
  '............#nnnFnNNCnCiiiF#..',
  '..........#.#nnNNNCCCnIIi##...',
  '.........#Y#nNNNNCCCnnIIi#....',
  '.........#nnNNNCCCCFFIii#.....',
  '........#YnnNNCCCIIIIii#......',
  '........#nnNCCCCIIIiii#.......',
  '.......#YNNNCCCIFIiii#........',
  '.#.....#nnNCCIIIFiii#.........',
  '#n######NNCCIIIiiii#..........',
  '.#NNnnnnCCIIIIiii##...........',
  '..####NNC#IiiiY#Y#............',
  '......#Ii#i#Y##.#.............',
  '......#Ii##.#.................',
  '......#I#.....................',
  '......#I#.....................',
  '......#i#.....................',
  '......#i#.....................',
  '......#i#.....................',
  '.......#......................',
];

const HERO_CANVAS_W = 80;
const HERO_CANVAS_H = 36;
const HERO_HEAD_Y = 8; // body sits below the raised tuna

function blitMatrix(
  ctx: CanvasRenderingContext2D,
  rows: string[],
  palette: Record<string, string>,
  ox: number,
  oy: number
): void {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const color = palette[row[x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

/** Compose one hero frame (facing right, centered horizontally, feet on the bottom row). */
function composeHeroFrame(kind: 'idle' | 'walkA' | 'walkB' | 'swing'): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = HERO_CANVAS_W;
  c.height = HERO_CANVAS_H;
  const ctx = c.getContext('2d')!;
  const hx = HERO_CANVAS_W / 2 - 11;
  const hy = HERO_HEAD_Y;
  if (kind === 'swing') {
    blitMatrix(ctx, [...HERO_HEAD, ...HERO_BODY_SWING, ...HERO_LEGS_WALK_A], HERO_PALETTE, hx, hy);
    blitMatrix(ctx, FROZEN_TUNA, TUNA_PALETTE, hx + 19, hy + 9);
    blitMatrix(ctx, ['#SS#', '#SS#'], HERO_PALETTE, hx + 19, hy + 15);
  } else {
    const legs =
      kind === 'walkA' ? HERO_LEGS_WALK_A : kind === 'walkB' ? HERO_LEGS_WALK_B : HERO_LEGS_IDLE;
    blitMatrix(ctx, FROZEN_TUNA_DIAGONAL, TUNA_PALETTE, hx - 1, 2);
    blitMatrix(ctx, [...HERO_HEAD, ...HERO_BODY, ...legs], HERO_PALETTE, hx, hy);
  }
  return c;
}

function buildHeroSheet(): HeroSheetFrames {
  const idle = composeHeroFrame('idle');
  const walk = [composeHeroFrame('walkA'), composeHeroFrame('walkB')];
  const swing = composeHeroFrame('swing');
  return {
    idle,
    idleFlash: makeWhiteMask(idle),
    walk,
    walkFlash: walk.map(makeWhiteMask),
    swing,
    swingFlash: makeWhiteMask(swing),
    baseHeight: HERO_CANVAS_H,
  };
}

// ---------------------------------------------------------------------------
// Original code-drawn pixel art for coins, effects, UI icons and cursors.
// (Replaces the previously bundled third-party GIF/PNG assets.)
// ---------------------------------------------------------------------------

// 10x10 coin; X = face, x = rim/shadow, H = highlight
const TIER_COIN_MATRIX = [
  '...####...',
  '..#HXXX#..',
  '.#HXXXXx#.',
  '#HXXxxXXx#',
  '#XXx##xXx#',
  '#XXx##xXx#',
  '#XXXxxXXx#',
  '.#XXXXxx#.',
  '..#xxxx#..',
  '...####...',
];

const COIN_TIER_PALETTES = {
  bronze: { X: '#d9925b', x: '#9a5b32', H: '#f7c79a' },
  silver: { X: '#cbd5e1', x: '#7c8799', H: '#ffffff' },
  gold: { X: '#ffd166', x: '#d08a1e', H: '#fff4c2' },
} as const;

// 14x14 coin pouch
const COIN_POUCH_MATRIX = [
  '....##..##....',
  '...#aa##aa#...',
  '....#aaaa#....',
  '.....#RR#.....',
  '....#AAAA#....',
  '...#AAAAAA#...',
  '..#AAWAAAAA#..',
  '.#AAAAA##AAA#.',
  '.#AAAA#GG#AA#.',
  '.#AAAA#Gg#AA#.',
  '.#aAAAA##AAa#.',
  '..#aaAAAAaa#..',
  '...##aaaa##...',
  '.....####.....',
];

// 19x9 "HIT!" badge
const HIT_BADGE_MATRIX = [
  '###################',
  '#OrrrrrrrrrrrrrrrO#',
  '#OrWrWrWWWrWWWrWrO#',
  '#OrWrWrrWrrrWrrWrO#',
  '#OrWWWrrWrOrWrrWrO#',
  '#OrWrWrrWrrrWrrrrO#',
  '#OrWrWrWWWrrWrrWrO#',
  '#OrrrrrrrrrrrrrrrO#',
  '###################',
];

// 16x16 star burst for level-up banner
const LEVEL_STAR_MATRIX = [
  '.......##.......',
  '.......##.......',
  '......#YY#......',
  '......#YY#......',
  '.....#YWWY#.....',
  '####.#YWWY#.####',
  '#YYY##YWWY##YYY#',
  '.#YYYYYWWYYYYY#.',
  '..#YYYYWWYYYY#..',
  '...#YYYYYYYY#...',
  '...#YYYggYYY#...',
  '..#YYYg##gYYY#..',
  '..#YYg#..#gYY#..',
  '.#Yg##....##gY#.',
  '.###........###.',
  '................',
];

// 12x12 hint lightbulb
const BULB_MATRIX = [
  '...######...',
  '..#YYYYWW#..',
  '.#YYYYYYWW#.',
  '.#YYYYYYYW#.',
  '.#YYYYYYYY#.',
  '.#gYYYYYYg#.',
  '..#gYYYYg#..',
  '...#gYYg#...',
  '...#TTTT#...',
  '...#tttt#...',
  '...#TTTT#...',
  '....####....',
];

// 12x12 quest scroll with "!"
const QUEST_MATRIX = [
  '.##########.',
  '#aAAAAAAAAa#',
  '.#WWWWWWWW#.',
  '.#WWW##WWW#.',
  '.#WWW#E#WW#.',
  '.#WWW#E#WW#.',
  '.#WWW#E#WW#.',
  '.#WWWW#WWW#.',
  '.#WWW##WWW#.',
  '.#WWW#E#WW#.',
  '#aAAAAAAAAa#',
  '.##########.',
];

// 12x16 arrow cursor
const CURSOR_DEFAULT_MATRIX = [
  '#...........',
  '##..........',
  '#W#.........',
  '#WW#........',
  '#WWW#.......',
  '#WWWW#......',
  '#WWWWW#.....',
  '#WWWWWW#....',
  '#WWWWWWW#...',
  '#WWWWWWWW#..',
  '#WWWWW#####.',
  '#WW#WW#.....',
  '#W#.#WW#....',
  '##..#WW#....',
  '.....#WW#...',
  '.....###....',
];

// 14x16 pointing-hand cursor
const CURSOR_POINTER_MATRIX = [
  '....##........',
  '...#WW#.......',
  '...#WW#.......',
  '...#WW#.......',
  '...#WW###.....',
  '...#WW#WW###..',
  '.###WW#WW#WW#.',
  '#WW#WWWWW#WW##',
  '#WWWWWWWWWWWW#',
  '.#WWWWWWWWWWW#',
  '.#WWWWWWWWWWW#',
  '..#WWWWWWWWW#.',
  '..#WWWWWWWWW#.',
  '...#WWWWWWW#..',
  '...#WWWWWWW#..',
  '...#########..',
];

function scaleCanvas(src: HTMLCanvasElement, scale: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = src.width * scale;
  c.height = src.height * scale;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

/** Translucent bubble dome for the evolved shield, drawn procedurally. */
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

let cachedUiIcons: UiIcons | null = null;

/** Data-URL icons for React UI and CSS cursors (all original pixel art). */
export function getUiIcons(): UiIcons {
  if (cachedUiIcons) return cachedUiIcons;
  const url = (rows: string[], scale: number, pal?: Record<string, string>) =>
    scaleCanvas(renderMatrixToCanvas(rows, pal), scale).toDataURL();
  cachedUiIcons = {
    levelStar: url(LEVEL_STAR_MATRIX, 4),
    frozenTuna: url(FROZEN_TUNA, 4, TUNA_PALETTE),
    coinGold: url(TIER_COIN_MATRIX, 3, COIN_TIER_PALETTES.gold),
    coinPouch: url(COIN_POUCH_MATRIX, 3),
    bulb: url(BULB_MATRIX, 3),
    quest: url(QUEST_MATRIX, 3),
    cursorDefault: url(CURSOR_DEFAULT_MATRIX, 2),
    cursorPointer: url(CURSOR_POINTER_MATRIX, 2),
  };
  return cachedUiIcons;
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
  icons: Record<WeaponId | PassiveId, string>; // data URLs for React UI
}

let cachedBank: SpriteBank | null = null;

export function getSpriteBank(): SpriteBank {
  if (cachedBank) return cachedBank;

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
  icons.greatsword = scaleCanvas(renderMatrixToCanvas(FROZEN_TUNA, TUNA_PALETTE), 3).toDataURL();

  const bank: SpriteBank = {
    heroSheet: buildHeroSheet(),
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
    coinBronze: renderMatrixToCanvas(TIER_COIN_MATRIX, COIN_TIER_PALETTES.bronze),
    coinSilver: renderMatrixToCanvas(TIER_COIN_MATRIX, COIN_TIER_PALETTES.silver),
    coinGold: renderMatrixToCanvas(TIER_COIN_MATRIX, COIN_TIER_PALETTES.gold),
    coinPouch: renderMatrixToCanvas(COIN_POUCH_MATRIX),
    hitBadge: scaleCanvas(renderMatrixToCanvas(HIT_BADGE_MATRIX), 2),
    shieldDome: makeShieldDome(),
    icons,
  };

  cachedBank = bank;
  return cachedBank;
}
