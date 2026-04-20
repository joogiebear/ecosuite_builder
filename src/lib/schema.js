export function cloneValue(value) {
  return structuredClone(value);
}

export function slugify(text) {
  return String(text ?? 'config')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'config';
}

export function csvToArray(value) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function linesToArray(value, options = {}) {
  const { preserveEmpty = false } = options;
  const rawLines = String(value ?? '').split(/\r?\n/);

  if (!preserveEmpty) {
    return rawLines.map((line) => line.trim()).filter(Boolean);
  }

  let end = rawLines.length;
  while (end > 0 && rawLines[end - 1].trim() === '') {
    end -= 1;
  }

  return rawLines.slice(0, end).map((line) => line.trimEnd());
}

export function numberLinesToArray(value) {
  return linesToArray(value)
    .map((line) => Number(line))
    .filter((line) => !Number.isNaN(line));
}

function parseScalar(value) {
  if (value === '') {
    return '';
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return value;
}

function setNestedValue(target, path, value) {
  let cursor = target;

  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index];
    if (!cursor[key] || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }

  cursor[path[path.length - 1]] = value;
}

export function parseKeyValueText(value) {
  const lines = linesToArray(value);
  const output = {};

  for (const line of lines) {
    const separator = line.indexOf(':');
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    if (!key) {
      continue;
    }

    const parsedValue = rawValue.includes(',')
      ? rawValue.split(',').map((item) => parseScalar(item.trim())).filter((item) => item !== '')
      : parseScalar(rawValue);

    setNestedValue(output, key.split('.'), parsedValue);
  }

  return output;
}

export function cleanObject(value, { inArray = false } = {}) {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((entry) => cleanObject(entry, { inArray: true }))
      .filter((entry) => entry !== undefined);

    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (value && typeof value === 'object') {
    const cleanedEntries = Object.entries(value)
      .map(([key, entry]) => [key, cleanObject(entry)])
      .filter(([, entry]) => entry !== undefined);

    if (cleanedEntries.length === 0) {
      return undefined;
    }

    return Object.fromEntries(cleanedEntries);
  }

  if (typeof value === 'string') {
    if (inArray) return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : value;
  }

  if (value === null || value === undefined) {
    return undefined;
  }

  return value;
}

function parseMutatorGroups(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const groups = [];
  let current = [];

  const flush = () => {
    if (current.length === 0) return;
    const joined = current.join('\n');
    const parsed = parseKeyValueText(joined);
    const { id, ...rest } = parsed;
    if (id || Object.keys(rest).length > 0) {
      groups.push(
        cleanObject({
          id,
          args: Object.keys(rest).length > 0 ? rest : undefined,
        }),
      );
    }
    current = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === '') {
      flush();
      continue;
    }
    current.push(line);
  }
  flush();

  return cleanObject(groups);
}

export function buildEffects(effects) {
  return cleanObject(
    (effects ?? []).map((effect) =>
      cleanObject({
        id: effect.id,
        args: parseKeyValueText(effect.argsText),
        triggers: csvToArray(effect.triggers),
        filters: parseKeyValueText(effect.filtersText),
        mutators: parseMutatorGroups(effect.mutatorsText),
      }),
    ),
  );
}

export function buildConditions(conditions) {
  return cleanObject(
    (conditions ?? []).map((condition) =>
      cleanObject({
        id: condition.id,
        args: parseKeyValueText(condition.argsText),
      }),
    ),
  );
}

export function buildPlaceholderMap(pairs) {
  const output = {};

  for (const pair of pairs ?? []) {
    if (!pair.id?.trim() || !pair.value?.trim()) {
      continue;
    }

    output[pair.id.trim()] = pair.value.trim();
  }

  return cleanObject(output);
}

export function buildCollectionMap(entries, keyField, valueBuilder) {
  const output = {};

  for (const entry of entries ?? []) {
    const key = String(entry?.[keyField] ?? '').trim();
    if (!key) {
      continue;
    }

    const value = valueBuilder(entry);
    if (value !== undefined) {
      output[key] = value;
    }
  }

  return cleanObject(output);
}

export function deriveFileName(values, fallbackId) {
  return `${slugify(values?.id || values?.name || fallbackId || 'config')}.yml`;
}

export function autoGrid(ids, options = {}) {
  const { startRow = 2, startColumn = 2, columns = 4 } = options;
  const filtered = ids.filter(Boolean);

  return filtered.map((id, index) => ({
    id,
    row: startRow + Math.floor(index / columns),
    column: startColumn + (index % columns),
  }));
}
