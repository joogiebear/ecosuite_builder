# EcoMenu Compact Grid + Fill Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the EcoMenu grid's visual density and add a non-destructive fill tool that paints empty cells in bulk patterns (border, row, column, page).

**Architecture:** Two isolated changes. Task 1 is pure CSS. Task 2 adds pure utility functions to `menuSlots.js`. Task 3 wires the fill UI into `EcoMenusDesigner.jsx` and adds CSS for the new strip. No new files needed — all changes go into three existing files.

**Tech Stack:** React, CSS custom properties, existing `menuSlots.js` utility pattern.

---

## Files Modified

| File | What changes |
|------|-------------|
| `src/styles.css` | Compact grid cell sizing; add fill-strip CSS |
| `src/lib/menuSlots.js` | Add four cell-set helpers + `applyFill` |
| `src/components/EcoMenusDesigner.jsx` | Add `fillItem` state, fill handlers, fill-strip JSX |

---

## Task 1: Compact the grid CSS

**Files:**
- Modify: `src/styles.css` (lines 703–805)

**Context:** The menu grid cells are currently roomy. We're tightening gap, padding, and font sizes by ~15–20% so the overall grid feels denser without losing readability. No JS changes needed.

- [ ] **Step 1: Update `.menu-studio`, `.menu-grid`, and `.menu-cell` sizing**

In `src/styles.css`, apply these changes:

`.menu-studio` — reduce gap:
```css
/* was: gap: 18px; */
gap: 14px;
```

`.menu-grid` — tighter gap and padding:
```css
/* was: gap: 4px; padding: 8px; */
gap: 3px;
padding: 6px;
```

`.menu-cell` — tighter inner padding:
```css
/* was: padding: 5px; */
padding: 3px;
```

`.menu-cell-coord` — slightly smaller:
```css
/* was: font-size: 9px; */
font-size: 8px;
```

`.menu-cell-label` — slightly smaller:
```css
/* was: font-size: 10.5px; */
font-size: 9.5px;
```

`.menu-cell-meta` — slightly smaller:
```css
/* was: font-size: 8.5px; */
font-size: 7.5px;
```

- [ ] **Step 2: Verify visually**

Run `npm run dev` and open the EcoMenus plugin. The 9-column grid should look noticeably more compact. Cells should still show coord, label, and meta text without clipping on a standard screen width.

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "style: compact EcoMenu grid cell sizing"
```

---

## Task 2: Add fill utility functions to menuSlots.js

**Files:**
- Modify: `src/lib/menuSlots.js`

**Context:** Four pure functions return arrays of `{row, column}` coordinates for each pattern. `applyFill` takes those coordinates plus the existing slots and item ID, and inserts a slot only at cells that are currently empty. It reuses the existing `buildSlotMap`, `getMenuSlotFromMap`, `upsertMenuSlot`, and `sanitizeMenuSlots` functions that are already in the file.

- [ ] **Step 1: Add cell-set helpers**

Append the following exports to the bottom of `src/lib/menuSlots.js`:

```js
export function getBorderCells(rowCount) {
  const cells = [];
  for (let col = 1; col <= 9; col++) {
    cells.push({ row: 1, column: col });
    if (rowCount > 1) cells.push({ row: rowCount, column: col });
  }
  for (let row = 2; row < rowCount; row++) {
    cells.push({ row, column: 1 });
    cells.push({ row, column: 9 });
  }
  return cells;
}

export function getRowCells(row) {
  return Array.from({ length: 9 }, (_, i) => ({ row, column: i + 1 }));
}

export function getColumnCells(column, rowCount) {
  return Array.from({ length: rowCount }, (_, i) => ({ row: i + 1, column }));
}

export function getPageCells(rowCount) {
  const cells = [];
  for (let row = 1; row <= rowCount; row++) {
    for (let col = 1; col <= 9; col++) {
      cells.push({ row, column: col });
    }
  }
  return cells;
}

