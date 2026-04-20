const COLS = 9;
const MAX_ROWS = 6;
const CYCLE = ['0', '1', '2'];
const LABELS = { '0': 'reward', '1': 'mask 1', '2': 'mask 2' };

function parsePattern(value) {
  const lines = String(value ?? '').split(/\r?\n/).slice(0, MAX_ROWS);
  const rows = Math.max(lines.length, 1);
  return Array.from({ length: rows }, (_, r) => {
    const line = lines[r] ?? '';
    return Array.from({ length: COLS }, (_, c) => (CYCLE.includes(line[c]) ? line[c] : '0'));
  });
}

export default function PreviewPatternEditor({ value, onChange }) {
  const cells = parsePattern(value);

  function toggle(r, c) {
    const updated = cells.map((row) => [...row]);
    const cur = updated[r][c];
    updated[r][c] = CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
    onChange(updated.map((row) => row.join('')).join('\n'));
  }

  return (
    <div className="preview-pattern-editor">
      {cells.map((row, r) => (
        <div key={r} className="preview-pattern-row">
          {row.map((cell, c) => (
            <button
              key={c}
              type="button"
              className={`pattern-cell v${cell}`}
              onClick={() => toggle(r, c)}
              aria-label={`Row ${r + 1} col ${c + 1}: ${LABELS[cell] ?? cell}`}
            >
              {cell}
            </button>
          ))}
        </div>
      ))}
      <p className="pattern-legend">
        <span className="pattern-legend-item v0">0 reward</span>
        <span className="pattern-legend-item v1">1 mask 1</span>
        <span className="pattern-legend-item v2">2 mask 2</span>
        <span className="pattern-legend-note">click to cycle</span>
      </p>
    </div>
  );
}
