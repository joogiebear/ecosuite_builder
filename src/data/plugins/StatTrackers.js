import {
  csvToArray,
  deriveFileName,
  linesToArray,
} from '../../lib/schema.js';
import { buildXpMethods, xpMethodsField } from '../_helpers.js';

const plugin = {
    id: 'StatTrackers',
    name: 'StatTrackers',
    group: 'Economy and Utility',
    accent: '#76584b',
    requires: ['eco'],
    uses: [],
    description: 'Create tracker items that count combat or gameplay events and write the stat into item lore.',
    reference: [
      'Trackers are small but powerful: a display format, applicable targets, counters, and the physical tracker item.',
      'This builder optimizes the common workflow of creating a tracker for a weapon group.',
    ],
    templates: [
      {
        id: 'tracker-config',
        name: 'Stat tracker',
        description: 'Generate a tracker file for `plugins/StatTrackers/stats/`.',
        getOutputPath: (values) => `plugins/StatTrackers/stats/${deriveFileName(values, 'tracker')}`,
        initialValues: {
          id: 'damage_dealt',
          display: '&bDamage Dealt: %value%',
          applicableTo: 'sword,bow,trident,axe',
          counters: [
            { trigger: 'melee_attack', multiplier: '1', filtersText: '' },
            { trigger: 'bow_attack', multiplier: '1', filtersText: '' },
          ],
          trackerItem: 'compass max_stack_size:1',
          trackerName: '&eTracker - Damage Dealt',
          trackerLore: '&8Drop this onto an item\n&8to display the amount of damage dealt',
          craftable: true,
          recipe: 'iron_sword\niron_sword\niron_sword\niron_sword\ncompass\niron_sword\niron_sword\niron_sword\niron_sword',
        },
        sections: [
          {
            title: 'Tracker shell',
            fields: [
              { key: 'id', label: 'Tracker ID', type: 'text', width: 'half' },
              { key: 'display', label: 'Display format', type: 'text', width: 'half' },
              { key: 'applicableTo', label: 'Applicable targets', type: 'text', width: 'full' },
            ],
          },
          {
            title: 'Counters',
            fields: [xpMethodsField('counters', 'Counters', 'Add counter')],
          },
          {
            title: 'Tracker item',
            fields: [
              { key: 'trackerItem', label: 'Tracker item', type: 'text', width: 'half' },
              { key: 'trackerName', label: 'Tracker name', type: 'text', width: 'half' },
              { key: 'trackerLore', label: 'Tracker lore', type: 'multiline-list', width: 'full' },
              { key: 'craftable', label: 'Craftable', type: 'switch', width: 'half' },
              { key: 'recipe', label: 'Recipe grid', type: 'multiline-list', width: 'half', preserveEmpty: true },
            ],
          },
        ],
        toConfig: (values) => ({
          display: values.display,
          'applicable-to': csvToArray(values.applicableTo),
          counters: buildXpMethods(values.counters),
          tracker: {
            item: values.trackerItem,
            name: values.trackerName,
            lore: linesToArray(values.trackerLore),
            craftable: values.craftable,
            recipe: linesToArray(values.recipe, { preserveEmpty: true }),
          },
        }),
      },
    ],
  };

export default plugin;