export function applyFill(slots, cells, page, itemId, rowCount, pageCount) {
  const map = buildSlotMap(slots);
  let result = slots;
  for (const { row, column } of cells) {
    if (!getMenuSlotFromMap(map, row, column, page)) {
      result = upsertMenuSlot(
        result,
        { item: itemId, name: '', lore: '', row, column, page, clickActionType: 'none', clickActionValue: '' },
        rowCount,
        pageCount,
      );
    }
  }
  return result;
}
```

- [ ] **Step 2: Sanity-check getBorderCells edge cases mentally**

- `rowCount = 1`: loop adds row 1 all 9 cols, inner loop never runs → 9 cells, no duplicates. ✓
- `rowCount = 2`: top row (9) + bottom row (9), inner loop never runs → 18 cells. ✓
- `rowCount = 6`: top (9) + bottom (9) + rows 2–5 left+right (8) = 26 cells. ✓

- [ ] **Step 3: Commit**

```bash
git add src/lib/menuSlots.js
git commit -m "feat: add fill utility functions to menuSlots"
```

---

## Task 3: Wire fill UI into EcoMenusDesigner + CSS

**Files:**
- Modify: `src/components/EcoMenusDesigner.jsx`
- Modify: `src/styles.css`

**Context:** Add a `fillItem` state string. Add four handler functions that call `applyFill` with the appropriate cell set. Render a fill strip inside `.menu-canvas` between the toolbar and the grid. Buttons are disabled when `fillItem` is empty. Add CSS for `.fill-strip`, `.fill-item-input`, `.fill-buttons`, and `.fill-button`.

- [ ] **Step 1: Import the new fill functions in EcoMenusDesigner.jsx**

In the existing import from `'../lib/menuSlots.js'`, add the five new exports:

```js
import {
  MENU_PRESETS,
  applyFill,
  buildSlotMap,
  createMenuPresetSlot,
  getBorderCells,
  getColumnCells,
  getMenuSlotFromMap,
  getPageCells,
  getRowCells,
  removeMenuSlot,
  sanitizeMenuSlots,
  stripMinecraftFormatting,
  upsertMenuSlot,
} from '../lib/menuSlots.js';
```

- [ ] **Step 2: Add fillItem state**

Inside the `EcoMenusDesigner` component, after the existing `[selectedCell, setSelectedCell]` state declaration, add:

```js
const [fillItem, setFillItem] = useState('');
```

- [ ] **Step 3: Add fill handler**

After the `deleteSelectedSlot` function definition, add:

```js
function handleFill(cells) {
  const trimmed = fillItem.trim();
  if (!trimmed) return;
  commitSlots(applyFill(slots, cells, selectedPage, trimmed, rowCount, pageCount));
}
```

- [ ] **Step 4: Add fill strip JSX**

Inside the `.menu-canvas` div, between the `.menu-toolbar` div and the `.menu-grid` div, insert:

```jsx
<div className="fill-strip">
  <input
    className="fill-item-input"
    placeholder="Fill item (e.g. gray_stained_glass_pane)"
    value={fillItem}
    onChange={(event) => setFillItem(event.target.value)}
  />
  <div className="fill-buttons">
    <button
      type="button"
      className="fill-button"
      disabled={!fillItem.trim()}
      onClick={() => handleFill(getBorderCells(rowCount))}
    >
      Border
    </button>
    <button
      type="button"
      className="fill-button"
      disabled={!fillItem.trim()}
      onClick={() => handleFill(getRowCells(selectedCell.row))}
    >
      Row {selectedCell.row}
    </button>
    <button
      type="button"
      className="fill-button"
      disabled={!fillItem.trim()}
      onClick={() => handleFill(getColumnCells(selectedCell.column, rowCount))}
    >
      Col {selectedCell.column}
    </button>
    <button
      type="button"
      className="fill-button"
      disabled={!fillItem.trim()}
      onClick={() => handleFill(getPageCells(rowCount))}
    >
      Page
    </button>
  </div>
