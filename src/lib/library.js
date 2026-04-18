import { readStoredJson, writeStoredJson } from './util.js';

const LIBRARY_KEY = 'ecosuite-builder:library';

function read() {
  const parsed = readStoredJson(LIBRARY_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function write(entries) {
  writeStoredJson(LIBRARY_KEY, entries);
}

function randomId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function listLibrary() {
  return read();
}

export function upsertEntry({ pluginId, templateId, name, values, outputPath }) {
  const entries = read();
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

  write(entries);
  return nextEntry;
}

export function removeEntry(entryId) {
  const filtered = read().filter((entry) => entry.entryId !== entryId);
  write(filtered);
}

export function clearLibrary() {
  write([]);
}
