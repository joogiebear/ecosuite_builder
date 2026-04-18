import {
  buildConditions,
  cleanObject,
  csvToArray,
  linesToArray,
  parseKeyValueText,
} from '../lib/schema.js';

export const effectField = (key = 'effects', label = 'Effects') => ({
  key,
  label,
  type: 'effects',
  width: 'full',
  help: 'Build shared libreforge effect blocks with IDs, triggers, args, and quick filters.',
});

export const conditionField = (key = 'conditions', label = 'Conditions') => ({
  key,
  label,
  type: 'conditions',
  width: 'full',
  help: 'Add condition IDs plus optional args as key:value lines.',
});

export const xpMethodsField = (key = 'xpMethods', label = 'XP methods', addLabel = 'Add XP method') => ({
  key,
  label,
  type: 'collection',
  width: 'full',
  addLabel,
  fields: [
    { key: 'trigger', label: 'Trigger', type: 'text' },
    { key: 'multiplier', label: 'Multiplier', type: 'text' },
    { key: 'filtersText', label: 'Filters', type: 'textarea' },
  ],
});

export const levelLinesField = (key, label, addLabel = 'Add level entry') => ({
  key,
  label,
  type: 'collection',
  width: 'full',
  addLabel,
  fields: [
    { key: 'level', label: 'Level', type: 'number', width: 'half' },
    { key: 'lines', label: 'Lines', type: 'multiline-list', width: 'full' },
  ],
});

export function buildPrice(value, type, display) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return undefined;
  }

  return cleanObject({
    value: numeric,
    type,
    display,
  });
}

export function buildXpMethods(entries, triggerKey = 'trigger') {
  return cleanObject(
    (entries ?? []).map((entry) =>
      cleanObject({
        [triggerKey]: entry.trigger,
        multiplier: entry.multiplier,
        conditions: buildConditions(entry.conditions),
        filters: parseKeyValueText(entry.filtersText),
      }),
    ),
  );
}

export function buildLevelKeyedLines(entries) {
  const output = {};
  for (const entry of entries ?? []) {
    const level = Number(entry?.level);
    if (Number.isNaN(level)) continue;
    const lines = linesToArray(entry.lines);
    if (lines.length === 0) continue;
    output[level] = lines;
  }
  return cleanObject(output);
}

export function buildTierRewards(entries) {
  return cleanObject(
    (entries ?? []).map((entry) => {
      const rewards = [
        ...csvToArray(entry.freeRewards).map((id) => ({ id, tier: 'free' })),
        ...csvToArray(entry.premiumRewards).map((id) => ({ id, tier: 'premium' })),
      ];

      return cleanObject({
        tier: Number(entry.tier),
        rewards,
      });
    }),
  );
}

export function buildSimpleListObjects(entries, key) {
  return cleanObject(
    (entries ?? []).map((entry) =>
      cleanObject({
        [key]: entry[key],
        xp: entry.xp ? Number(entry.xp) : undefined,
        levels: entry.levels ? Number(entry.levels) : undefined,
        'start-level': entry.startLevel ? Number(entry.startLevel) : undefined,
        'end-level': entry.endLevel ? Number(entry.endLevel) : undefined,
        every: entry.every ? Number(entry.every) : undefined,
      }),
    ),
  );
}

export function buildRequirements(entries) {
  return cleanObject(
    (entries ?? []).map((entry) =>
      cleanObject({
        scroll: entry.scroll,
        level: entry.level ? Number(entry.level) : undefined,
      }),
    ),
  );
}

export function buildMenuSlots(entries) {
  return cleanObject(
    (entries ?? []).map((entry) => {
      const action =
        entry.clickActionType && entry.clickActionType !== 'none'
          ? [
              cleanObject({
                id: entry.clickActionType,
                args: entry.clickActionValue
                  ? entry.clickActionType === 'run_command'
                    ? { command: entry.clickActionValue }
                    : entry.clickActionType === 'open_menu'
                      ? { menu: entry.clickActionValue }
                      : entry.clickActionType === 'send_message'
                        ? { message: entry.clickActionValue }
                        : undefined
                  : undefined,
              }),
            ]
          : undefined;

      return cleanObject({
        item: entry.item,
        name: entry.name,
        lore: linesToArray(entry.lore),
        location: {
          row: Number(entry.row),
          column: Number(entry.column),
          page: Number(entry.page || 1),
        },
        'left-click': cleanObject(action),
      });
    }),
  );
}

export function armorPiece(material, piece, color) {
  if (material === 'leather') {
    return `leather_${piece} color:${color || '#303030'} hide_dye`;
  }

  return `${material}_${piece}`;
}
