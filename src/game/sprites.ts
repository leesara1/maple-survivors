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

// ---------------------------------------------------------------------------
// Monsters: original chibi pixel art (thick outline, big sparkly eyes, blush,
// 3-tone shading). Rendered with MOB_PALETTE.
// ---------------------------------------------------------------------------
const MOB_PALETTE: Record<string, string> = {
  '#': '#24182b',
  'W': '#ffffff',
  'R': '#ff8fa3',
  'G': '#ffd166',
  'g': '#e09f3e',
  'Y': '#fde047',
  'E': '#ef4444',
  'U': '#38bdf8',
  'O': '#fb923c',
  'N': '#c4f7e3',
  'M': '#6ee7b7',
  'm': '#34d399',
  'n': '#1f9d75',
  'I': '#d9a877',
  'A': '#b07d4f',
  'a': '#875a36',
  'J': '#f2c58a',
  'j': '#d39a58',
  'Z': '#f3e8ff',
  'P': '#d8b4fe',
  'p': '#a87ee8',
  'V': '#7e22ce',
  'v': '#581c87',
  'y': '#ffe0e8',
  'Q': '#ffb3c6',
  'q': '#ef8fab',
  'z': '#c45f7d',
  'o': '#ff9b8e',
  'F': '#ef5b5b',
  'f': '#b83a44',
  'H': '#fff3df',
  'h': '#e6cba3',
  'u': '#cbd5e1',
  'T': '#94a3b8',
  't': '#64748b',
  'L': '#74c69d',
  'l': '#2d6a4f',
  'B': '#4ea8de',
  'K': '#3b2a4d',
  'k': '#5b4570',
};

// Jelly drop slime (18x16)
const JELLY_0 = [
  '........##........',
  '.......#NN#.......',
  '......#NMMM#......',
  '.....#NMMMMM#.....',
  '...##NNMMMMMM##...',
  '..#NNWWMMMMMMMm#..',
  '.#NNWWMMMMMMMMMm#.',
  '.#NMMMMMMMMMMMMm#.',
  '#NMMM#WMMMMM#WMMm#',
  '#MMMM##MMMMM##MMm#',
  '#MMMM##MMMMM##MMm#',
  '#MMRRMMMM#MMMMRRm#',
  '#mMMMMMMMMMMMMMmm#',
  '.#mmmMMMMMMMMmmn#.',
  '..##nnmmmmmmnn##..',
  '....##########....',
];

const JELLY_1 = [
  '..................',
  '..................',
  '........##........',
  '.......#NM#.......',
  '....###NMMM###....',
  '..##NNWWMMMMMMm##.',
  '.#NNWWMMMMMMMMMm#.',
  '#NMMM#WMMMMM#WMMm#',
  '#MMMM##MMMMM##MMm#',
  '#MMMM##MMMMM##MMm#',
  '#MMRRMMMM#MMMMRRm#',
  '#mMMMMMMMMMMMMMmm#',
  '#mmmMMMMMMMMMMmmn#',
  '.##nnmmmmmmmmnn##.',
  '...############...',
  '..................',
];

// Acorn soldier (18x17)
const ACORN_0 = [
  '.........##.......',
  '........#aa#......',
  '.....####aa####...',
  '....#IIAAAAAAAA#..',
  '...#IAAIAAIAAIAa#.',
  '...#AaAAaAAaAAaa#.',
  '...##############.',
  '...#JJJJJJJJJJjj#.',
  '..#JJ#WJJJJ#WJJjj#',
  '..#JJ##JJJJ##JJjj#',
  '..#JR##JJJJ##RJjj#',
  '..#JJJJJ##JJJJjjj#',
  '...#jJJJJJJJJjjj#.',
  '....#jjjjjjjjjj#..',
  '.....##########...',
  '......#a#..#a#....',
  '......###..###....',
];

