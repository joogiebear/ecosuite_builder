import { useState } from 'react';
import { parseYamlDraft } from '../lib/fromConfig.js';
import { resolveTemplateForPath } from '../lib/templateResolver.js';

export default function PackImportModal({ open, onClose, onCommit }) {
  const [scan, setScan] = useState(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function pickFolder() {
    setStatus('');
    if (!window.ecoSuiteApi?.importPack) {
      setStatus('Pack import only works inside the desktop window.');
      return;
    }
    setBusy(true);
    try {
      const response = await window.ecoSuiteApi.importPack();
      if (response?.canceled) {
        setBusy(false);
        return;
      }
      if (response?.error) {
        setStatus(`Scan failed: ${response.error}`);
        setBusy(false);
        return;
      }
      const matches = [];
      const unknown = [];
      const allFiles = response.files ?? [];
      const YIELD_EVERY = 25;
      for (let index = 0; index < allFiles.length; index += 1) {
        const file = allFiles[index];
        const resolved = resolveTemplateForPath(file.path);
        if (resolved.status === 'matched') {
          try {
            const parsed = parseYamlDraft(file.content, resolved.template.initialValues ?? {});
            matches.push({
              path: file.path,
              plugin: resolved.plugin,
              template: resolved.template,
              name: resolved.name,
              values: parsed.values,
              matched: parsed.matched.length,
              unmapped: parsed.unmapped,
              content: file.content,
            });
          } catch (err) {
            unknown.push({ path: file.path, reason: err?.message ?? 'parse failed' });
          }
        } else {
          unknown.push({ path: file.path, reason: resolved.status === 'unknown-plugin' ? 'unknown plugin folder' : 'unknown template' });
        }

        if ((index + 1) % YIELD_EVERY === 0 && index + 1 < allFiles.length) {
          setStatus(`Parsing ${index + 1}/${allFiles.length}…`);
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
      setStatus('');
      setScan({
        directory: response.directory,
        files: response.files ?? [],
        matches,
        unknown,
        skipped: response.skipped ?? [],
      });
    } catch (err) {
      setStatus(`Scan failed: ${err?.message ?? 'unknown error'}`);
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    if (!scan) return;
    setBusy(true);
    setStatus('');
    try {
      await onCommit(scan.matches);
      setScan(null);
      onClose();
    } catch (err) {
      setStatus(`Import failed: ${err?.message ?? 'unknown error'}`);
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setScan(null);
    setStatus('');
    onClose();
  }

  return (
    <div className="palette-backdrop" onMouseDown={close}>
      <div className="palette import-modal pack-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="import-modal-header">
          <h3>Import pack</h3>
          <p>Pick a folder containing plugin configs. Each file is matched to a template by its path, parsed, and added to your library.</p>
        </div>
        {!scan ? (
          <div className="pack-modal-cta">
            <button type="button" className="primary-button" onClick={pickFolder} disabled={busy}>
              {busy ? 'Scanning…' : 'Pick folder…'}
            </button>
            {status ? <div className="import-modal-error">{status}</div> : null}
          </div>
        ) : (
          <>
            <div className="import-modal-result">
              <div>
                Scanned <strong>{scan.directory}</strong>
              </div>
              <div>
                <strong>{scan.matches.length}</strong> matched, <strong>{scan.unknown.length}</strong> unknown, <strong>{scan.skipped.length}</strong> skipped
              </div>
            </div>
            <div className="pack-scan-list">
              {scan.matches.map((match) => (
                <div key={match.path} className="pack-scan-row matched">
                  <span className="pack-scan-path">{match.path}</span>
                  <span className="pack-scan-meta">{match.plugin.name} › {match.template.name}</span>
                  <span className="pack-scan-meta muted">{match.matched} fields mapped{match.unmapped.length > 0 ? `, ${match.unmapped.length} unmapped` : ''}</span>
                </div>
              ))}
              {scan.unknown.map((entry) => (
                <div key={entry.path} className="pack-scan-row unknown">
                  <span className="pack-scan-path">{entry.path}</span>
                  <span className="pack-scan-meta muted">{entry.reason}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="import-modal-actions">
          <button type="button" className="ghost-button" onClick={close}>Cancel</button>
          <button
            type="button"
            className="primary-button"
            onClick={apply}
            disabled={busy || !scan || scan.matches.length === 0}
          >
            Import {scan?.matches.length ?? 0} into library
          </button>
        </div>
      </div>
    </div>
  );
}
