import { useEffect, useMemo, useRef, useState } from 'react';

export default function CommandPalette({ plugins, onSelect, open, onClose }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const items = useMemo(() => {
    const result = [];
    for (const plugin of plugins) {
      for (const template of plugin.templates) {
        result.push({
          pluginId: plugin.id,
          pluginName: plugin.name,
          templateId: template.id,
          templateName: template.name,
          description: template.description,
        });
      }
    }
    return result;
  }, [plugins]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => {
      return (
        item.pluginName.toLowerCase().includes(needle) ||
        item.templateName.toLowerCase().includes(needle) ||
        (item.description || '').toLowerCase().includes(needle)
      );
    });
  }, [items, query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
      return undefined;
    }
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((current) => Math.min(filtered.length - 1, current + 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((current) => Math.max(0, current - 1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const item = filtered[activeIndex];
        if (item) {
          onSelect(item);
          onClose();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, filtered, activeIndex, onSelect, onClose]);

  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector('[data-active="true"]');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!open) return null;

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div className="palette" onMouseDown={(event) => event.stopPropagation()}>
        <div className="palette-search">
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search plugins and templates…"
          />
          <span className="palette-hint">Esc to close · ↑↓ to move · Enter to open</span>
        </div>
        <div ref={listRef} className="palette-list">
          {filtered.length === 0 ? (
            <div className="palette-empty">No matches.</div>
          ) : null}
          {filtered.map((item, index) => (
            <button
              key={`${item.pluginId}:${item.templateId}`}
              type="button"
              data-active={index === activeIndex}
              className={`palette-item ${index === activeIndex ? 'active' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                onSelect(item);
                onClose();
              }}
            >
              <div className="palette-item-line">
                <span className="palette-item-plugin">{item.pluginName}</span>
                <span className="palette-item-sep">›</span>
                <span className="palette-item-template">{item.templateName}</span>
              </div>
              {item.description ? (
                <span className="palette-item-desc">{item.description}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
