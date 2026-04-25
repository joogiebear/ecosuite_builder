import { load } from 'js-yaml';

function kebab(camel) {
  return String(camel).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function snake(camel) {
  return kebab(camel).replace(/-/g, '_');
}

function normalizeKeyPart(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function splitWords(value) {
  return String(value ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function wordPartitions(words) {
  const output = [];

  function walk(start, current) {
    if (start >= words.length) {
      output.push(current);
      return;
    }

    for (let end = start + 1; end <= words.length; end += 1) {
      walk(end, [...current, words.slice(start, end).join('')]);
    }
  }

  walk(0, []);
  return output;
}

const SEGMENT_ALIASES = {
  mongo: ['mongo', 'mongodb'],
  gui: ['gui', 'keygui'],
};

const FIELD_PATH_ALIASES = {
  baseItem: [
    ['item', 'item'],
    ['item'],
  ],
  categoryItem: [['item']],
  keyItem: [['item']],
  useImmediatePlaceholderMath: [['use-immediate-placeholder-translation-for-math']],
  xpMethods: [['xp-gain-methods']],
  equipSoundEnabled: [['sounds', 'equip', 'enabled']],
  equipSound: [['sounds', 'equip', 'sound']],
  equipSoundVolume: [['sounds', 'equip', 'volume']],
  equipSoundPitch: [['sounds', 'equip', 'pitch']],
  advancedEquipSoundEnabled: [['sounds', 'advanced-equip', 'enabled']],
  advancedEquipSound: [['sounds', 'advanced-equip', 'sound']],
  advancedEquipSoundVolume: [['sounds', 'advanced-equip', 'volume']],
  advancedEquipSoundPitch: [['sounds', 'advanced-equip', 'pitch']],
  unequipSoundEnabled: [['sounds', 'unequip', 'enabled']],
  unequipSound: [['sounds', 'unequip', 'sound']],
  unequipSoundVolume: [['sounds', 'unequip', 'volume']],
  unequipSoundPitch: [['sounds', 'unequip', 'pitch']],
};

function expandCandidateSegments(segments) {
  const normalized = segments.map((segment) => normalizeKeyPart(segment)).filter(Boolean);
  const output = [];

  function walk(index, current) {
    if (index >= normalized.length) {
      output.push(current);
      return;
    }

    const aliases = SEGMENT_ALIASES[normalized[index]] ?? [normalized[index]];
    for (const alias of aliases) {
      walk(index + 1, [...current, alias]);
    }
  }

  walk(0, []);
  return output;
}

function candidatePathsForKey(formKey) {
  const words = splitWords(formKey);
  const candidates = [
    [formKey],
    [kebab(formKey)],
    [snake(formKey)],
    ...(FIELD_PATH_ALIASES[formKey] ?? []),
  ];

  if (words.length > 0) {
    candidates.push(...wordPartitions(words));
  }

  const seen = new Set();
  const output = [];
  for (const candidate of candidates.flatMap(expandCandidateSegments)) {
    const key = candidate.join('.');
    if (!seen.has(key)) {
      seen.add(key);
      output.push(candidate);
    }
  }

  return output;
}

function flattenYamlValues(value, path = [], output = []) {
  if (path.length > 0) {
    output.push({
      path,
      comparablePath: path.map(normalizeKeyPart).filter((part) => part && !/^\d+$/.test(part)),
      value,
    });
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      if (entry && typeof entry === 'object') {
        flattenYamlValues(entry, [...path, String(index)], output);
      }
    });
    return output;
  }

  if (value && typeof value === 'object') {
    for (const [key, inner] of Object.entries(value)) {
      flattenYamlValues(inner, [...path, key], output);
    }
  }

  return output;
}

function pathEndsWith(path, suffix) {
  if (suffix.length > path.length) return false;
  const offset = path.length - suffix.length;
  return suffix.every((segment, index) => path[offset + index] === segment);
}

function dumpKeyValue(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return '';
  const lines = [];
  const walk = (value, prefix) => {
    for (const [key, inner] of Object.entries(value)) {
      const nested = prefix ? `${prefix}.${key}` : key;
      if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
        walk(inner, nested);
      } else if (Array.isArray(inner)) {
        lines.push(`${nested}: ${inner.join(',')}`);
      } else {
        lines.push(`${nested}: ${inner}`);
      }
    }
  };
  walk(obj, '');
  return lines.join('\n');
}

function effectBlockToForm(block) {
  if (!block || typeof block !== 'object') return null;
  const { id, triggers, args, filters, mutators, ...rest } = block;

  const argsMerged = { ...(args ?? {}), ...rest };

  return {
    id: String(id ?? ''),
    triggers: Array.isArray(triggers) ? triggers.join(',') : (triggers ? String(triggers) : ''),
    argsText: dumpKeyValue(argsMerged),
    filtersText: dumpKeyValue(filters ?? {}),
    mutatorsText: Array.isArray(mutators)
      ? mutators
          .map((m) => dumpKeyValue({ id: m.id, ...(m.args ?? {}) }))
          .join('\n\n')
      : '',
  };
}

function conditionBlockToForm(block) {
  if (!block || typeof block !== 'object') return null;
  const { id, args, ...rest } = block;
  return {
    id: String(id ?? ''),
    argsText: dumpKeyValue({ ...(args ?? {}), ...rest }),
  };
}

function matchYamlValue(yaml, formKey, flattened = null) {
  if (!yaml || typeof yaml !== 'object') return undefined;
  const candidates = [
    formKey,
    kebab(formKey),
    snake(formKey),
  ];
  for (const key of candidates) {
    if (Object.prototype.hasOwnProperty.call(yaml, key)) return yaml[key];
  }

  if (formKey === 'id') {
    return undefined;
  }

  const entries = flattened ?? flattenYamlValues(yaml);
  const pathCandidates = candidatePathsForKey(formKey);
  let best = null;

  for (const candidate of pathCandidates) {
    for (const entry of entries) {
      if (!pathEndsWith(entry.comparablePath, candidate)) continue;

      const score = (candidate.length * 100) - entry.comparablePath.length;
      if (!best || score > best.score) {
        best = { score, value: entry.value };
      }
    }
  }

  if (best) {
    return best.value;
  }

  return undefined;
}

function convertFieldValue(currentValue, yamlValue) {
  if (yamlValue === undefined || yamlValue === null) return undefined;

  if (typeof currentValue === 'boolean') {
    if (typeof yamlValue === 'boolean') return yamlValue;
    if (typeof yamlValue === 'number') return yamlValue !== 0;
    if (typeof yamlValue === 'string') {
      const normalized = yamlValue.trim().toLowerCase();
      if (['true', 'yes', 'on', '1'].includes(normalized)) return true;
      if (['false', 'no', 'off', '0'].includes(normalized)) return false;
    }
    return Boolean(yamlValue);
  }
  if (typeof currentValue === 'number') {
    const numeric = Number(yamlValue);
    return Number.isNaN(numeric) ? currentValue : numeric;
  }
  if (typeof currentValue === 'string') {
    if (Array.isArray(yamlValue)) return yamlValue.join('\n');
    if (typeof yamlValue === 'object') return dumpKeyValue(yamlValue);
    return String(yamlValue);
  }

  if (Array.isArray(currentValue)) {
    if (!Array.isArray(yamlValue)) return currentValue;

    const sample = currentValue[0];

    // Effect-shaped collection: discriminator is the presence of argsText + filtersText.
    if (sample && typeof sample === 'object' && ('argsText' in sample) && ('filtersText' in sample)) {
      return yamlValue.map((entry) => effectBlockToForm(entry)).filter(Boolean);
    }

    // Condition-shaped collection: argsText without triggers.
    if (sample && typeof sample === 'object' && ('argsText' in sample) && !('triggers' in sample)) {
      return yamlValue.map((entry) => conditionBlockToForm(entry)).filter(Boolean);
    }

    if (sample && typeof sample === 'object') {
      return yamlValue.map((entry) => {
        if (typeof entry !== 'object') return entry;
        const result = { ...sample };
        for (const key of Object.keys(sample)) {
          const val = matchYamlValue(entry, key);
          if (val !== undefined) {
            if (typeof sample[key] === 'number') {
              const numeric = Number(val);
              result[key] = Number.isNaN(numeric) ? sample[key] : numeric;
            } else {
              result[key] = val;
            }
          }
        }
        return result;
      });
    }

    return yamlValue.map((entry) => String(entry));
  }

  return yamlValue;
}

export function parseYamlDraft(yamlText, initialValues) {
  const parsed = load(String(yamlText ?? ''));
  if (!parsed || typeof parsed !== 'object') {
    return { values: null, matched: [], unmapped: [], errors: ['Input is not a YAML mapping.'] };
  }

  const result = structuredClone(initialValues);
  const matched = [];
  const seen = new Set();
  const flattened = flattenYamlValues(parsed);

  for (const key of Object.keys(initialValues)) {
    const yamlValue = matchYamlValue(parsed, key, flattened);
    if (yamlValue === undefined) continue;

    const converted = convertFieldValue(initialValues[key], yamlValue);
    if (converted !== undefined) {
      result[key] = converted;
      matched.push(key);
      const variants = [key, kebab(key), snake(key)];
      for (const variant of variants) seen.add(variant);
    }
  }

  const unmapped = [];
  for (const yamlKey of Object.keys(parsed)) {
    if (!seen.has(yamlKey)) unmapped.push(yamlKey);
  }

  return { values: result, matched, unmapped, errors: [] };
}
