/* ==========================================================================
   ASSETS MANIFEST
   ----------------------------------------------------------------------
   Snack Shack tiles (icecream, cottoncandy, hotdog, corn, pizza, star) are
   real exports pulled from the Figma file (key 1gB6n3IDqII5eBfzkRyqAz, node
   2005-72) via the figma-dev MCP server, saved under assets/img/. Barnyard
   Bash tiles have no matching Figma art yet, so they keep the hand-built
   inline SVG placeholders below.
   ========================================================================== */

const ASSET_BASE = "assets/img/";

const REAL_IMG = {
  icecream: "icecream.svg",
  cottoncandy: "cottoncandy.png",
  hotdog: "hotdog.png",
  corn: "corn.svg",
  pizza: "pizza.svg",
  star: "star.svg?v=3",
  goat: "farm_goat.svg",
  chicken: "farm_chicken.svg",
  pig: "farm_pig.svg",
  cow: "farm_cow.svg",
  llama: "farm_llama.png",
  bear: "fun_bear.svg",
  fair: "fun_fair.svg",
  balloons: "fun_balloons.svg",
  horse: "fun_horse.svg",
  coaster: "fun_coaster.png",
};

function svgWrap(inner, bg) {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">` +
    (bg ? `<rect x="3" y="3" width="114" height="114" rx="26" fill="${bg}"/>
           <path d="M17 3 h86 q14 0 14 14 v30 q-52 14 -114 0 v-30 q0 -14 14 -14 Z" fill="#ffffff" opacity="0.16"/>
           <rect x="3" y="3" width="114" height="114" rx="26" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="2"/>` : "") +
    inner + `</svg>`;
}

