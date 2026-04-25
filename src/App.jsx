import { useEffect, useMemo, useState } from 'react';
import { dump } from 'js-yaml';
import { getPluginDocsUrl, getPluginSourceUrl, pluginCatalog } from './data/catalog.js';
import { cleanObject, cloneValue } from './lib/schema.js';
import { generateValues } from './lib/generate.js';
import { collectValidationIssues, getFieldError } from './lib/validate.js';
import CommandPalette from './components/CommandPalette.jsx';
import LibraryPanel from './components/LibraryPanel.jsx';
import PackImportModal from './components/PackImportModal.jsx';
import YamlImportModal from './components/YamlImportModal.jsx';
import { idFieldFor } from './lib/knownIds.js';
import { listLibrary, loadLibrary, removeEntry, upsertEntry, upsertEntries } from './lib/library.js';
import { readStored, readStoredJson, writeStored, writeStoredJson } from './lib/util.js';
import EcoMenusDesigner from './components/EcoMenusDesigner.jsx';
import FieldRenderer from './components/FieldRenderer.jsx';
import FieldShell from './components/FieldShell.jsx';
import ThemeGlyph from './components/ThemeGlyph.jsx';

const THEME_KEY = 'ecosuite-builder:theme';
const SELECTION_KEY = 'ecosuite-builder:last-selection';
const DRAFT_WRITE_DELAY_MS = 300;
const YAML_PREVIEW_DELAY_MS = 120;

function storageKey(pluginId, templateId) {
  return `ecosuite-builder:${pluginId}:${templateId}`;
}

