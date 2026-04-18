import { pluginCatalog } from '../data/catalog.js';

function stripLeadingPlugins(path) {
  return String(path ?? '').replace(/^plugins\//, '');
}

function dirOf(path) {
  const normalized = String(path ?? '').replace(/\\/g, '/');
  const idx = normalized.lastIndexOf('/');
  return idx >= 0 ? normalized.slice(0, idx) : '';
}

function basenameWithoutExt(path) {
  const normalized = String(path ?? '').replace(/\\/g, '/');
  const base = normalized.split('/').pop() ?? '';
  return base.replace(/\.ya?ml$/i, '');
}

let RESOLVER = null;

function buildResolver() {
  const byDir = new Map();
  const pluginFolders = new Map();

  for (const plugin of pluginCatalog) {
    for (const template of plugin.templates) {
      const getter = template.getOutputPath;
      if (typeof getter !== 'function') continue;
      let sample;
      try {
        sample = getter(template.initialValues ?? {});
      } catch {
        continue;
      }
      if (!sample) continue;
      const normalized = stripLeadingPlugins(String(sample).replace(/\\/g, '/'));
      const dir = dirOf(normalized);
      if (!dir) continue;

      const key = dir.toLowerCase();
      // First template registered for a dir wins; list alternatives for diagnostics.
      if (!byDir.has(key)) {
        byDir.set(key, { plugin, template, pattern: dir });
      }

      // Track plugin folder names so we can detect "unknown template in known plugin" files.
      const folder = dir.split('/')[0];
      if (folder && !pluginFolders.has(folder.toLowerCase())) {
        pluginFolders.set(folder.toLowerCase(), plugin);
      }
    }
  }

  return { byDir, pluginFolders };
}

function getResolver() {
  if (!RESOLVER) RESOLVER = buildResolver();
  return RESOLVER;
}

export function resolveTemplateForPath(relativePath) {
  const normalized = stripLeadingPlugins(String(relativePath ?? '').replace(/\\/g, '/'));
  const fileDir = dirOf(normalized);
  const id = basenameWithoutExt(normalized);

  const { byDir, pluginFolders } = getResolver();

  const direct = byDir.get(fileDir.toLowerCase());
  if (direct) {
    return { status: 'matched', plugin: direct.plugin, template: direct.template, name: id };
  }

  // Walk up the directory so user-created sub-folders still match the nearest registered parent.
  let cursor = fileDir;
  while (cursor.includes('/')) {
    cursor = cursor.slice(0, cursor.lastIndexOf('/'));
    const match = byDir.get(cursor.toLowerCase());
    if (match) {
      return { status: 'matched', plugin: match.plugin, template: match.template, name: id };
    }
  }

  const folder = fileDir.split('/')[0];
  if (folder && pluginFolders.has(folder.toLowerCase())) {
    const plugin = pluginFolders.get(folder.toLowerCase());
    const base = basenameWithoutExt(normalized);
    if (base === 'config') {
      const configTemplate = plugin.templates.find(
        (template) => template.id === 'eco-core-config' || template.id === 'currency-config',
      );
      if (configTemplate) {
        return { status: 'matched', plugin, template: configTemplate, name: id };
      }
    }
    return { status: 'unknown-template', plugin, name: id, dir: fileDir };
  }

  return { status: 'unknown-plugin', name: id, dir: fileDir };
}
