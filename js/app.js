/* ==========================================================================
   APP — wires the DOM to the Match3Engine: level select, board rendering,
   input handling, cascade resolution/animation, HUD, timer, win/lose.
   ========================================================================== */

/* ---------------- RESPONSIVE FIT ----------------
   The design is authored at a fixed 1366x1024 canvas. Scaling that canvas
   with CSS transform alone doesn't change its layout size, so the browser
   (especially mobile) still thinks the page is 1366px wide and fights the
   viewport. Instead, resize each .screen-outer to the real scaled pixel
   size and transform the fixed-size .screen inside it to match. */
const DESIGN_W = 1366;
const DESIGN_H = 1024;
// Small top/bottom breathing room on regular screens so the frame isn't
// edge-to-edge. Only bites when height is the binding dimension and scale
// is still below 1 — on larger screens scale is already clamped to 1 (full
// native size) below, so this margin has no effect there.
const MARGIN_Y = 48;

function fitScreen() {
  // 1366x1024 is the max size — never scale past native resolution, only down.
  const scale = Math.min(window.innerWidth / DESIGN_W, (window.innerHeight - MARGIN_Y * 2) / DESIGN_H, 1);
  document.querySelectorAll(".screen-outer").forEach((outer) => {
    outer.style.width = `${DESIGN_W * scale}px`;
    outer.style.height = `${DESIGN_H * scale}px`;
  });
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.style.transform = `scale(${scale})`;
  });
}

// Belt and suspenders: window.resize and ResizeObserver both miss some
// viewport-size changes (mobile browser chrome transitions, some devtools/
// emulator viewport overrides don't dispatch either). A cheap poll against
// the last-known size guarantees this can never silently go stale.
window.addEventListener("resize", fitScreen);
new ResizeObserver(fitScreen).observe(document.documentElement);
let lastFitW = -1;
let lastFitH = -1;
setInterval(() => {
  if (window.innerWidth !== lastFitW || window.innerHeight !== lastFitH) {
    lastFitW = window.innerWidth;
    lastFitH = window.innerHeight;
    fitScreen();
  }
}, 250);
fitScreen();

const screenStart = document.getElementById("screen-start");
const screenObjectives = document.getElementById("screen-objectives");
const screenGame = document.getElementById("screen-game");
const overlayEnd = document.getElementById("overlay-end");
const boardEl = document.getElementById("board");
const comboPopupEl = document.getElementById("combo-popup");
const gameFrameEl = document.querySelector(".game-frame");

const objTitleImg = document.getElementById("objectives-title-img");
const objBlurb = document.getElementById("objectives-blurb");
const objTarget = document.getElementById("objectives-target");
const objBonusLabel = document.getElementById("objectives-bonus-label");
const objBonusPanel = document.getElementById("objectives-bonus-panel");
const objBonusBg = document.getElementById("objectives-bonus-bg");
const objBonusIcon = document.getElementById("objectives-bonus-icon");
const objBonusMultiplier = document.getElementById("objectives-bonus-multiplier");

// Each theme's "Theme Objectives" header component is a different exported
// asset (and a different native size — see .objectives-title-img.theme-*
// in styles.css). Add an entry here whenever a new theme's header art
// arrives; anything not listed falls back to the food art so a missing
// theme still renders instead of showing a broken image.
const THEME_TITLE_IMG = { food: "obj_food_title.svg", farm: "obj_farm_title.svg", fun: "obj_fun_title.svg" };

// Stylized rewards-messaging graphic shown in the combo popup, one per theme.
const THEME_COMBO_IMG = { food: "combo_snack_tacular.png", farm: "combo_udderly_great.png", fun: "combo_roller_coastin.png" };

const uiScore = document.getElementById("ui-score");
const uiMoves = document.getElementById("ui-moves");
const uiMovesIcon = document.getElementById("ui-moves-icon");
const uiMovesBg = document.getElementById("ui-moves-bg");
const uiTimer = document.getElementById("ui-timer");
const uiTargetIcon = document.getElementById("ui-target-icon");
const uiTargetFill = document.getElementById("ui-target-fill");
const uiTargetCount = document.getElementById("ui-target-count");

