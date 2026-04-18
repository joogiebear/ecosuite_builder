import { readStoredJson } from './util.js';

function storageKey(pluginId, templateId) {
  return `ecosuite-builder:${pluginId}:${templateId}`;
}

function readDraft(pluginId, templateId) {
  return readStoredJson(storageKey(pluginId, templateId));
}

const ID_FIELDS = {
  'EcoBits:currency-config': 'currencyId',
};

export function idFieldFor(pluginId, templateId) {
  return ID_FIELDS[`${pluginId}:${templateId}`] ?? 'id';
}

function readDraftId(pluginId, templateId) {
  const draft = readDraft(pluginId, templateId);
  if (!draft) return null;
  const value = draft[idFieldFor(pluginId, templateId)];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function libraryIdsFrom(entries, pluginId, templateId) {
  if (!Array.isArray(entries)) return [];
  const field = idFieldFor(pluginId, templateId);
  return entries
    .filter((entry) => entry?.pluginId === pluginId && entry?.templateId === templateId)
    .map((entry) => {
      const fromValues = entry?.values?.[field];
      const candidate = (typeof fromValues === 'string' && fromValues.trim()) || entry?.name;
      return typeof candidate === 'string' ? candidate.trim() : null;
    })
    .filter(Boolean);
}

export function collectDraftIds(pluginId, templateId, library) {
  const ids = new Set();
  const draftId = readDraftId(pluginId, templateId);
  if (draftId) ids.add(draftId);
  const entries = library ?? readStoredJson('ecosuite-builder:library', []);
  for (const id of libraryIdsFrom(entries, pluginId, templateId)) {
    ids.add(id);
  }
  return ids;
}

