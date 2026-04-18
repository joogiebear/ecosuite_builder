import {
  buildConditions,
  buildEffects,
  deriveFileName,
} from '../../lib/schema.js';
import { conditionField, effectField } from '../_helpers.js';

const plugin = {
    id: 'Actions',
    name: 'Actions',
    group: 'Core Systems',
    accent: '#866245',
    requires: ['eco'],
    uses: ['libreforge'],
    description: 'A thin wrapper for stand-alone effect files. Good for globally triggered logic snippets that are easier to manage outside another plugin.',
    reference: [
      'Action files are very small: enabled flag, effects, and conditions.',
      'Treat this as a global effect script library for your server.',
    ],
    templates: [
      {
        id: 'action-file',
        name: 'Action file',
        description: 'Generate a stand-alone action config for `plugins/Actions/actions/`.',
        getOutputPath: (values) => `plugins/Actions/actions/${deriveFileName(values, 'action')}`,
        initialValues: {
          id: 'coins_on_kill',
          enabled: true,
          effects: [],
          conditions: [],
        },
        sections: [
          {
            title: 'Basics',
            fields: [
              { key: 'id', label: 'Action ID', type: 'text', width: 'half' },
              { key: 'enabled', label: 'Enabled', type: 'switch', width: 'half' },
            ],
          },
          {
            title: 'Logic',
            fields: [effectField(), conditionField()],
          },
        ],
        toConfig: (values) => ({
          enabled: values.enabled,
          effects: buildEffects(values.effects),
          conditions: buildConditions(values.conditions),
        }),
      },
    ],
  };

export default plugin;
