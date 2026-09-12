/* ==========================================================================
   MATCH-3 ENGINE
   Pure game-state logic, no DOM. Operates on a grid shaped by BOARD_MASK,
   where inactive cells are permanently `null` and never take part in
   matching, swapping, gravity, or refill.
   ========================================================================== */

class Match3Engine {
  // focusTile/focusWeight bias tile spawning toward a level's bonus-focus
  // item (see LEVELS in assets.js) by giving it extra entries in the
  // weighted pool randomTile() draws from — a higher weight means it shows
  // up on the board more often, not just scores more when matched.
  constructor(mask, tileTypes, specialTile, focusTile = null, focusWeight = 0) {
    this.mask = mask;
    this.rows = mask.length;
    this.cols = mask[0].length;
    this.tileTypes = tileTypes;
    this.specialTile = specialTile;
    this.focusTile = focusTile;
    this.weightedPool = tileTypes.slice();
    if (focusTile && focusWeight > 0) {
      for (let i = 0; i < focusWeight; i++) this.weightedPool.push(focusTile);
    }
    this.grid = [];
    this._buildInitialGrid();
  }

  isActive(r, c) {
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.mask[r][c] === 1;
  }

  randomTile() {
    return this.weightedPool[Math.floor(Math.random() * this.weightedPool.length)];
  }

  _buildInitialGrid() {
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        if (!this.isActive(r, c)) {
          row.push(null);
          continue;
        }
        let t;
        let tries = 0;
        do {
          t = this.randomTile();
          tries++;
        } while (tries < 20 && this._wouldMatchAt(r, c, t, row));
        row.push(t);
      }
      this.grid.push(row);
    }
  }

  // check horizontal/vertical run while building row-by-row (row not fully in this.grid yet for current row)
  _wouldMatchAt(r, c, t, currentRowInProgress) {
    // horizontal: look left within currentRowInProgress
    if (c >= 2 && currentRowInProgress[c - 1] === t && currentRowInProgress[c - 2] === t) return true;
    // vertical: look up within this.grid
    if (r >= 2 && this.grid[r - 1][c] === t && this.grid[r - 2][c] === t) return true;
    return false;
  }

  swap(r1, c1, r2, c2) {
    const tmp = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = tmp;
  }

  areAdjacent(r1, c1, r2, c2) {
    const d = Math.abs(r1 - r2) + Math.abs(c1 - c2);
    return d === 1;
  }

  // Returns array of match groups; each group: {cells:[{r,c}], type, dir:'h'|'v'}
  findMatches() {
    const groups = [];
    // horizontal
    for (let r = 0; r < this.rows; r++) {
      let runStart = 0;
      for (let c = 1; c <= this.cols; c++) {
        const prevType = this.grid[r][c - 1];
        const curType = c < this.cols ? this.grid[r][c] : null;
        const breakRun = c === this.cols || curType !== prevType || prevType === null;
        if (breakRun) {
          const runLen = c - runStart;
          if (runLen >= 3 && prevType !== null) {
            const cells = [];
            for (let k = runStart; k < c; k++) cells.push({ r, c: k });
            groups.push({ cells, type: prevType, dir: "h" });
          }
          runStart = c;
        }
      }
    }
    // vertical
    for (let c = 0; c < this.cols; c++) {
      let runStart = 0;
      for (let r = 1; r <= this.rows; r++) {
        const prevType = this.grid[r - 1][c];
        const curType = r < this.rows ? this.grid[r][c] : null;
        const breakRun = r === this.rows || curType !== prevType || prevType === null;
        if (breakRun) {
          const runLen = r - runStart;
          if (runLen >= 3 && prevType !== null) {
            const cells = [];
            for (let k = runStart; k < r; k++) cells.push({ r: k, c });
            groups.push({ cells, type: prevType, dir: "v" });
          }
          runStart = r;
        }
      }
    }
    return groups;
  }

  // Clears matched groups, returns { clearedCells:[{r,c,type}], bonusSpawns:[{r,c}] }
  clearMatches(groups) {
    const clearedSet = new Map(); // key "r,c" -> type
    const bonusSpawns = [];
    for (const g of groups) {
      for (const cell of g.cells) {
        clearedSet.set(`${cell.r},${cell.c}`, g.type);
      }
      if (g.cells.length >= 4) {
        // spawn a special star tile at the middle cell of the match
        const mid = g.cells[Math.floor(g.cells.length / 2)];
        bonusSpawns.push({ r: mid.r, c: mid.c });
      }
    }
    const clearedCells = [];
    for (const [key, type] of clearedSet.entries()) {
      const [r, c] = key.split(",").map(Number);
      clearedCells.push({ r, c, type });
      this.grid[r][c] = null;
    }
    for (const spawn of bonusSpawns) {
      this.grid[spawn.r][spawn.c] = this.specialTile;
    }
    return { clearedCells, bonusSpawns };
  }

  // Applies gravity within each column's active-cell run, returns list of moves {from:{r,c}, to:{r,c}, type}
  applyGravity() {
    const moves = [];
    for (let c = 0; c < this.cols; c++) {
      const activeRows = [];
      for (let r = 0; r < this.rows; r++) {
        if (this.isActive(r, c)) activeRows.push(r);
      }
      // compact non-null values to the bottom of activeRows
      const values = activeRows.map((r) => this.grid[r][c]);
      const nonNull = values.filter((v) => v !== null);
      const nullCount = values.length - nonNull.length;
      const newValues = new Array(nullCount).fill(null).concat(nonNull);
      for (let i = 0; i < activeRows.length; i++) {
        const r = activeRows[i];
        const oldVal = this.grid[r][c];
        const newVal = newValues[i];
        if (oldVal !== newVal) {
          this.grid[r][c] = newVal;
        }
      }
      // record moves for animation purposes: find where each non-null landed
      let srcPointer = 0;
      const nonNullOriginalRows = [];
      for (let i = 0; i < activeRows.length; i++) {
        if (values[i] !== null) nonNullOriginalRows.push(activeRows[i]);
      }
      for (let i = 0; i < nonNull.length; i++) {
        const destRow = activeRows[nullCount + i];
        const srcRow = nonNullOriginalRows[i];
        if (destRow !== srcRow) {
          moves.push({ from: { r: srcRow, c }, to: { r: destRow, c }, type: nonNull[i] });
        }
      }
    }
    return moves;
  }

  // Fills nulls with new random tiles, returns list of {r,c,type} newly filled
  refill() {
    const filled = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.isActive(r, c) && this.grid[r][c] === null) {
          const t = this.randomTile();
          this.grid[r][c] = t;
          filled.push({ r, c, type: t });
        }
      }
    }
    return filled;
  }

  hasAnyMoves() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.isActive(r, c)) continue;
        const neighbors = [[r, c + 1], [r + 1, c]];
        for (const [nr, nc] of neighbors) {
          if (!this.isActive(nr, nc)) continue;
          this.swap(r, c, nr, nc);
          const found = this.findMatches().length > 0;
          this.swap(r, c, nr, nc);
          if (found) return true;
        }
      }
    }
    return false;
  }

  reshuffle() {
    const types = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.isActive(r, c)) types.push(this.grid[r][c]);
      }
    }
    // Fisher-Yates
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    let idx = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.isActive(r, c)) this.grid[r][c] = types[idx++];
      }
    }
  }
}