const ACORN_1 = [
  '.........##.......',
  '........#aa#......',
  '.....####aa####...',
  '....#IIAAAAAAAA#..',
  '...#IAAIAAIAAIAa#.',
  '...#AaAAaAAaAAaa#.',
  '...##############.',
  '...#JJJJJJJJJJjj#.',
  '..#JJ#WJJJJ#WJJjj#',
  '..#JJ##JJJJ##JJjj#',
  '..#JR##JJJJ##RJjj#',
  '..#JJJJJ##JJJJjjj#',
  '...#jJJJJJJJJjjj#.',
  '....#jjjjjjjjjj#..',
  '.....##########...',
  '.....#a#....#a#...',
  '.....###....###...',
];

// Wisp ghost (18x16)
const GHOST_0 = [
  '..................',
  '......######......',
  '....##ZZPPPP##....',
  '...#ZZZPPPPPPP#...',
  '..#ZZWPPPPPPPPP#..',
  '.#ZZWPPPPPPPPPPp#.',
  '.#ZPP#WPPPP#WPPp#.',
  '.#PPP##PPPP##PPp#.',
  '.#PPP##PPPP##PPp#.',
  '.#PRRPPP##PPPRRp#.',
  '.#PPPPPPPPPPPPPp#.',
  '.#PPPPPPPPPPPPpp#.',
  '.#pPPPPPPPPPPppp#.',
  '.#pppPpppppPpppp#.',
  '..#pp##ppp##ppp#..',
  '...##..###..###...',
];

const GHOST_1 = [
  '......######......',
  '....##ZZPPPP##....',
  '...#ZZZPPPPPPP#...',
  '..#ZZWPPPPPPPPP#..',
  '.#ZZWPPPPPPPPPPp#.',
  '.#ZPP#WPPPP#WPPp#.',
  '.#PPP##PPPP##PPp#.',
  '.#PPP##PPPP##PPp#.',
  '.#PRRPPP##PPPRRp#.',
  '.#PPPPPPPPPPPPPp#.',
  '.#PPPPPPPPPPPPpp#.',
  '.#pPPPPPPPPPPppp#.',
  '.#ppppPppppPpppp#.',
  '.#ppp##ppp##pp#...',
  '..###..###..##....',
  '..................',
];

// Cotton-candy piglet (18x15)
const PIGLET_0 = [
  '..##..........##..',
  '.#Qq#........#qQ#.',
  '.#QQq########qQQ#.',
  '.#QyyyQQQQQQQQQq#.',
  '#QyyWQQQQQQQQQQQq#',
  '#QyQ#WQQQQQQ#WQQq#',
  '#QQQ##QQQQQQ##QQq#',
  '#QRRQQzzzzzzQRRQq#',
  '#QQQQQzQzzQzQQQQq#',
  '#qQQQQQzzzzQQQQqq#',
  '.#qQQQQQQQQQQQqq#.',
  '.#qqQQQQQQQQQqqq#.',
  '..#qqqqqqqqqqqq#..',
  '..#zz#.####.#zz#..',
  '..###........###..',
];

const PIGLET_1 = [
  '..##..........##..',
  '.#Qq#........#qQ#.',
  '.#QQq########qQQ#.',
  '.#QyyyQQQQQQQQQq#.',
  '#QyyWQQQQQQQQQQQq#',
  '#QyQ#WQQQQQQ#WQQq#',
  '#QQQ##QQQQQQ##QQq#',
  '#QRRQQzzzzzzQRRQq#',
  '#QQQQQzQzzQzQQQQq#',
  '#qQQQQQzzzzQQQQqq#',
  '.#qQQQQQQQQQQQqq#.',
  '.#qqQQQQQQQQQqqq#.',
  '..#qqqqqqqqqqqq#..',
  '...#zz#....#zz#...',
  '...####....####...',
];