const endTitle = document.getElementById("end-title");
const endSub = document.getElementById("end-sub");
const endScore = document.getElementById("end-score");

// The Match Indicator's icon is a flat Figma "Matches Icon" export with no
// background container, unlike REAL_IMG board-tile art (which bakes in the
// colored rounded-square badge). One flat export exists per theme so far:
// Matches=Food (ice cream), Matches=Farm (pig), Matches=Fun (horse). Any
// focusTile without a flat export here falls back to its REAL_IMG board
// art (badge and all).
const FOCUS_ICON_OVERRIDES = { icecream: "moves_icon.svg", pig: "moves_icon_farm.svg", horse: "moves_icon_fun.svg" };
function focusIconSrc(focusTile) {
  const file = FOCUS_ICON_OVERRIDES[focusTile] || REAL_IMG[focusTile];
  return file ? `${ASSET_BASE}${file}` : `${ASSET_BASE}moves_icon.svg`;
}

// The Match Indicator's pill art bakes in a colored highlight behind the
// icon (green, #20B163, in the default export). Themes with a flat icon
// override above get a recolored copy of that highlight instead — Farm's
// is #7C36CC (match_indicator_farm.svg), Fun's is #F3372A
// (match_indicator_fun.svg) — so the highlight reads as that theme's color
// rather than always green.
const FOCUS_INDICATOR_BG = { pig: "match_indicator_farm.svg", horse: "match_indicator_fun.svg" };
function focusIndicatorBg(focusTile) {
  return `${ASSET_BASE}${FOCUS_INDICATOR_BG[focusTile] || "match_indicator.svg"}`;
}

