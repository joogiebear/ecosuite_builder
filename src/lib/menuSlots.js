import { clampNumber } from './util.js';

export const MENU_PRESETS = [
  { id: 'blank', label: 'Blank' },
  { id: 'close', label: 'Close' },
  { id: 'command', label: 'Command' },
  { id: 'open_menu', label: 'Open Menu' },
  { id: 'message', label: 'Message' },
  { id: 'player', label: 'Player' },
];

export function stripMinecraftFormatting(text) {
  return String(text ?? '')
    .replace(/&[0-9A-FK-OR]/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/%player%/gi, 'Player')
    .replace(/_/g, ' ')
    .trim();
}

function slotKey(page, row, column) {
  return `${page}:${row}:${column}`;
}

export function sortMenuSlots(slots) {
  return [...slots].sort((left, right) => {
    const pageDifference = Number(left.page || 1) - Number(right.page || 1);
    if (pageDifference !== 0) {
      return pageDifference;
    }

    const rowDifference = Number(left.row || 1) - Number(right.row || 1);
    if (rowDifference !== 0) {
      return rowDifference;
    }

    return Number(left.column || 1) - Number(right.column || 1);
  });
}

export function sanitizeMenuSlots(slots, rows, pageCount) {
  const seen = new Set();
  const cleaned = [];

  for (const slot of slots ?? []) {
    const row = clampNumber(slot.row, 1, rows, 1);
    const column = clampNumber(slot.column, 1, 9, 1);
    const page = clampNumber(slot.page, 1, pageCount, 1);
    const key = slotKey(page, row, column);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    cleaned.push({ ...slot, row, column, page });
  }

  return sortMenuSlots(cleaned);
}

export function buildSlotMap(slots) {
  const map = new Map();
  for (const slot of slots) {
    map.set(slotKey(Number(slot.page || 1), Number(slot.row), Number(slot.column)), slot);
  }
  return map;
}

export function getMenuSlotFromMap(map, row, column, page) {
  return map.get(slotKey(Number(page), Number(row), Number(column)));
}

export function upsertMenuSlot(slots, nextSlot, rows, pageCount) {
  const targetKey = slotKey(
    Number(nextSlot.page || 1),
    Number(nextSlot.row),
    Number(nextSlot.column),
  );
  const filtered = [];

  for (const slot of slots ?? []) {
    const key = slotKey(
      Number(slot.page || 1),
      Number(slot.row),
      Number(slot.column),
    );
    if (key !== targetKey) {
      filtered.push(slot);
    }
  }

  filtered.push(nextSlot);
  return sanitizeMenuSlots(filtered, rows, pageCount);
}

export function removeMenuSlot(slots, row, column, page, rows, pageCount) {
  const targetKey = slotKey(Number(page), Number(row), Number(column));
  const filtered = [];

  for (const slot of slots ?? []) {
    const key = slotKey(
      Number(slot.page || 1),
      Number(slot.row),
      Number(slot.column),
    );
    if (key !== targetKey) {
      filtered.push(slot);
    }
  }

  return sanitizeMenuSlots(filtered, rows, pageCount);
}

export function createMenuPresetSlot(presetId, row, column, page) {
  const base = { row, column, page };

  switch (presetId) {
    case 'close':
      return {
        ...base,
        item: 'barrier',
        name: '&cClose',
        lore: '',
        clickActionType: 'close_inventory',
        clickActionValue: '',
      };
    case 'command':
      return {
        ...base,
        item: 'paper',
        name: '&aRun Command',
        lore: '&7Runs a command when clicked',
        clickActionType: 'run_command',
        clickActionValue: 'say hello',
      };
    case 'open_menu':
      return {
        ...base,
        item: 'compass',
        name: '&bOpen Menu',
        lore: '&7Opens another menu',
        clickActionType: 'open_menu',
        clickActionValue: 'other_menu',
      };
    case 'message':
      return {
        ...base,
        item: 'book',
        name: '&eSend Message',
        lore: '&7Sends a message to the player',
        clickActionType: 'send_message',
        clickActionValue: '&aHello!',
      };
    case 'player':
      return {
        ...base,
        item: 'player_head head:%player%',
        name: '&f%player%',
        lore: '&7Profile button',
        clickActionType: 'none',
        clickActionValue: '',
      };
    default:
      return {
        ...base,
        item: 'stone_button',
        name: '&fButton',
        lore: '',
        clickActionType: 'none',
        clickActionValue: '',
      };
  }
}

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
  let map = buildSlotMap(slots);
  let result = slots;
  for (const { row, column } of cells) {
    if (row < 1 || row > rowCount || column < 1 || column > 9 || page < 1 || page > pageCount) continue;
    if (!getMenuSlotFromMap(map, row, column, page)) {
      result = upsertMenuSlot(
        result,
        { item: itemId, name: '', lore: '', row, column, page, clickActionType: 'none', clickActionValue: '' },
        rowCount,
        pageCount,
      );
      map = buildSlotMap(result);
    }
  }
  return result;
}