// Spotted cap mushroom (18x16)
const MUSHROOM_0 = [
  '......######......',
  '....##FFoFFF##....',
  '...#FoWWFFFFFF#...',
  '..#FoWWFFFFWWFFf#.',
  '.#FFFFFFFFFFWWFff#',
  '#FWWFFFFFFFFFFFff#',
  '#fFFFFFWWFFFFFfff#',
  '.##ffffffffffff##.',
  '...#HHHHHHHHHHh#..',
  '...#H#WHHHH#WHh#..',
  '...#H##HHHH##Hh#..',
  '...#RHHH##HHHRh#..',
  '...#hHHHHHHHHhh#..',
  '....#hhhhhhhh#....',
  '....#hh#..#hh#....',
  '....####..####....',
];

const MUSHROOM_1 = [
  '......######......',
  '....##FFoFFF##....',
  '...#FoWWFFFFFF#...',
  '..#FoWWFFFFWWFFf#.',
  '.#FFFFFFFFFFWWFff#',
  '#FWWFFFFFFFFFFFff#',
  '#fFFFFFWWFFFFFfff#',
  '.##ffffffffffff##.',
  '...#HHHHHHHHHHh#..',
  '...#H#WHHHH#WHh#..',
  '...#H##HHHH##Hh#..',
  '...#RHHH##HHHRh#..',
  '...#hHHHHHHHHhh#..',
  '....#hhhhhhhh#....',
  '...#hh#....#hh#...',
  '...####....####...',
];

// Elite mossy stone golem (22x16)
const GOLEM_0 = [
  '......##......##......',
  '.....#LL#....#LL#.....',
  '....##LLL####LLL##....',
  '...#uuLLTTTTTTLLTTt#..',
  '..#uuTTTTTTTTTTTTTTt#.',
  '..#uTTT###TTTT###TTt#.',
  '..#uTTT#O#TTTT#O#TTt#.',
  '..#TTTT###TTTT###TTt#.',
  '..#TTTTTTTT##TTTTTtt#.',
  '.##TTLTTTTTTTTTTTLTt##',
  '#uu#TTTTTTTTTTTTTt#tt#',
  '#uT#tTTTTTTTTTTTtt#Tt#',
  '#TT#tttttttttttttt#tt#',
  '.##.#TTTT#..#TTTT#.##.',
  '....#tttt#..#tttt#....',
  '....######..######....',
];

const GOLEM_1 = [
  '......##......##......',
  '.....#LL#....#LL#.....',
  '....##LLL####LLL##....',
  '...#uuLLTTTTTTLLTTt#..',
  '..#uuTTTTTTTTTTTTTTt#.',
  '..#uTTT###TTTT###TTt#.',
  '..#uTTT#O#TTTT#O#TTt#.',
  '..#TTTT###TTTT###TTt#.',
  '..#TTTTTTTT##TTTTTtt#.',
  '.##TTLTTTTTTTTTTTLTt##',
  '#uu#TTTTTTTTTTTTTt#tt#',
  '#uT#tTTTTTTTTTTTtt#Tt#',
  '#TT#tttttttttttttt#tt#',
  '.##..#TTTT#.#TTTT#.##.',
  '.....#tttt#.#tttt#....',
  '.....######.######....',
];

// Boss: crowned king jelly
const BOSS_JELLY_0 = [
  '.......#.....#.....#......',
  '......#G#...#G#...#G#.....',
  '......#GG###GYG###GG#.....',
  '......#GGEGGGUGGGEGG#.....',
  '......###############.....',
  '....###NNMMMMMMMMMMM###...',
  '...#NNNWWMMMMMMMMMMMMm#...',
  '..#NNWWWMMMMMMMMMMMMMMm#..',
  '.#NNWWMMMMMMMMMMMMMMMMMm#.',
  '.#NMMMMMMMMMMMMMMMMMMMMm#.',
  '#NMMMM#W#MMMMMMMM#W#MMMmm#',
  '#MMMMM###MMMMMMMM###MMMmm#',
  '#MMMMM###MMMMMMMM###MMMmm#',
  '#MMRRRMMMMMM##MMMMMRRRMmm#',
  '#MMMMMMMMMMMMMMMMMMMMMMmm#',
  '#mMMMMMMMMMMMMMMMMMMMMmmm#',
  '.#mmMMMMMMMMMMMMMMMMMmmn#.',
  '..#nmmmmmmmmmmmmmmmmmnn#..',
  '...###nnnnnnnnnnnnnnn###..',
  '......###############.....',
];

