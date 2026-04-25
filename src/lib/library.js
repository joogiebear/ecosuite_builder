import { readStoredJson, writeStoredJson } from './util.js';

const LIBRARY_KEY = 'ecosuite-builder:library';

function read() {
  const parsed = readStoredJson(LIBRARY_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function write(entries) {
  writeStoredJson(LIBRARY_KEY, entries);
}

function normalizeEntries(entries) {
  return Array.isArray(entries)
    ? entries.filter((entry) => entry && typeof entry === 'object' && !Array.isArray(entry))
    : [];
}

async function readDesktopLibrary() {
  if (!window.ecoSuiteApi?.readLibrary) {
    return null;
  }

  const response = await window.ecoSuiteApi.readLibrary();
  return {
    exists: Boolean(response?.exists),
    entries: normalizeEntries(response?.entries),
  };
}

async function writeDesktopLibrary(entries) {
  if (!window.ecoSuiteApi?.writeLibrary) {
    return normalizeEntries(entries);
  }

  const response = await window.ecoSuiteApi.writeLibrary(normalizeEntries(entries));
  return normalizeEntries(response?.entries);
}

function randomId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function listLibrary() {
  return read();
}

export async function loadLibrary() {
  const localEntries = read();
  const desktopLibrary = await readDesktopLibrary();
  if (!desktopLibrary) {
    return localEntries;
  }

  if (!desktopLibrary.exists && localEntries.length > 0) {
    const migrated = await writeDesktopLibrary(localEntries);
    write(migrated);
    return migrated;
  }

  write(desktopLibrary.entries);
  return desktopLibrary.entries;
}

async function persistEntries(entries) {
  const normalized = normalizeEntries(entries);
  const saved = await writeDesktopLibrary(normalized);
  write(saved);
  return saved;
}

function applyUpsert(entries, { pluginId, templateId, name, values, outputPath }) {
  const safeName = name && name.trim() !== '' ? name.trim() : 'untitled';

  const matchIndex = entries.findIndex(
    (entry) => entry.pluginId === pluginId && entry.templateId === templateId && entry.name === safeName,
  );

  const nextEntry = {
    entryId: matchIndex >= 0 ? entries[matchIndex].entryId : randomId(),
    pluginId,
    templateId,
    name: safeName,
    values,
    outputPath,
    savedAt: Date.now(),
  };

  if (matchIndex >= 0) {
    entries[matchIndex] = nextEntry;
  } else {
    entries.push(nextEntry);
  }

  return nextEntry;
}

export async function upsertEntry(entry) {
  const entries = await loadLibrary();
  applyUpsert(entries, entry);
  return persistEntries(entries);
}

export async function upsertEntries(nextEntries) {
  const entries = await loadLibrary();
  for (const entry of nextEntries ?? []) {
    applyUpsert(entries, entry);
  }
  return persistEntries(entries);
}

export async function removeEntry(entryId) {
  const entries = await loadLibrary();
  const filtered = entries.filter((entry) => entry.entryId !== entryId);
  return persistEntries(filtered);
}

export async function clearLibrary() {
  return persistEntries([]);
}
