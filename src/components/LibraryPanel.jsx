import { useMemo, useState } from 'react';

export default function LibraryPanel({ entries, onLoad, onRemove, onDuplicate, onExportPack, onImportPack }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const base = [...entries].sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0));
    if (!needle) return base;
    return base.filter((entry) => {
      return (
        entry.pluginId.toLowerCase().includes(needle) ||
        entry.templateId.toLowerCase().includes(needle) ||
        entry.name.toLowerCase().includes(needle)
      );
    });
  }, [entries, query]);

  return (
    <div className="library-panel">
      <div className="library-header">
        <span>Library</span>
        <strong>{entries.length}</strong>
      </div>
      <button type="button" className="ghost-button library-action" onClick={onImportPack}>
        Import pack…
      </button>
      {entries.length > 0 ? (
        <>
          <input
            className="library-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search library…"
          />
          <div className="library-list">
            {filtered.map((entry) => (
              <div key={entry.entryId} className="library-item">
                <button
                  type="button"
                  className="library-item-main"
                  onClick={() => onLoad(entry)}
                  title={entry.outputPath || ''}
                >
                  <span className="library-item-name">{entry.name}</span>
                  <span className="library-item-meta">
                    {entry.pluginId} · {entry.templateId}
                  </span>
                </button>
                <button
                  type="button"
                  className="library-item-action"
                  onClick={() => onDuplicate(entry)}
                  title="Duplicate entry"
                  aria-label="Duplicate entry"
                >
                  ⧉
                </button>
                <button
                  type="button"
                  className="library-item-action danger"
                  onClick={() => onRemove(entry.entryId)}
                  title="Remove from library"
                  aria-label="Remove from library"
                >
                  ×
                </button>
              </div>
            ))}
            {filtered.length === 0 ? (
              <div className="library-empty compact">No matches.</div>
            ) : null}
          </div>
          <button type="button" className="secondary-button library-export" onClick={onExportPack}>
            Export pack ({entries.length})
          </button>
        </>
      ) : (
        <div className="library-empty">
          Save configs here to build a full server pack. Hit <strong>Save to library</strong> above to start.
        </div>
      )}
    </div>
  );
}
