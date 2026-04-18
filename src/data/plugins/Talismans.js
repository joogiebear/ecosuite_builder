import {
  buildConditions,
  buildEffects,
  csvToArray,
  deriveFileName,
  linesToArray,
} from '../../lib/schema.js';
import { conditionField, effectField } from '../_helpers.js';

const plugin = {
    id: 'Talismans',
    name: 'Talismans',
    group: 'Items and Equipment',
    accent: '#557b58',
    requires: ['eco'],
    uses: ['libreforge'],
    description: 'Create talismans with passive effects, hierarchy rules, crafting, and item presentation.',
    reference: [
      'Talismans are simple compared with EcoItems: one item string, optional hierarchy, and shared effect logic.',
      'This builder is a fast way to author passive charm-style items.',
    ],
    templates: [
      {
        id: 'talisman-config',
        name: 'Talisman',
        description: 'Generate a talisman file for `plugins/Talismans/talismans/`.',
        getOutputPath: (values) => `plugins/Talismans/talismans/${deriveFileName(values, 'talisman')}`,
        initialValues: {
          id: 'archery_1',
          name: '&aExample Talisman I',
          description: '&8Deal 10% more damage with bows',
          higherLevelOf: '',
          item: 'player_head texture:paste_texture_here',
          craftable: true,
          recipePermission: '',
          shapeless: false,
          recipe: 'bow\ncrossbow\nbow\n\necoitems:talisman_core_1 ? ender_eye\n\nbow\ncrossbow\nbow',
          effects: [],
          conditions: [],
        },
        sections: [
          {
            title: 'Talisman shell',
            fields: [
              { key: 'id', label: 'Talisman ID', type: 'text', width: 'half' },
              { key: 'name', label: 'Display name', type: 'text', width: 'half' },
              { key: 'description', label: 'Description', type: 'multiline-list', width: 'half' },
              { key: 'higherLevelOf', label: 'Higher-level-of IDs', type: 'text', width: 'half' },
              { key: 'item', label: 'Item', type: 'text', width: 'full' },
            ],
          },
          {
            title: 'Crafting and logic',
            fields: [
              { key: 'craftable', label: 'Craftable', type: 'switch', width: 'half' },
              { key: 'shapeless', label: 'Shapeless recipe', type: 'switch', width: 'half' },
              { key: 'recipePermission', label: 'Recipe permission', type: 'text', width: 'full' },
              { key: 'recipe', label: 'Recipe grid', type: 'multiline-list', width: 'full', preserveEmpty: true },
              effectField(),
              conditionField(),
            ],
          },
        ],
        toConfig: (values) => ({
          name: values.name,
          description: linesToArray(values.description),
          higherLevelOf: csvToArray(values.higherLevelOf),
          item: values.item,
          craftable: values.craftable,
          'recipe-permission': values.craftable ? values.recipePermission : undefined,
          shapeless: values.shapeless,
          recipe: values.craftable ? linesToArray(values.recipe, { preserveEmpty: true }) : undefined,
          effects: buildEffects(values.effects),
          conditions: buildConditions(values.conditions),
        }),
      },
    ],
  };

export default plugin;
