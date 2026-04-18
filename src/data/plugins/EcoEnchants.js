import {
  buildConditions,
  buildEffects,
  buildPlaceholderMap,
  csvToArray,
  deriveFileName,
} from '../../lib/schema.js';
import { conditionField, effectField } from '../_helpers.js';

const plugin = {
    id: 'EcoEnchants',
    name: 'EcoEnchants',
    group: 'Items and Equipment',
    accent: '#365b8c',
    requires: ['eco'],
    uses: ['libreforge'],
    description: 'Create custom enchantments with rarity, targets, conflicts, placeholders, and effect logic.',
    reference: [
      'Enchantments are one of the cleanest examples of Auxilor config design: metadata at the top, effects at the bottom.',
      'Most balancing changes happen through `max-level`, placeholders, and libreforge effects.',
    ],
    templates: [
      {
        id: 'enchant-config',
        name: 'Enchantment',
        description: 'Build an enchant starter for `plugins/EcoEnchants/enchants/`.',
        getOutputPath: (values) => `plugins/EcoEnchants/enchants/${deriveFileName(values, 'enchant')}`,
        initialValues: {
          id: 'razor',
          displayName: 'Razor',
          description: 'Deal extra damage based on level',
          placeholder: '%level% * 20',
          extraPlaceholders: [],
          type: 'normal',
          targets: 'sword',
          conflicts: 'sharpness',
          required: '',
          rarity: 'common',
          maxLevel: 4,
          tradeable: true,
          discoverable: true,
          enchantable: true,
          effects: [],
          conditions: [],
        },
        sections: [
          {
            title: 'Metadata',
            fields: [
              { key: 'id', label: 'Enchant ID', type: 'text', width: 'half' },
              { key: 'displayName', label: 'Display name', type: 'text', width: 'half' },
              { key: 'description', label: 'Description', type: 'text', width: 'half' },
              { key: 'placeholder', label: 'Primary placeholder', type: 'text', width: 'half', help: 'Referenced as %placeholder% in the description.' },
              { key: 'type', label: 'Type', type: 'text', width: 'half' },
              { key: 'rarity', label: 'Rarity', type: 'text', width: 'half' },
              { key: 'maxLevel', label: 'Max level', type: 'number', width: 'half' },
              { key: 'targets', label: 'Targets', type: 'text', width: 'half' },
              { key: 'conflicts', label: 'Conflicts', type: 'text', width: 'half' },
              { key: 'required', label: 'Required enchants', type: 'text', width: 'half' },
            ],
          },
          {
            title: 'Extra placeholders',
            fields: [
              {
                key: 'extraPlaceholders',
                label: 'Extra placeholders',
                type: 'collection',
                width: 'full',
                addLabel: 'Add placeholder',
                help: 'Used inside the description with %id%.',
                fields: [
                  { key: 'id', label: 'ID', type: 'text', width: 'half' },
                  { key: 'value', label: 'Expression', type: 'text', width: 'half', placeholder: '%level% * 2' },
                ],
              },
            ],
          },
          {
            title: 'Acquisition',
            fields: [
              { key: 'tradeable', label: 'Tradeable', type: 'switch', width: 'half' },
              { key: 'discoverable', label: 'Discoverable', type: 'switch', width: 'half' },
              { key: 'enchantable', label: 'Enchantable', type: 'switch', width: 'half' },
            ],
          },
          {
            title: 'Logic',
            fields: [effectField(), conditionField()],
          },
        ],
        toConfig: (values) => ({
          'display-name': values.displayName,
          description: values.description,
          placeholder: values.placeholder,
          placeholders: buildPlaceholderMap(values.extraPlaceholders),
          type: values.type,
          targets: csvToArray(values.targets),
          conflicts: csvToArray(values.conflicts),
          required: csvToArray(values.required),
          rarity: values.rarity,
          'max-level': Number(values.maxLevel),
          tradeable: values.tradeable,
          discoverable: values.discoverable,
          enchantable: values.enchantable,
          effects: buildEffects(values.effects),
          conditions: buildConditions(values.conditions),
        }),
      },
    ],
  };

export default plugin;