// Boss: ancient acorn general
const BOSS_ACORN_0 = [
  '............##............',
  '...........#GG#...........',
  '.......####GGGG####.......',
  '.....##GGYGGGGGGGGg##.....',
  '....#GYYGGGGEGGGGGGgg#....',
  '...#IIAAIAAIAAIAAIAAaa#...',
  '...#AaAAaAAaAAaAAaAAaa#...',
  '...####################...',
  '....#JJJJJJJJJJJJJJjj#....',
  '...#JJ##JJJJJJJJ##JJjj#...',
  '...#J#EE#JJJJJJ#EE#Jjj#...',
  '...#J####JJJJJJ####Jjj#...',
  '...#JRRJJJJJJJJJJRRJjj#...',
  '...#JJJ##########JJJjj#...',
  '...#JJ#aaaa##aaaa#JJjj#...',
  '....#jJ##########JJjj#....',
  '..##G#jjjjjjjjjjjjjj#G##..',
  '.#GG#GGGGGBBGGGGGGGg#GG#..',
  '.#G#.#ggggggggggggg#.#G#..',
  '.##...##############..##..',
  '.......#aa#....#aa#.......',
  '.......####....####.......',
];

// Boss: twilight ghost king
const BOSS_GHOST_0 = [
  '.........#...#...#........',
  '........#Y#.#Y#.#Y#.......',
  '........#YY#YEY#YY#.......',
  '........#YYYYYYYYY#.......',
  '......###########.###.....',
  '.....##ZZZPPPPPPPPPP##....',
  '....#ZZZWPPPPPPPPPPPPp#...',
  '...#ZZWWPPPPPPPPPPPPPpp#..',
  '..#ZZWPPPPPPPPPPPPPPPPpp#.',
  '..#ZPPP#W#PPPPPPP#W#PPpp#.',
  '..#PPPP###PPPPPPP###PPpp#.',
  '..#PPPP###PPPPPPP###PPpp#.',
  '..#PRRRPPPPP###PPPPRRRpp#.',
  '..#PPPPPPPP#VVV#PPPPPPpp#.',
  '..#PPPPPPPPP###PPPPPPPpp#.',
  '..#pPPPPPPPPPPPPPPPPPppp#.',
  '..#ppPPPPPPPPPPPPPPPpppp#.',
  '..#pppPppppPppppPppppppp#.',
  '...#pp#ppp#ppp##pppp#pp#..',
  '....##.###.###..####.##...',
];

