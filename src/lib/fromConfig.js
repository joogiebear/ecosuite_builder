import { load } from 'js-yaml';

function kebab(camel) {
  return String(camel).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function snake(camel) {
  return kebab(camel).replace(/-/g, '_');
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

function matchYamlValue(yaml, formKey) {
  if (!yaml || typeof yaml !== 'object') return undefined;
  const candidates = [
    formKey,
    kebab(formKey),
    snake(formKey),
  ];
  for (const key of candidates) {
    if (Object.prototype.hasOwnProperty.call(yaml, key)) return yaml[key];
  }
  return undefined;
}

function convertFieldValue(currentValue, yamlValue) {
  if (yamlValue === undefined || yamlValue === null) return undefined;

  if (typeof currentValue === 'boolean') {
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
          if (val !== undefined) result[key] = typeof sample[key] === 'number' ? Number(val) : val;
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

  const result = { ...initialValues };
  const matched = [];
  const seen = new Set();

  for (const key of Object.keys(initialValues)) {
    const yamlValue = matchYamlValue(parsed, key);
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
