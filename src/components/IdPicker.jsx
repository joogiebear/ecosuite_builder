import { useEffect, useMemo, useRef, useState } from 'react';

export default function IdPicker({ catalog, currentId, onPick, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onClick(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  const grouped = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = catalog.filter((entry) => {
      if (!needle) return true;
      return (
        entry.id.toLowerCase().includes(needle) ||
        (entry.description || '').toLowerCase().includes(needle) ||
        (entry.category || '').toLowerCase().includes(needle)
      );
    });

    const byCategory = new Map();
    for (const entry of filtered) {
      const cat = entry.category || 'Other';
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push(entry);
    }
    return [...byCategory.entries()];
  }, [catalog, query]);

  function pick(entry) {
    onPick(entry);
    setOpen(false);
    setQuery('');
  }

  return (
    <div className="id-picker" ref={containerRef}>
      <button
        type="button"
        className="ghost-button id-picker-trigger"
        onClick={() => setOpen((current) => !current)}
      >
        {placeholder || 'Browse'}
      </button>
      {open ? (
        <div className="id-picker-menu">
          <div className="id-picker-search">
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search…"
            />
          </div>
          <div className="id-picker-list">
            {grouped.length === 0 ? (
              <div className="id-picker-empty">No matches.</div>
            ) : null}
            {grouped.map(([category, entries]) => (
              <div key={category} className="id-picker-group">
                <div className="id-picker-group-label">{category}</div>
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className={`id-picker-item ${entry.id === currentId ? 'active' : ''}`}
                    onClick={() => pick(entry)}
                  >
                    <span className="id-picker-item-id">{entry.id}</span>
                    {entry.description ? (
                      <span className="id-picker-item-desc">{entry.description}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