// Boss: ruinous forest lord
const BOSS_FINAL_0 = [
  '.##....................##.',
  '#EE#..................#EE#',
  '#VV#.....########.....#VV#',
  '.#VV#..##KkkkkkkK##..#VV#.',
  '..#VV##kkKKKKKKKKkk##VV#..',
  '...#VVKKKKKKKKKKKKKKVV#...',
  '...#KKKKKKKKKKKKKKKKKK#...',
  '..#KKKK##KKKKKKKK##KKKK#..',
  '..#KKK#EE#KKKKKK#EE#KKK#..',
  '..#KKK#EY#KKKKKK#YE#KKK#..',
  '..#KKKK##KKKKKKKK##KKKK#..',
  '..#KKKKKKKK#WW#KKKKKKKK#..',
  '..#KKKKKKK#W##W#KKKKKKK#..',
  '...#KKKKKKK####KKKKKKK#...',
  '.##GGGGGGGGGEEGGGGGGGGGG##',
  '#VV#GggggggggggggggggG#VV#',
  '#VV##VVVVVVVVVVVVVVVV##VV#',
  '.##.#VVvvVVVVVVVVvvVV#.##.',
  '....#VVVVVVVVVVVVVVVV#....',
  '....#vvvvvvvvvvvvvvvv#....',
  '.....#VV#..####..#VV#.....',
  '.....#vv#........#vv#.....',
  '.....####........####.....',
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
// Hero: chibi fisher apprentice (red polka-dot bandana, striped shirt, orange
// apron, boots) and the frozen tuna weapon. Original pixel art; frames are
// composed in code. The tuna is drawn first so the body hides its tail lobes.
// ---------------------------------------------------------------------------

const HERO_PALETTE: Record<string, string> = {
  '#': '#24182b',
  'K': '#4a3328',
  'k': '#6e4c3a',
  'S': '#ffd8be',
  's': '#f0b08e',
  'R': '#e63946',
  'r': '#a4161a',
  'W': '#ffffff',
  'B': '#5aa9e6',
  'b': '#3b7fb8',
  'O': '#ffb238',
  'o': '#d9822b',
  'T': '#3f5a8a',
  't': '#2c4068',
  'L': '#4caf6a',
  'l': '#2f7a48',
  'P': '#ff8fa3',
  'E': '#24182b',
};

const TUNA_PALETTE: Record<string, string> = {
  '#': '#1a2236',
  'N': '#2c4f8a',
  'n': '#1d3566',
  'C': '#5b9bd5',
  'I': '#eef4fa',
  'i': '#b4c4d6',
  'Y': '#fcd34d',
  'W': '#ffffff',
  'F': '#d6f3ff',
  'E': '#0f172a',
};

// 22px wide head (facing right)
const HERO_HEAD = [
  '.......########.......',
  '.....##RRRRRRRR##.....',
  '....#RRRWRRRRRWRRR#...',
  '...#RRWRRRRRRRRRRRR#..',
  '..#rRRRRRRRRRRRRRRRR#.',
  '..#rrrrrrrrrrrrrrrrr#.',
  '.#R#KKKkKKKSSKKSSSSS#.',
  '#Rr#KKkSSSSSSSSSSSSSS#',
  '#rR#KKSSSSSS#WSSS#WSS#',
  '.##.#KSSSSSS##SSS##SS#',
  '....#KSSSSSS##SSS##SS#',
  '....#SSSSSSPPSSSSSPPS#',
  '.....#SSSSSSSSSrSSSS#.',
  '......##sSSSSSSSSss#..',
  '........##########....',
];

// Torso: front hand at hip holding the tuna
const HERO_BODY = [
  '.........#BWBWB#......',
  '.......##BWBWBWB##....',
  '......#BW#OOOOO#WB#...',
  '......#BW#OOWOO#WB#...',
  '......#SS#OOOOO#SS#...',
  '.......##bOOOOOb##....',
  '........#oOOOOOo#.....',
  '........#ooooooo#.....',
];

// Torso: front arm raised to shoulder for the swing
const HERO_BODY_SWING = [
  '.........#BWBWB#####..',
  '.......##BWBWBWBWBSS#.',
  '......#BW#OOOOO#####..',
  '......#BW#OOWOO#......',
  '......#SS#OOOOO#......',
  '.......##bOOOOOb#.....',
  '........#oOOOOOo#.....',
  '........#ooooooo#.....',
];

const HERO_LEGS_IDLE = [
  '.........#TT#TT#......',
  '.........#TT#TT#......',
  '........#LLL#LLL#.....',
  '........#lll#lll#.....',
  '........#########.....',
];

const HERO_LEGS_WALK_A = [
  '........#TT#.#TT#.....',
  '.......#TT#...#TT#....',
  '......#LLL#...#LLL#...',
  '......#lll#...#lll#...',
  '......#####...#####...',
];

const HERO_LEGS_WALK_B = [
  '.........#TTTTT#......',
  '..........#TTT#.......',
  '.........#LLLL#.......',
  '.........#llll#.......',
  '.........######.......',
];

// 33x13 frozen tuna, head facing right; peduncle (grip) at x=7, y=6
const FROZEN_TUNA = [
  '..##............#n#..............',
  '.#NN#..........#nnn##............',
  '..#NN#......#Y#NNNNNN####........',
  '...#NN#...#YNNNNNNNFNNNNN####....',
  '....#NN##YNNNFNNNNNNNNNNNnNNE#...',
  '.....#NNNNNNNNNNNNNNNNNNnNNWEN##.',
  '......#nCCCCCCCCCCCCCCCCnCCCCCCC#',
  '.....#iiiiFIIIIFIIIICCIIiIIIIiii#',
  '....#ii##YiiIIIIIIIIIFIIIiiii###.',
  '...#ii#...#YiiiIIIIIIIiiii###....',
  '..#ii#......#Y#iiiiiii####.......',
  '.#ii#..........##ii###...........',
  '..##.............##..............',
];

const HERO_CANVAS_W = 32;
const HERO_CANVAS_H = 30;
const HERO_HEAD_Y = 1;
const HERO_X = HERO_CANVAS_W / 2 - 11;
const HERO_BODY_Y = HERO_HEAD_Y + 15; // HERO_HEAD has 15 rows
/** Pixel coords (in the tuna matrix) of the grip point on the tail stalk. */
const TUNA_GRIP = { x: 7.5, y: 6.5 };
/** Hand pivot points (in hero frame pixels) the tuna rotates around. */
const HAND_IDLE = { x: HERO_X + 17, y: HERO_BODY_Y + 4.5 };
const HAND_SWING = { x: HERO_X + 19, y: HERO_BODY_Y + 1.5 };

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

/**
 * Compose one hero frame (facing right, centered horizontally, feet on the bottom row).
 * The tuna is NOT baked in: the engine draws it rotated around the hand pivot so it
 * can actually be swung.
 */
function composeHeroFrame(kind: 'idle' | 'walkA' | 'walkB' | 'swing'): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = HERO_CANVAS_W;
  c.height = HERO_CANVAS_H;
  const ctx = c.getContext('2d')!;
  const body = kind === 'swing' ? HERO_BODY_SWING : HERO_BODY;
  const legs =
    kind === 'walkB' ? HERO_LEGS_WALK_B : kind === 'idle' ? HERO_LEGS_IDLE : HERO_LEGS_WALK_A;
  blitMatrix(ctx, [...HERO_HEAD, ...body, ...legs], HERO_PALETTE, HERO_X, HERO_HEAD_Y);
  return c;
}