const TILE_SVG = {
  // ---------------- Level 1: Snack Shack ----------------
  icecream: svgWrap(`
    <path d="M42 58 L78 58 L62 104 Q60 108 58 104 Z" fill="#f2c88f"/>
    <path d="M40 58 h40 M44 66 h32 M48 74 h24" stroke="#d9a768" stroke-width="2" fill="none"/>
    <circle cx="60" cy="46" r="24" fill="#ffb8d6"/>
    <circle cx="46" cy="38" r="15" fill="#fff1e6"/>
    <circle cx="70" cy="36" r="14" fill="#ffb8d6"/>
    <circle cx="60" cy="26" r="6" fill="#e6446f"/>
  `, "#3fae5e"),

  cottoncandy: svgWrap(`
    <rect x="57" y="70" width="6" height="34" rx="3" fill="#e8c39a"/>
    <circle cx="45" cy="50" r="20" fill="#7fd7f0"/>
    <circle cx="63" cy="38" r="22" fill="#ffb3d9"/>
    <circle cx="78" cy="54" r="18" fill="#7fd7f0"/>
    <circle cx="55" cy="60" r="17" fill="#ffcfe8"/>
  `, "#ffc93c"),

  hotdog: svgWrap(`
    <path d="M22 60 Q22 40 44 40 L76 40 Q98 40 98 60 Q98 80 76 80 L44 80 Q22 80 22 60Z" fill="#e8b978"/>
    <rect x="34" y="52" width="52" height="18" rx="9" fill="#b5502f"/>
    <path d="M36 60 q6 -8 12 0 t12 0 t12 0 t12 0" stroke="#f4d23a" stroke-width="4" fill="none" stroke-linecap="round"/>
  `, "#8a5cf6"),

  pizza: svgWrap(`
    <path d="M60 20 L100 96 Q60 112 20 96 Z" fill="#f2a33d"/>
    <path d="M22 96 Q60 110 98 96" fill="none" stroke="#e0d3a0" stroke-width="8" stroke-linecap="round"/>
    <circle cx="55" cy="55" r="7" fill="#c1432b"/>
    <circle cx="72" cy="68" r="7" fill="#c1432b"/>
    <circle cx="50" cy="78" r="6" fill="#c1432b"/>
  `, "#e1493c"),

  corn: svgWrap(`
    <rect x="56" y="80" width="8" height="30" rx="4" fill="#c98f4f"/>
    <ellipse cx="60" cy="55" rx="28" ry="38" fill="#eec25c"/>
    <g fill="#c98f34">
      <circle cx="46" cy="38" r="2"/><circle cx="58" cy="30" r="2"/><circle cx="72" cy="40" r="2"/>
      <circle cx="40" cy="55" r="2"/><circle cx="78" cy="58" r="2"/><circle cx="50" cy="70" r="2"/>
      <circle cx="68" cy="74" r="2"/><circle cx="60" cy="52" r="2"/>
    </g>
    <path d="M42 55 q6 -8 12 0 t12 0 t12 0" stroke="#f4d23a" stroke-width="4" fill="none" stroke-linecap="round"/>
  `, "#2e8be6"),

  // ---------------- Level 2: Barnyard Bash ----------------
  cow: svgWrap(`
    <ellipse cx="60" cy="66" rx="34" ry="30" fill="#ffffff"/>
    <path d="M34 46 q10 -14 20 -2 q6 -10 16 0 q10 -12 20 2 q-4 14 -16 10 q-4 8 -12 6 q-8 2 -12 -6 q-12 4 -16 -10Z" fill="#3a3a3a"/>
    <ellipse cx="60" cy="78" rx="16" ry="11" fill="#f6c9d6"/>
    <circle cx="53" cy="78" r="2.5" fill="#7a4a4a"/>
    <circle cx="67" cy="78" r="2.5" fill="#7a4a4a"/>
    <circle cx="46" cy="58" r="5" fill="#3a3a3a"/>
    <circle cx="74" cy="58" r="5" fill="#3a3a3a"/>
    <path d="M30 50 q-6 -8 0 -14 M90 50 q6 -8 0 -14" stroke="#e7cba3" stroke-width="6" fill="none" stroke-linecap="round"/>
  `, "#8ecae6"),

  pig: svgWrap(`
    <circle cx="60" cy="62" r="34" fill="#f7b6c6"/>
    <path d="M32 42 q6 -14 16 -4Z" fill="#f19cb2"/>
    <path d="M88 42 q-6 -14 -16 -4Z" fill="#f19cb2"/>
    <ellipse cx="60" cy="72" rx="17" ry="12" fill="#ee8fa8"/>
    <circle cx="53" cy="72" r="3" fill="#8a4a5a"/>
    <circle cx="67" cy="72" r="3" fill="#8a4a5a"/>
    <circle cx="47" cy="54" r="5" fill="#5a3540"/>
    <circle cx="73" cy="54" r="5" fill="#5a3540"/>
  `, "#ffb4c6"),

  chicken: svgWrap(`
    <circle cx="60" cy="66" r="30" fill="#fff6e0"/>
    <path d="M40 42 q6 -16 14 -4 q6 -14 12 0 q8 -12 14 4" fill="none" stroke="#e2523b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M60 70 L74 76 L60 82 Z" fill="#f2a33d"/>
    <circle cx="50" cy="60" r="5" fill="#3a3a3a"/>
    <circle cx="70" cy="60" r="5" fill="#3a3a3a"/>
    <circle cx="38" cy="72" r="6" fill="#f7b6c6" opacity="0.8"/>
    <circle cx="82" cy="72" r="6" fill="#f7b6c6" opacity="0.8"/>
  `, "#ffd97d"),

  goat: svgWrap(`
    <ellipse cx="60" cy="66" rx="30" ry="32" fill="#f3ead8"/>
    <path d="M46 36 q-4 -14 6 -16 q2 10 -2 18Z" fill="#d8c69f"/>
    <path d="M74 36 q4 -14 -6 -16 q-2 10 2 18Z" fill="#d8c69f"/>
    <path d="M55 84 q5 14 10 0Z" fill="#d8c69f"/>
    <ellipse cx="60" cy="78" rx="10" ry="8" fill="#e3d3ae"/>
    <circle cx="49" cy="58" r="5" fill="#4a3a2a"/>
    <circle cx="71" cy="58" r="5" fill="#4a3a2a"/>
  `, "#cbb787"),

  llama: svgWrap(`
    <ellipse cx="60" cy="70" rx="26" ry="22" fill="#f1e3cf"/>
    <ellipse cx="60" cy="48" rx="16" ry="20" fill="#f6ecdb"/>
    <ellipse cx="60" cy="56" rx="9" ry="12" fill="#fbf6ea"/>
    <path d="M46 32 q-2 -12 6 -14 q2 8 -2 15Z" fill="#e3d0ab"/>
    <path d="M74 32 q2 -12 -6 -14 q-2 8 2 15Z" fill="#e3d0ab"/>
    <circle cx="52" cy="46" r="4" fill="#3a3a3a"/>
    <circle cx="68" cy="46" r="4" fill="#3a3a3a"/>
  `, "#e8d9c0"),

  // ---------------- Shared special tile ----------------
  star: svgWrap(`
    <path d="M60 20 L70 48 L100 48 L76 66 L86 96 L60 78 L34 96 L44 66 L20 48 L50 48 Z"
      fill="#ffd23f" stroke="#e8a412" stroke-width="3" stroke-linejoin="round"/>
  `, "#b347d8"),
};

function tileMarkup(type) {
  if (type === "star") {
    // star.svg's card sits inside a larger padded canvas (room for its drop
    // shadow to bleed into) unlike the other tile exports, which fill their
    // canvas edge-to-edge — so it can't just use width/height:100% like the
    // rest without looking visibly smaller. Crop to just the card region.
    return `<div class="tile-star-crop"><img src="${ASSET_BASE}${REAL_IMG.star}" alt="" draggable="false" style="pointer-events:none;" /></div>`;
  }
  const img = REAL_IMG[type];
  if (img) {
    return `<img src="${ASSET_BASE}${img}" alt="" draggable="false" style="object-fit:contain;pointer-events:none;" />`;
  }
  return TILE_SVG[type] || TILE_SVG.star;
}

/* ==========================================================================
   BOARD MASK — irregular ~9x9 "blob" shape.
   1 = active/playable cell, 0 = empty/inactive corner-edge cell.
   ========================================================================== */
