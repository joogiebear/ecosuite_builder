import { dump } from 'js-yaml';
import { pluginCatalog } from '../src/data/catalog.js';
import { cleanObject } from '../src/lib/schema.js';
import { parseYamlDraft } from '../src/lib/fromConfig.js';

const failures = [];
let pluginCount = 0;
let templateCount = 0;
let roundTripOk = 0;

for (const plugin of pluginCatalog) {
  pluginCount += 1;

  for (const template of plugin.templates ?? []) {
    templateCount += 1;

    try {
      const values = structuredClone(template.initialValues ?? {});
      const config = cleanObject(template.toConfig(values)) ?? {};

      const yamlText = dump(config, {
        noRefs: true,
        lineWidth: 100,
        quotingType: '"',
      });

      const parsed = parseYamlDraft(yamlText, template.initialValues ?? {});
      if (!parsed || !parsed.values) {
        throw new Error('parseYamlDraft returned no values');
      }
      roundTripOk += 1;
    } catch (error) {
      failures.push({
        pluginId: plugin.id,
        templateId: template.id,
        message: error instanceof Error ? error.stack ?? error.message : String(error),
      });
    }
  }
}

const summary = {
  pluginCount,
  templateCount,
  roundTripOk,
  failureCount: failures.length,
};

console.log(JSON.stringify(summary, null, 2));

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAIL ${failure.pluginId}/${failure.templateId}`);
    console.error(failure.message);
  }

  process.exitCode = 1;
}
