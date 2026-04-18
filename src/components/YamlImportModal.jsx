import { useState } from 'react';
import { parseYamlDraft } from '../lib/fromConfig.js';

export default function YamlImportModal({ open, template, onClose, onImport }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!open) return null;

  function preview() {
    setError('');
    try {
      const parsed = parseYamlDraft(text, template.initialValues ?? {});
      if (parsed.errors.length > 0) {
        setError(parsed.errors.join(' '));
        setResult(null);
        return;
      }
      setResult(parsed);
    } catch (err) {
      setError(err?.message ?? 'Failed to parse YAML.');
      setResult(null);
    }
  }

  function apply() {
    if (!result?.values) return;
    onImport(result.values);
    setText('');
    setResult(null);
    onClose();
  }

  function close() {
    setText('');
    setResult(null);
    setError('');
    onClose();
  }

  return (
    <div className="palette-backdrop" onMouseDown={close}>
      <div className="palette import-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="import-modal-header">
          <h3>Import YAML into {template.name}</h3>
          <p>Paste an existing config file. The importer will try to map it to the form fields.</p>
        </div>
        <textarea
          className="import-modal-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste YAML here…"
          rows={14}
          spellCheck={false}
        />
        {error ? <div className="import-modal-error">{error}</div> : null}
        {result ? (
          <div className="import-modal-result">
            <div>
              <strong>{result.matched.length}</strong> fields mapped
              {result.matched.length > 0 ? <span className="muted"> — {result.matched.slice(0, 8).join(', ')}{result.matched.length > 8 ? '…' : ''}</span> : null}
            </div>
            {result.unmapped.length > 0 ? (
              <div className="import-modal-unmapped">
                Unmapped keys: <span className="muted">{result.unmapped.slice(0, 8).join(', ')}{result.unmapped.length > 8 ? ` +${result.unmapped.length - 8} more` : ''}</span>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="import-modal-actions">
          <button type="button" className="ghost-button" onClick={close}>Cancel</button>
          <button type="button" className="secondary-button" onClick={preview} disabled={!text.trim()}>
            Preview
          </button>
          <button type="button" className="primary-button" onClick={apply} disabled={!result?.values}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