function readStoredTheme() {
  const saved = readStored(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

const initialTheme = readStoredTheme();
if (typeof document !== 'undefined') {
  document.documentElement.dataset.theme = initialTheme;
}

function loadSelection() {
  const saved = readStoredJson(SELECTION_KEY, {}) ?? {};
  const plugin = pluginCatalog.find((entry) => entry.id === saved.pluginId);
  if (!plugin) return {};
  const template = plugin.templates.find((entry) => entry.id === saved.templateId) ?? plugin.templates[0];
  return { pluginId: plugin.id, templateId: template.id };
}

function openExternalUrl(url) {
  if (!url) return;
  if (window.ecoSuiteApi?.openExternal) {
    window.ecoSuiteApi.openExternal(url);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

function loadDraft(pluginId, template) {
  const fallback = cloneValue(template.initialValues ?? {});
  const saved = readStoredJson(storageKey(pluginId, template.id));
  return saved ? { ...fallback, ...saved } : fallback;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState(initialTheme);
  const [selectedPluginId, setSelectedPluginId] = useState(() => {
    const initial = loadSelection();
    const plugin = pluginCatalog.find((p) => p.id === initial.pluginId) ?? pluginCatalog[0];
    return plugin.id;
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => {
    const initial = loadSelection();
    const plugin = pluginCatalog.find((p) => p.id === initial.pluginId) ?? pluginCatalog[0];
    const template =
      plugin.templates.find((t) => t.id === initial.templateId) ?? plugin.templates[0];
    return template.id;
  });
  const [values, setValues] = useState(() => {
    const plugin = pluginCatalog.find((p) => p.id === selectedPluginId) ?? pluginCatalog[0];
    const template =
      plugin.templates.find((t) => t.id === selectedTemplateId) ?? plugin.templates[0];
    return loadDraft(plugin.id, template);
  });
  const [status, setStatus] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [packImportOpen, setPackImportOpen] = useState(false);
  const [library, setLibrary] = useState(() => listLibrary());

  const selectedPlugin =
    pluginCatalog.find((plugin) => plugin.id === selectedPluginId) ?? pluginCatalog[0];
  const activeTemplate =
    selectedPlugin.templates.find((template) => template.id === selectedTemplateId) ??
    selectedPlugin.templates[0];

  useEffect(() => {
    if (!selectedPlugin.templates.some((template) => template.id === selectedTemplateId)) {
      setSelectedTemplateId(selectedPlugin.templates[0].id);
    }
  }, [selectedPlugin, selectedTemplateId]);

  useEffect(() => {
    let cancelled = false;
    loadLibrary()
      .then((entries) => {
        if (!cancelled) {
          setLibrary(entries);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setStatus(`Library load failed: ${error?.message ?? 'unknown error'}`);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const plugin = pluginCatalog.find((entry) => entry.id === selectedPluginId);
    const template = plugin?.templates.find((entry) => entry.id === selectedTemplateId);
    if (plugin && template) {
      setValues(loadDraft(plugin.id, template));
    }
  }, [selectedPluginId, selectedTemplateId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      writeStoredJson(storageKey(selectedPlugin.id, activeTemplate.id), values);
    }, DRAFT_WRITE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [selectedPlugin.id, activeTemplate.id, values]);

  useEffect(() => {
    writeStoredJson(SELECTION_KEY, {
      pluginId: selectedPlugin.id,
      templateId: activeTemplate.id,
    });
  }, [selectedPlugin.id, activeTemplate.id]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeStored(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!status) {
      return undefined;
    }

    const timer = window.setTimeout(() => setStatus(''), 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    function onKey(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const [previewValues, setPreviewValues] = useState(values);
  useEffect(() => {
    const timer = window.setTimeout(() => setPreviewValues(values), YAML_PREVIEW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [values]);

  const yamlText = useMemo(() => {
    const yamlObject = cleanObject(activeTemplate.toConfig(previewValues)) ?? {};
    return dump(yamlObject, {
      noRefs: true,
      lineWidth: 100,
      quotingType: '"',
    });
  }, [activeTemplate, previewValues]);

  const outputPath = activeTemplate.getOutputPath?.(values) ?? 'config.yml';

  const validationIssues = useMemo(
    () => collectValidationIssues(selectedPlugin, activeTemplate, values, library),
    [selectedPlugin, activeTemplate, values, library],
  );

  const { errorCount, warningCount, infoCount } = useMemo(() => {
    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;
    for (const issue of validationIssues) {
      if (issue.severity === 'error') errorCount += 1;
      else if (issue.severity === 'warning') warningCount += 1;
      else if (issue.severity === 'info') infoCount += 1;
    }
    return { errorCount, warningCount, infoCount };
  }, [validationIssues]);

  const filteredPlugins = useMemo(() => {
    const needle = query.toLowerCase();
    return pluginCatalog
      .filter((plugin) => plugin.name.toLowerCase().includes(needle))
      .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }));
  }, [query]);

  const editorMode =
    selectedPlugin.id === 'EcoMenus' && activeTemplate.id === 'menu-config'
      ? 'Visual menu designer'
      : `${activeTemplate.sections.length} editable sections`;

  async function handleCopy() {
    try {
      if (window.ecoSuiteApi?.copyText) {
        await window.ecoSuiteApi.copyText(yamlText);
      } else {
        await navigator.clipboard.writeText(yamlText);
      }

      setStatus('YAML copied to clipboard.');
    } catch {
      setStatus('Copy failed.');
    }
  }

  async function handleExport() {
    if (!window.ecoSuiteApi?.saveYaml) {
      setStatus('Export works inside the desktop window.');
      return;
    }

    try {
      const response = await window.ecoSuiteApi.saveYaml({
        content: yamlText,
        defaultFileName: outputPath.split('/').pop(),
      });

      if (!response?.canceled) {
        setStatus(`Exported ${response.filePath}`);
      }
    } catch (error) {
      setStatus(`Export failed: ${error?.message ?? 'unknown error'}`);
    }
  }

  function resetTemplate() {
    if (!window.confirm('Reset will discard your current edits on this draft. Continue?')) return;
    setValues(cloneValue(activeTemplate.initialValues ?? {}));
    setStatus('Template reset to starter values.');
  }

  async function saveToLibrary() {
    const idField = idFieldFor(selectedPlugin.id, activeTemplate.id);
    const primary = values[idField];
    const entryName =
      (typeof primary === 'string' && primary.trim()) || activeTemplate.id;
    try {
      const entries = await upsertEntry({
        pluginId: selectedPlugin.id,
        templateId: activeTemplate.id,
        name: entryName,
        values: cloneValue(values),
        outputPath,
      });
      setLibrary(entries);
      setStatus(`Saved "${entryName}" to library.`);
    } catch (error) {
      setStatus(`Save failed: ${error?.message ?? 'unknown error'}`);
    }
  }

  function loadFromLibrary(entry) {
    setSelectedPluginId(entry.pluginId);
    setSelectedTemplateId(entry.templateId);
    setValues(cloneValue(entry.values));
    setStatus(`Loaded "${entry.name}".`);
  }

  async function removeFromLibrary(entryId) {
    try {
      setLibrary(await removeEntry(entryId));
    } catch (error) {
      setStatus(`Remove failed: ${error?.message ?? 'unknown error'}`);
    }
  }

  async function commitPackImport(matches) {
    let imported = 0;
    const entriesToSave = [];
    for (const match of matches) {
      if (!match?.values) continue;
      const idField = idFieldFor(match.plugin.id, match.template.id);
      const nextValues = cloneValue(match.values);
      if (!match.matched?.includes(idField) && typeof match.name === 'string' && match.name.trim()) {
        nextValues[idField] = match.name.trim();
      }
      const name =
        (typeof nextValues[idField] === 'string' && nextValues[idField].trim()) ||
        match.name ||
        match.template.id;
      const outputPath = match.template.getOutputPath?.(nextValues) ?? `plugins/${match.plugin.id}/${name}.yml`;
      entriesToSave.push({
        pluginId: match.plugin.id,
        templateId: match.template.id,
        name,
        values: nextValues,
        outputPath,
      });
      imported += 1;
    }

    try {
      setLibrary(await upsertEntries(entriesToSave));
      setStatus(`Imported ${imported} file${imported === 1 ? '' : 's'} into the library.`);
    } catch (error) {
      setStatus(`Import failed: ${error?.message ?? 'unknown error'}`);
      throw error;
    }
  }

  async function duplicateLibraryEntry(entry) {
    const suggested = `${entry.name}_copy`;
    const nextName = window.prompt(`New name for the duplicate of "${entry.name}"?`, suggested);
    if (!nextName || !nextName.trim()) return;
    const field = idFieldFor(entry.pluginId, entry.templateId);
    const nextValues = cloneValue(entry.values);
    if (field in nextValues) {
      nextValues[field] = nextName.trim();
    }
    try {
      setLibrary(await upsertEntry({
        pluginId: entry.pluginId,
        templateId: entry.templateId,
        name: nextName.trim(),
        values: nextValues,
        outputPath: entry.outputPath,
      }));
      setStatus(`Duplicated as "${nextName.trim()}".`);
    } catch (error) {
      setStatus(`Duplicate failed: ${error?.message ?? 'unknown error'}`);
    }
  }

  async function exportPack() {
    if (library.length === 0) {
      setStatus('Library is empty.');
      return;
    }

    let totalErrors = 0;
    let totalWarnings = 0;
    let totalInfo = 0;
    const entrySummaries = [];

    const files = [];
    for (const entry of library) {
      const plugin = pluginCatalog.find((p) => p.id === entry.pluginId);
      const template = plugin?.templates.find((t) => t.id === entry.templateId);
      if (!plugin || !template) continue;

      const issues = collectValidationIssues(plugin, template, entry.values ?? {}, library);
      const errors = issues.filter((i) => i.severity === 'error').length;
      const warnings = issues.filter((i) => i.severity === 'warning').length;
      const info = issues.filter((i) => i.severity === 'info').length;
      totalErrors += errors;
      totalWarnings += warnings;
      totalInfo += info;

      if (errors > 0 || warnings > 0) {
        entrySummaries.push(`${entry.name} (${entry.pluginId} ${entry.templateId}): ${errors} errors, ${warnings} warnings`);
      }

      const yamlObject = cleanObject(template.toConfig(entry.values)) ?? {};
      const yamlBody = dump(yamlObject, { noRefs: true, lineWidth: 100, quotingType: '"' });
      const path = entry.outputPath ?? template.getOutputPath?.(entry.values) ?? `plugins/${plugin.id}/${entry.name}.yml`;
      files.push({ path, content: yamlBody });
    }

    if (files.length === 0) {
      setStatus('Nothing to export.');
      return;
    }

    if (totalErrors > 0 || totalWarnings > 0) {
      const preview = entrySummaries.slice(0, 10).join('\n');
      const more = entrySummaries.length > 10 ? `\n(+${entrySummaries.length - 10} more)` : '';
      const go = window.confirm(
        `Pack summary: ${files.length} files, ${totalErrors} errors, ${totalWarnings} warnings, ${totalInfo} notes.\n\n${preview}${more}\n\nExport anyway?`,
      );
      if (!go) {
        setStatus('Export cancelled.');
        return;
      }
    }

    if (!window.ecoSuiteApi?.exportPack) {
      setStatus('Pack export only works inside the desktop window.');
      return;
    }

    try {
      const response = await window.ecoSuiteApi.exportPack({ files });
      if (response?.canceled) return;
      const writtenCount = response?.written?.length ?? 0;
      const failedCount = response?.failed?.length ?? 0;
      setStatus(
        failedCount > 0
          ? `Exported ${writtenCount} files, ${failedCount} failed. Saved to ${response.directory}.`
          : `Exported ${writtenCount} files to ${response.directory}.`,
      );
    } catch (error) {
      setStatus(`Pack export failed: ${error?.message ?? 'unknown error'}`);
    }
  }

  function handleGenerate() {
    if (!window.confirm('Generate will replace every field with random starter values. Continue?')) return;
    const generated = generateValues(activeTemplate.id);
    if (generated) {
      setValues(generated);
      setStatus('Random config generated.');
    } else {
      setStatus('No generator available for this template.');
    }
  }

  return (
    <div
      className={`app-shell theme-${theme}`}
      style={{
        '--accent': selectedPlugin.accent,
        '--accent-soft': `${selectedPlugin.accent}24`,
        '--accent-strong': `${selectedPlugin.accent}55`,
      }}
    >
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">E</div>
          <span className="sidebar-title">EcoSuite</span>
          <button
            type="button"
            className={`theme-toggle ${theme}`}
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="theme-toggle-track">
              <span className="theme-toggle-side sun">
                <ThemeGlyph kind="sun" />
              </span>
              <span className="theme-toggle-side moon">
                <ThemeGlyph kind="moon" />
              </span>
              <span className="theme-toggle-thumb">
                <ThemeGlyph kind={theme === 'dark' ? 'moon' : 'sun'} />
              </span>
            </span>
          </button>
        </div>

        <label className="search-shell">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search plugins…" />
        </label>

        <div className="sidebar-caption">
          <span>Plugins</span>
          <strong>{filteredPlugins.length}</strong>
        </div>

        <div className="plugin-list sidebar-plugin-list">
          {filteredPlugins.length === 0 ? <div className="empty-state compact">No plugins match.</div> : null}
          {filteredPlugins.map((plugin) => (
            <button
              key={plugin.id}
              type="button"
              className={`plugin-button ${plugin.id === selectedPlugin.id ? 'active' : ''}`}
              onClick={() => setSelectedPluginId(plugin.id)}
            >
              <span className="plugin-button-name">{plugin.name}</span>
            </button>
          ))}
        </div>

        <LibraryPanel
          entries={library}
          onLoad={loadFromLibrary}
          onRemove={removeFromLibrary}
          onDuplicate={duplicateLibraryEntry}
          onExportPack={exportPack}
          onImportPack={() => setPackImportOpen(true)}
        />
      </aside>

      <main className="main-panel">
        <section className="workspace-header">
          <span className="toolbar-plugin-name">{selectedPlugin.name}</span>
          <span className="toolbar-tag tag-template">{activeTemplate.name}</span>
          {errorCount > 0 ? (
            <span className="toolbar-tag tag-error">⚠ {errorCount} {errorCount === 1 ? 'error' : 'errors'}</span>
          ) : null}
          {warningCount > 0 && errorCount === 0 ? (
            <span className="toolbar-tag tag-warn">{warningCount} {warningCount === 1 ? 'warning' : 'warnings'}</span>
          ) : null}
          <div className="toolbar-spacer" />
          <div className="toolbar-actions">
            {selectedPlugin.templates.length > 1 ? (
              <>
                <select
                  className="toolbar-template-select"
                  value={activeTemplate.id}
                  onChange={(event) => setSelectedTemplateId(event.target.value)}
                >
                  {selectedPlugin.templates.map((template) => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
                <div className="toolbar-sep" />
              </>
            ) : null}
            {getPluginDocsUrl(selectedPlugin.id) ? (
              <button type="button" className="ghost-button" onClick={() => openExternalUrl(getPluginDocsUrl(selectedPlugin.id))}>Docs ↗</button>
            ) : null}
            {getPluginSourceUrl(selectedPlugin.id) ? (
              <button type="button" className="ghost-button" onClick={() => openExternalUrl(getPluginSourceUrl(selectedPlugin.id))}>Source ↗</button>
            ) : null}
            {(getPluginDocsUrl(selectedPlugin.id) || getPluginSourceUrl(selectedPlugin.id)) ? (
              <div className="toolbar-sep" />
            ) : null}
            <button type="button" className="secondary-button" onClick={() => setImportOpen(true)}>Import YAML</button>
            <button type="button" className="secondary-button" onClick={handleGenerate}>Generate</button>
            <button type="button" className="secondary-button" onClick={resetTemplate}>Reset</button>
            <div className="toolbar-sep" />
            <button type="button" className="ghost-button" onClick={handleCopy}>Copy</button>
            <button type="button" className="ghost-button" onClick={handleExport}>Export</button>
            <div className="toolbar-sep" />
            <button type="button" className="primary-button" onClick={saveToLibrary}>Save</button>
          </div>
        </section>

        <section className="workspace">
          <section className="workspace-surface editor-surface">
            <div className="panel-heading">
              <h3>Editor</h3>
              <p className="panel-kicker">{editorMode}</p>
            </div>
            {selectedPlugin.id === 'EcoMenus' && activeTemplate.id === 'menu-config' ? (
              <EcoMenusDesigner values={values} setValues={setValues} />
            ) : (
              <div className="workspace-sections">
                {activeTemplate.sections.map((section) => (
                  <section className="workspace-section" key={section.title}>
                    <div className="section-heading compact-heading">
                      <h3>{section.title}</h3>
                    </div>
                    <div className="field-grid">
                      {section.fields.map((field) => (
                        <FieldShell field={field} key={field.key} error={getFieldError(field.key, values[field.key])}>
                          <FieldRenderer
                            field={field}
                            value={values[field.key]}
                            onChange={(nextValue) =>
                              setValues((current) =>
                                current[field.key] === nextValue
                                  ? current
                                  : { ...current, [field.key]: nextValue },
                              )
                            }
                          />
                        </FieldShell>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </section>

          <aside className="workspace-surface inspector-surface">
            <div className="panel-heading">
              <h3>Preview</h3>
              <div className="inspector-summary">
                {errorCount > 0 ? (
                  <span className="pill error">{errorCount} {errorCount === 1 ? 'error' : 'errors'}</span>
                ) : null}
                {warningCount > 0 ? (
                  <span className="pill warning">{warningCount} {warningCount === 1 ? 'warning' : 'warnings'}</span>
                ) : null}
                {infoCount > 0 ? (
                  <span className="pill info">{infoCount} {infoCount === 1 ? 'note' : 'notes'}</span>
                ) : null}
                {errorCount === 0 && warningCount === 0 && infoCount === 0 ? (
                  <span className="pill ok">valid</span>
                ) : null}
              </div>
            </div>

            <div className="inspector-body">
              <section className="inspector-section">
                <div className="yaml-preview-shell">
                  {validationIssues.length > 0 ? (
                    <div className="yaml-preview-overlay">
                      <div className="yaml-preview-overlay-header">
                        <strong>Checks</strong>
                        <span>
                          {errorCount} errors, {warningCount} warnings{infoCount > 0 ? `, ${infoCount} notes` : ''}
                        </span>
                      </div>
                      <ul className="validation-list">
                        {validationIssues.map((issue, index) => (
                          <li key={`${issue.message}-${index}`} className={`validation-item ${issue.severity}`}>
                            <span className="validation-badge">{issue.severity}</span>
                            <span>{issue.message}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <pre className="yaml-preview">{yamlText}</pre>
                </div>
              </section>
            </div>
          </aside>
        </section>
      </main>
      {status ? <div className="toast">{status}</div> : null}
      <div className="status-bar">
        <div className="status-left">
          <div className={`status-indicator ${errorCount > 0 ? 'error' : warningCount > 0 ? 'warn' : 'ok'}`} />
          <span className="status-crumb">
            <span>{selectedPlugin.name}</span>
            <span className="sep">·</span>
            <span>{activeTemplate.name}</span>
            {errorCount > 0 ? (
              <span className="status-error-pill">{errorCount} {errorCount === 1 ? 'error' : 'errors'}</span>
            ) : null}
          </span>
          {status ? (
            <>
              <span className="status-sep-pipe">|</span>
              <span className="status-msg">{status}</span>
            </>
          ) : null}
        </div>
        <div className="status-right">EcoSuite Builder v1.3.0</div>
      </div>
      <CommandPalette
        plugins={pluginCatalog}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelect={(item) => {
          setSelectedPluginId(item.pluginId);
          setSelectedTemplateId(item.templateId);
        }}
      />
      <YamlImportModal
        open={importOpen}
        template={activeTemplate}
        onClose={() => setImportOpen(false)}
        onImport={(nextValues) => {
          setValues(nextValues);
          setStatus('Imported YAML into the form.');
        }}
      />
      <PackImportModal
        open={packImportOpen}
        onClose={() => setPackImportOpen(false)}
        onCommit={commitPackImport}
      />
    </div>
  );
}