const BOARD_MASK = [
  [0,0,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,0,0],
];

/* ==========================================================================
   LEVEL DEFINITIONS
   ========================================================================== */
/* Each theme (food/farm/fun) is meant to hold 2 levels: an easier level 1,
   then a level 2 that's harder (less time, higher target) but leans more on
   the focusTile bonus to still be reachable. focusTile is the tile type
   that's this level's bonus focus — it spawns more often (focusWeight extra
   entries in the engine's weighted pool) and scores extra when matched
   (focusMultiplier, applied in resolveCascade in app.js). Farm/Fun are not
   designed out yet; Barnyard Bash is kept as an untouched placeholder. */
const LEVELS = [
  {
    id: 0,
    name: "Snack Shack",
    theme: "food",
    levelInTheme: 1,
    tileTypes: ["icecream", "cottoncandy", "hotdog", "pizza", "corn"],
    specialTile: "star",
    focusTile: "icecream",
    focusWeight: 1,
    focusMultiplier: 2,
    targetScore: 1400,
    moves: 22,
    timeSeconds: 90,
    bgClass: "bg-snack",
    comboText: ["SNACK-TACULAR!", "TASTY COMBO!", "YUM STREAK!", "DELICIOUS!", "FAIR FAVORITE!"],
    focusComboText: ["SCOOP BONUS!", "DOUBLE SCOOP!", "SWEET BONUS!"],
  },
  {
    id: 1,
    name: "Snack Rush",
    theme: "food",
    levelInTheme: 2,
    tileTypes: ["icecream", "cottoncandy", "hotdog", "pizza", "corn"],
    specialTile: "star",
    focusTile: "icecream",
    focusWeight: 2,
    focusMultiplier: 2,
    targetScore: 1800,
    moves: 22,
    timeSeconds: 60,
    bgClass: "bg-snack",
    comboText: ["SCOOP THERE IT IS!", "ICE ICE BABY!", "SWEET RUSH!", "DOUBLE DIP!", "CONE-TASTIC!"],
    focusComboText: ["TRIPLE SCOOP!", "MEGA BONUS!", "SO SWEET!"],
  },
  {
    id: 2,
    name: "Barnyard Bash",
    theme: "farm",
    levelInTheme: 1,
    tileTypes: ["cow", "pig", "chicken", "goat", "llama"],
    specialTile: "star",
    focusTile: "pig",
    focusWeight: 2,
    focusMultiplier: 2,
    targetScore: 650,
    moves: 22,
    timeSeconds: 90,
    bgClass: "bg-farm",
    comboText: ["FARM-TASTIC!", "MOO-VELOUS!", "BARNYARD BLAST!", "HAY-MAZING!", "RIBBON WINNER!"],
    focusComboText: ["OINK-STAR!", "HOG HEAVEN!", "PIG OUT!"],
  },
  {
    // Placeholder stats — Barnyard Bash was the only Farm level authored
    // so far. Every theme needs exactly 2 levels for the win -> next-level-
    // objectives flow to have anywhere to go, so this exists to complete
    // that pair; swap in real values whenever they're decided. Name is
    // just the theme name (no invented sub-title) until one is provided.
    id: 3,
    name: "Farm",
    theme: "farm",
    levelInTheme: 2,
    tileTypes: ["cow", "pig", "chicken", "goat", "llama"],
    specialTile: "star",
    focusTile: "llama",
    focusWeight: 2,
    focusMultiplier: 2,
    targetScore: 850,
    moves: 22,
    timeSeconds: 60,
    bgClass: "bg-farm",
    comboText: ["FARM-TASTIC!", "MOO-VELOUS!", "BARNYARD BLAST!", "HAY-MAZING!", "RIBBON WINNER!"],
    focusComboText: ["LLAMA-RAMA!", "DRAMA LLAMA!", "SO FLUFFY!"],
  },
  {
    // Placeholder stats — no canonical copy exists for this theme yet
    // (unlike Barnyard Bash, which already had these authored). Swap in
    // real values whenever they're decided. Name is just the theme name
    // (no invented sub-title) until one is provided.
    id: 4,
    name: "Fun",
    theme: "fun",
    levelInTheme: 1,
    // "coaster" has no real icon yet (its Figma export needs a manual
    // flattened PNG, same as llama did) — included anyway so it's ready
    // the moment that asset shows up; falls back to the star placeholder
    // art until then.
    tileTypes: ["bear", "fair", "balloons", "horse", "coaster"],
    specialTile: "star",
    focusTile: "horse",
    focusWeight: 2,
    focusMultiplier: 2,
    targetScore: 700,
    moves: 22,
    timeSeconds: 90,
    bgClass: "bg-fun",
    comboText: ["FUN-TASTIC!", "CARNIVAL COMBO!", "MIDWAY MAGIC!", "RIDE THE WIN!", "JACKPOT!"],
    focusComboText: ["CAROUSEL CRAZE!", "GALLOP ON!", "MERRY-GO-WIN!"],
  },
];