</div>
```

- [ ] **Step 5: Add CSS for fill strip**

In `src/styles.css`, after the `.menu-toolbar-note` block (around line 742), add:

```css
.fill-strip {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.fill-item-input {
  flex: 1;
  min-width: 160px;
  height: 28px;
  padding: 0 8px;
  font-size: 11px;
  background: var(--bg);
  border: 1px solid var(--hair);
  border-radius: var(--radius-sm);
  color: var(--ink);
  font-family: var(--font-mono);
}
.fill-item-input::placeholder { color: var(--muted); }
.fill-item-input:focus { outline: none; border-color: var(--accent); }
.fill-buttons {
  display: flex;
  gap: 4px;
}
.fill-button {
  all: unset;
  cursor: pointer;
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 500;
  color: var(--muted-strong);
  background: var(--surface-2);
  border: 1px solid var(--hair);
  border-radius: var(--radius-sm);
  transition: all 130ms ease;
  white-space: nowrap;
}
.fill-button:hover:not(:disabled) {
  color: var(--ink);
  border-color: var(--accent);
  background: var(--accent-soft);
}
.fill-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
```

- [ ] **Step 6: Verify fill behavior**

Run `npm run dev`. In the EcoMenus plugin:

1. Type `gray_stained_glass_pane` in the fill input.
2. Click **Border** — outer ring of cells should fill with glass pane slots. Inner cells untouched.
3. Click on a border cell, change its item to `barrier` name to `&cClose` — that cell updates, rest of border stays as glass.
4. Click **Border** again — the close button cell should NOT be overwritten. Only the still-empty border cells (if any) would be painted.
5. Click **Row 3** — all empty cells in row 3 fill. Filled cells in row 3 stay.
6. Clear the fill input — all four buttons should go grey/disabled.
7. Check YAML preview — glass pane slots should appear with `item: gray_stained_glass_pane` and no name/lore/action.

- [ ] **Step 7: Commit**

```bash
git add src/components/EcoMenusDesigner.jsx src/styles.css
git commit -m "feat: add non-destructive fill tool to EcoMenu designer"
```

---

## GSTACK REVIEW REPORT

> Auto-generated by `/autoplan` on 2026-04-20. Plan was reviewed post-implementation (all tasks already shipped at v1.1.0).

### Phase 1 — CEO Review

Both review voices flagged the **complete absence of automated tests** as the top structural gap. The plan relies entirely on manual verification steps (Step 6). At the current scale this is survivable, but every future feature ships blind.

No blockers to the shipped work. Plan goals are coherent and scope is appropriate.

---

### Phase 2 — Design Review

Both voices confirmed the fill strip UX is sound. The non-destructive-first default (fill only empty cells) is the right call for a config tool where accidental overwrites are hard to recover from.

Deferred UX items (no consensus blockers):
- Undo/history for bulk fill operations
- Multi-select + bulk apply from cell selection
- Saved fill templates / border presets
- Checkerboard and Corners fill patterns
- Right-click context menu on cells
- "Background layer" concept (intent-preserving fill that tracks paint separately from overrides)

---

### Phase 3 — Engineering Review

#### Eng Consensus Table

| Finding | Claude Eng | Codex Eng | Consensus |
|---------|-----------|-----------|-----------|
| Out-of-bounds cells silently clamped in `applyFill` | MEDIUM | MEDIUM | **MEDIUM — fix before production** |
| No automated tests for utility boundary | MEDIUM | MEDIUM | **MEDIUM — address soon** |
| Stale closure / lost-update risk in `handleFill` | LOW | LOW | LOW — defer |
| `page`/`row` briefly stale after bounds shrink | LOW | LOW | LOW — defer |
| O(n²) rebuild + double sanitization in `applyFill` | LOW | LOW | LOW — defer |
| Item ID validation only "non-empty after trim" | LOW | LOW | LOW — defer |
| No `maxLength` on fill input | LOW | — | LOW — defer |
| "No empty cells" feedback message ambiguous | UX | — | UX — defer |

#### MEDIUM findings detail

**M1 — Out-of-bounds cells silently clamped** (`menuSlots.js:207-222`)

`applyFill` passes `cells` coordinates directly into `upsertMenuSlot`, which calls `sanitizeMenuSlots`. That sanitize clamps `row`, `column`, and `page` to valid bounds (lines 46-48) rather than dropping out-of-range entries. Result: a cell at `{ row: 0, column: 10 }` becomes `row: 1, column: 9` — a valid slot was written to an unintended coordinate. All four helper functions (`getBorderCells`, `getRowCells`, `getColumnCells`, `getPageCells`) generate valid coordinates, so this bug is only reachable if a caller passes custom cells — but the function signature accepts arbitrary input and makes no promise about rejecting it.

Fix: add bounds guard at the top of the loop in `applyFill`:
```js
if (row < 1 || row > rowCount || column < 1 || column > 9 || page < 1 || page > pageCount) continue;
```

**M2 — No automated tests**

`package.json` has `build`, `verify`, and `dist` scripts but no `test` script. The plan relies on manual Steps 5–6. Twelve must-have scenarios identified by the eng review:

*`applyFill` (7 scenarios):*
1. Empty slots → fills all cells in `cells` list
2. All occupied → returns original array unchanged (referential equality)
3. Mixed → fills only empty cells, leaves occupied untouched
4. Out-of-bounds cell in `cells` (e.g. `row: 0`) → skipped, not clamped to adjacent slot
5. Duplicate cell coordinates in `cells` → written once, not twice
6. `cells` is empty array → returns original array unchanged
7. `itemId` written correctly to each new slot

*`sanitizeMenuSlots` (2 scenarios):*
8. Slot with `row` beyond `rowCount` is dropped, not clamped
9. Sort order is stable across page/row/column

*`handleFill` integration (3 scenarios):*
10. Fill strip disabled when `fillItem` is empty
11. Feedback message shows correct count after partial fill
12. "No empty cells to fill" fires when all cells are occupied

---

### Deferred Items (TODOS)

These items were surfaced across all three review phases and deferred — no action needed to close this plan, but worth tracking:

- [ ] **Add bounds guard to `applyFill`** — `menuSlots.js` loop: skip cells where `row < 1 || row > rowCount || column < 1 || column > 9` (M1 above)
- [ ] **Add test suite** — wire Vitest or equivalent; implement the 12 scenarios from M2 above
- [ ] **Add `maxLength={128}` to fill input** — `EcoMenusDesigner.jsx` fill input field
- [ ] **Item ID validation** — share validation logic between fill input and single-slot Item field (`EcoMenusDesigner.jsx:305`)
- [ ] **Undo/history for bulk fill** — bulk fills are hard to reverse manually
- [ ] **Saved fill templates** — border presets (glass pane, barrier, etc.)
- [ ] **Multi-select + bulk apply** — select cells first, then fill only selection
- [ ] **Checkerboard and Corners fill patterns** — additional `getCells` variants in `menuSlots.js`
- [ ] **`applyFill` O(n+k) refactor** — build key set once, append, sanitize once (low priority at current scale)
- [ ] **Clamp selection synchronously in `updateRows`/`updatePageCount`** — eliminates the stale-bounds race window in `handleFill`

---

### Phase 4 — Final Approval Gate

**Taste decisions (your call):**

1. **Schema.js `cleanObject` change** — uncommitted tweak adds `{ inArray = false }` option to preserve empty strings in arrays. Not part of this plan's scope but sitting in the working tree. Ship it with this plan's work, or hold for a separate commit?

2. **M1 fix now vs. deferred** — The out-of-bounds clamping bug is only reachable via custom cell lists (all four built-in helpers generate valid coords). Fix it now before the feature is public, or log to TODOS and revisit when a second caller exists?

3. **Test suite priority** — Both eng voices called this MEDIUM. Add Vitest + the 12 scenarios as an immediate follow-on task, or defer until a second utility module needs coverage too?

**No user challenges** — all premise and architecture questions were settled in Phase 1. The plan is closed.