const state = {
  levelIndex: 0,
  engine: null,
  score: 0,
  movesLeft: 0,
  timeLeft: 0,
  selected: null,
  busy: false,
  timerHandle: null,
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function currentLevel() {
  return LEVELS[state.levelIndex];
}

function firstLevelOfTheme(theme) {
  return LEVELS.findIndex((l) => l.theme === theme && l.levelInTheme === 1);
}

// What "Continue" should do after a win: the Theme Objectives screen
// explains a THEME, shown once when you're entering it — either by
// picking it on the Selection Screen, or by finishing the previous
// theme's last level and rolling into this one. It never appears
// between two levels of the SAME theme; those just chain straight into
// gameplay. So: next level, same theme -> start it directly; next level,
// different theme (i.e. this was the theme's last level) -> show ITS
// objectives; no next level at all -> back to the Selection Screen.
function nextLevelAfter(level) {
  const sameTheme = LEVELS.findIndex((l) => l.theme === level.theme && l.levelInTheme === level.levelInTheme + 1);
  if (sameTheme !== -1) return { index: sameTheme, newTheme: false };
  const here = LEVELS.indexOf(level);
  const next = LEVELS[here + 1];
  if (next && next.theme !== level.theme && next.levelInTheme === 1) {
    return { index: here + 1, newTheme: true };
  }
  return { index: -1, newTheme: false };
}

/* ---------------- LEVEL LIFECYCLE ---------------- */

// Shows the pre-level objectives screen for `index` without starting it —
// "START PLAYING" there calls startLevel(state.pendingLevelIndex). Kept
// separate from startLevel() because the objectives screen is just a
// themed preview; nothing about the engine/board/timer should exist yet.
function showObjectives(index) {
  state.pendingLevelIndex = index;
  const level = LEVELS[index];

  objTitleImg.className = `objectives-title-img theme-${level.theme}`;
  objTitleImg.src = `assets/img/${THEME_TITLE_IMG[level.theme] || THEME_TITLE_IMG.food}`;
  objTitleImg.alt = level.theme.toUpperCase();

  objTarget.textContent = level.targetScore.toLocaleString();
  objBlurb.textContent = `Score ${level.targetScore.toLocaleString()} points before the timer runs out! Match 3 or more in a row — the bigger the combo, the bigger the bonus. You've got ${level.moves} moves and ${level.timeSeconds} seconds to hit the goal.`;

  const hasFocus = !!level.focusTile;
  objBonusLabel.classList.toggle("hidden", !hasFocus);
  objBonusPanel.classList.toggle("hidden", !hasFocus);
  if (hasFocus) {
    objBonusIcon.src = focusIconSrc(level.focusTile);
    objBonusBg.style.backgroundImage = `url(${focusIndicatorBg(level.focusTile)})`;
    objBonusMultiplier.textContent = `${level.focusMultiplier}X`;
  }

  screenStart.classList.add("hidden");
  screenGame.classList.add("hidden");
  screenObjectives.classList.remove("hidden");
}

function startLevel(index) {
  state.levelIndex = index;
  const level = currentLevel();

  state.engine = new Match3Engine(
    BOARD_MASK,
    level.tileTypes,
    level.specialTile,
    level.focusTile,
    level.focusWeight
  );
  state.score = 0;
  state.movesLeft = level.moves;
  state.timeLeft = level.timeSeconds;
  state.selected = null;
  state.busy = false;

  document.title = `NYS Fair Match — ${level.name}`;
  uiTargetIcon.innerHTML = tileMarkup(level.specialTile);
  uiMovesIcon.src = focusIconSrc(level.focusTile);
  uiMovesBg.style.backgroundImage = `url(${focusIndicatorBg(level.focusTile)})`;
  comboPopupEl.querySelector("img").src = `${ASSET_BASE}${THEME_COMBO_IMG[level.theme] || THEME_COMBO_IMG.food}`;
  gameFrameEl.classList.remove("theme-farm", "theme-fun");
  if (level.theme !== "food") gameFrameEl.classList.add(`theme-${level.theme}`);

  screenStart.classList.add("hidden");
  screenObjectives.classList.add("hidden");
  screenGame.classList.remove("hidden");
  overlayEnd.classList.add("hidden");

  renderBoard();
  updateHUD();
  startTimer();
}

function startTimer() {
  stopTimer();
  state.timerHandle = setInterval(() => {
    state.timeLeft--;
    updateHUD();
    if (state.timeLeft <= 0) {
      stopTimer();
      endGame(false, "time");
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerHandle) {
    clearInterval(state.timerHandle);
    state.timerHandle = null;
  }
}

function goToMenu() {
  stopTimer();
  overlayEnd.classList.add("hidden");
  screenGame.classList.add("hidden");
  screenStart.classList.remove("hidden");
}

function endGame(win, reason) {
  stopTimer();
  const level = currentLevel();
  if (win) {
    endTitle.textContent = "LEVEL COMPLETE!";
    endSub.textContent = "Great job at the fair!";
  } else if (reason === "time") {
    endTitle.textContent = "TIME'S UP!";
    endSub.textContent = "The fair is closing early — try again?";
  } else {
    endTitle.textContent = "OUT OF MOVES";
    endSub.textContent = "So close! Give it another shot?";
  }
  endScore.textContent = state.score;

  const next = win ? nextLevelAfter(level) : { index: -1, newTheme: false };
  const hasNext = next.index !== -1;
  btnContinue.querySelector("span").textContent = win ? (hasNext ? "Continue" : "Back to Menu") : "Back to Menu";
  btnContinue.onclick = () => {
    if (!hasNext) return goToMenu();
    // Same theme's next level chains straight into gameplay; a new theme
    // shows its objectives first, same as picking it from Selection would.
    if (next.newTheme) showObjectives(next.index);
    else startLevel(next.index);
  };

  overlayEnd.classList.remove("hidden");
}

/* ---------------- HUD ---------------- */

function formatTime(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function updateHUD() {
  const level = currentLevel();
  uiScore.textContent = state.score.toLocaleString();
  uiMoves.textContent = state.movesLeft;
  uiTimer.textContent = formatTime(state.timeLeft);
  const pct = Math.min(100, (state.score / level.targetScore) * 100);
  uiTargetFill.style.width = `${pct}%`;
  uiTargetCount.textContent = `${state.score.toLocaleString()} / ${level.targetScore.toLocaleString()}`;
}

// Rewards messaging is currently one stylized graphic per theme (set in
// startLevel), shown for every reward regardless of the `text` picked by the
// caller. Per-reward graphics will replace this when they're supplied.
function showCombo(text) {
  comboPopupEl.querySelector("img").alt = text;
  comboPopupEl.classList.remove("show");
  void comboPopupEl.offsetWidth;
  comboPopupEl.classList.add("show");
}

/* ---------------- BOARD RENDERING ---------------- */

function renderBoard(opts) {
  const { matched, falling, invalid } = opts || {};
  const engine = state.engine;
  boardEl.innerHTML = "";
  for (let r = 0; r < engine.rows; r++) {
    for (let c = 0; c < engine.cols; c++) {
      const cell = document.createElement("div");
      const active = engine.isActive(r, c);
      cell.className = "cell " + (active ? "active" : "inactive");
      if (active) {
        const key = `${r},${c}`;
        const type = engine.grid[r][c];
        const tile = document.createElement("div");
        let cls = "tile";
        if (matched && matched.has(key)) cls += " matched";
        if (falling && falling.has(key)) cls += " falling-in";
        if (invalid && invalid.has(key)) cls += " invalid-shake";
        tile.className = cls;
        tile.dataset.r = r;
        tile.dataset.c = c;
        if (type) tile.innerHTML = tileMarkup(type);
        tile.addEventListener("pointerdown", onTilePointerDown);
        tile.addEventListener("pointermove", onTilePointerMove);
        tile.addEventListener("pointerup", onTilePointerUp);
        tile.addEventListener("pointercancel", onTilePointerCancel);
        tile.addEventListener("pointerenter", onTilePointerEnter);
        cell.appendChild(tile);
      }
      boardEl.appendChild(cell);
    }
  }
}

/* ---------------- INPUT: drag-to-swap (falls back to tap-to-select) ---------------- */

const DRAG_THRESHOLD = 18; // px, in screen space — works regardless of canvas scale
let dragState = null;

function onTilePointerEnter(e) {
  if (e.pointerType !== "mouse" || state.busy) return;
  Sound.playHover();
}

function onTilePointerDown(e) {
  if (state.busy) return;
  const r = Number(e.currentTarget.dataset.r);
  const c = Number(e.currentTarget.dataset.c);
  dragState = { r, c, startX: e.clientX, startY: e.clientY, moved: false };
  e.currentTarget.classList.add("pressed");
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    // Some browsers reject capture for synthetic/edge-case pointers; the
    // swap logic below only depends on the move delta, not capture.
  }
}

function onTilePointerMove(e) {
  if (!dragState || dragState.moved || state.busy) return;
  const dx = e.clientX - dragState.startX;
  const dy = e.clientY - dragState.startY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < DRAG_THRESHOLD) return;

  dragState.moved = true;
  e.currentTarget.classList.remove("pressed");
  const { r, c } = dragState;
  dragState = null;

  let r2 = r;
  let c2 = c;
  if (Math.abs(dx) > Math.abs(dy)) {
    c2 = c + (dx > 0 ? 1 : -1);
  } else {
    r2 = r + (dy > 0 ? 1 : -1);
  }

  if (state.engine.isActive(r2, c2)) {
    state.selected = null;
    attemptSwap(r, c, r2, c2);
  }
}

function onTilePointerUp(e) {
  e.currentTarget.classList.remove("pressed");
  if (!dragState) return;
  const wasTap = !dragState.moved;
  const { r, c } = dragState;
  dragState = null;
  if (wasTap) handleTap(r, c);
}

function onTilePointerCancel(e) {
  e.currentTarget.classList.remove("pressed");
  dragState = null;
}

function handleTap(r, c) {
  if (state.busy) return;

  if (!state.selected) {
    state.selected = { r, c };
    renderBoard();
    return;
  }

  const sel = state.selected;
  if (sel.r === r && sel.c === c) {
    state.selected = null;
    renderBoard();
    return;
  }

  if (state.engine.areAdjacent(sel.r, sel.c, r, c)) {
    state.selected = null;
    attemptSwap(sel.r, sel.c, r, c);
  } else {
    state.selected = { r, c };
    renderBoard();
  }
}

/* ---------------- SWAP + CASCADE RESOLUTION ---------------- */

async function attemptSwap(r1, c1, r2, c2) {
  state.busy = true;
  const engine = state.engine;
  engine.swap(r1, c1, r2, c2);
  const groups = engine.findMatches();

  if (groups.length === 0) {
    engine.swap(r1, c1, r2, c2);
    Sound.playFail();
    renderBoard({ invalid: new Set([`${r1},${c1}`, `${r2},${c2}`]) });
    await wait(320);
    renderBoard();
    state.busy = false;
    return;
  }

  Sound.playSuccess();
  state.movesLeft--;
  renderBoard();
  await wait(120);
  await resolveCascade();
  updateHUD();

  if (state.score >= currentLevel().targetScore) {
    endGame(true);
  } else if (state.movesLeft <= 0) {
    endGame(false, "moves");
  }

  state.busy = false;
}

async function resolveCascade() {
  const engine = state.engine;
  let cascade = 0;
  let groups = engine.findMatches();

  const level = currentLevel();

  while (groups.length > 0) {
    cascade++;

    const clearedKeys = new Set();
    let biggestGroup = 0;
    let matchScore = 0;
    let hasFocusMatch = false;
    for (const g of groups) {
      biggestGroup = Math.max(biggestGroup, g.cells.length);
      for (const cell of g.cells) clearedKeys.add(`${cell.r},${cell.c}`);

      const base = g.cells.length * 10 * cascade;
      const isFocus = level.focusTile && g.type === level.focusTile;
      if (isFocus) hasFocusMatch = true;
      matchScore += isFocus ? base * level.focusMultiplier : base;
    }
    renderBoard({ matched: clearedKeys });
    await wait(280);

    engine.clearMatches(groups);
    state.score += matchScore;
    updateHUD();

    if (hasFocusMatch) {
      const texts = level.focusComboText || level.comboText;
      showCombo(texts[Math.floor(Math.random() * texts.length)]);
    } else if (cascade >= 2 || biggestGroup >= 4) {
      const texts = level.comboText;
      showCombo(texts[Math.floor(Math.random() * texts.length)]);
    }

    const moves = engine.applyGravity();
    const filled = engine.refill();
    const fallingKeys = new Set();
    for (const m of moves) fallingKeys.add(`${m.to.r},${m.to.c}`);
    for (const f of filled) fallingKeys.add(`${f.r},${f.c}`);

    renderBoard({ falling: fallingKeys });
    await wait(320);

    groups = engine.findMatches();
  }

  if (!engine.hasAnyMoves()) {
    engine.reshuffle();
    renderBoard();
  }
}

/* ---------------- WIRING ---------------- */

const btnContinue = document.getElementById("btn-continue");
const btnRetry = document.getElementById("btn-retry");

// Sound test: each theme card plays a sourced clip on click, and it's meant
// to keep playing into the Objectives screen rather than cut off, so
// nothing in the click handler below stops it on the showObjectives() call.
const THEME_SELECT_SOUND = {
  food: "assets/audio/food_select_test.wav",
  farm: "assets/audio/farm_select_test.wav",
  fun: "assets/audio/fun_select_test.wav",
};

document.querySelectorAll(".theme-card").forEach((card) => {
  card.addEventListener("click", () => {
    const clip = THEME_SELECT_SOUND[card.dataset.theme];
    if (clip) Sound.playClip(clip);
    const index = firstLevelOfTheme(card.dataset.theme);
    if (index !== -1) showObjectives(index);
  });
});
btnRetry.addEventListener("click", () => startLevel(state.levelIndex));

const btnStartPlaying = document.getElementById("btn-start-playing");
btnStartPlaying.addEventListener("click", () => startLevel(state.pendingLevelIndex ?? 0));