function buildHeroSheet(): HeroSheetFrames {
  const idle = composeHeroFrame('idle');
  const walk = [composeHeroFrame('walkA'), composeHeroFrame('walkB')];
  const swing = composeHeroFrame('swing');
  const tuna = renderMatrixToCanvas(FROZEN_TUNA, TUNA_PALETTE);
  return {
    idle,
    idleFlash: makeWhiteMask(idle),
    walk,
    walkFlash: walk.map(makeWhiteMask),
    swing,
    swingFlash: makeWhiteMask(swing),
    baseHeight: HERO_CANVAS_H,
    tuna,
    tunaFlash: makeWhiteMask(tuna),
    tunaGrip: TUNA_GRIP,
    handIdle: HAND_IDLE,
    handSwing: HAND_SWING,
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
  /** Frozen tuna weapon (head facing right), drawn separately so it can rotate. */
  tuna: HTMLCanvasElement;
  tunaFlash: HTMLCanvasElement;
  /** Grip point inside the tuna sprite (pixels). */
  tunaGrip: { x: number; y: number };
  /** Hand pivot inside the idle/walk and swing frames (pixels). */
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
  icons: Record<WeaponId | PassiveId, string>; // data URLs for React UI
}

let cachedBank: SpriteBank | null = null;

export function getSpriteBank(): SpriteBank {
  if (cachedBank) return cachedBank;

  const makePair = (matrices: string[][]): SpriteFramePair => {
    const frames = matrices.map((m) => renderMatrixToCanvas(m, MOB_PALETTE));
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
      piglet: makePair([PIGLET_0, PIGLET_1]),
      mushroom: makePair([MUSHROOM_0, MUSHROOM_1]),
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
