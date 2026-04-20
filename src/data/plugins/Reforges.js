import {
  buildConditions,
  buildEffects,
  csvToArray,
  deriveFileName,
  linesToArray,
} from '../../lib/schema.js';
import { buildPrice, conditionField, effectField } from '../_helpers.js';

const plugin = {
    id: 'Reforges',
    name: 'Reforges',
    group: 'Items and Equipment',
    accent: '#706f2d',
    requires: ['eco'],
    uses: ['libreforge'],
    description: 'Create reforges with target groups, optional stones, price overrides, and effect payloads.',
    reference: [
      'Reforges are essentially targeted effect holders with optional application items and pricing.',
      'This builder keeps the main gameplay path visible: name, targets, stone, effects, and conditions.',
    ],
    templates: [
      {
        id: 'reforge-config',
        name: 'Reforge',
        description: 'Generate a reforge file for `plugins/Reforges/reforges/`.',
        getOutputPath: (values) => `plugins/Reforges/reforges/${deriveFileName(values, 'reforge')}`,
        initialValues: {
          id: 'dynamic',
          name: '<gradient:#AAFFA9>Dynamic</gradient:#11FFBD>',
          description: '&a+5% &fDamage\n&a+10% &fCrit Damage',
          targets: 'melee',
          stoneEnabled: true,
          stoneItem: 'player_head texture:paste_texture_here',
          stoneName: '<gradient:#AAFFA9>Dynamic</gradient:#11FFBD>&f Reforge Stone',
          stoneLore: '&7Place on the right of the\n&7reforge menu to apply it',
          stoneCraftable: false,
          stoneShapeless: false,
          stoneRecipePermission: '',
          stoneRecipe: '',
          priceValue: 100000,
          priceType: 'coins',
          priceDisplay: '&6$%value%',
          effects: [],
          conditions: [],
          onReforgeEffects: [],
        },
        sections: [
          {
            title: 'Reforge shell',
            fields: [
              { key: 'id', label: 'Reforge ID', type: 'text', width: 'half' },
              { key: 'name', label: 'Display name', type: 'text', width: 'half' },
              { key: 'description', label: 'Lore lines', type: 'multiline-list', width: 'half' },
              { key: 'targets', label: 'Targets', type: 'text', width: 'half' },
            ],
          },
          {
            title: 'Stone and pricing',
            fields: [
              { key: 'stoneEnabled', label: 'Require reforge stone', type: 'switch', width: 'half' },
              { key: 'stoneItem', label: 'Stone item', type: 'text', width: 'full' },
              { key: 'stoneName', label: 'Stone name', type: 'text', width: 'half' },
              { key: 'stoneLore', label: 'Stone lore', type: 'multiline-list', width: 'half' },
              { key: 'stoneCraftable', label: 'Stone craftable', type: 'switch', width: 'half' },
              { key: 'stoneShapeless', label: 'Shapeless recipe', type: 'switch', width: 'half' },
              { key: 'stoneRecipePermission', label: 'Recipe permission', type: 'text', width: 'half', placeholder: 'ecoitems.reforge_stone_recipe' },
              { key: 'stoneRecipe', label: 'Recipe grid', type: 'recipe-grid', width: 'full' },
              { key: 'priceValue', label: 'Price override', type: 'number', width: 'half' },
              { key: 'priceType', label: 'Price type', type: 'text', width: 'half' },
              { key: 'priceDisplay', label: 'Price display', type: 'text', width: 'full' },
            ],
          },
          {
            title: 'Logic',
            fields: [
              effectField(),
              conditionField(),
              effectField('onReforgeEffects', 'On-reforge effects'),
            ],
          },
        ],
        toConfig: (values) => ({
          name: values.name,
          description: linesToArray(values.description),
          targets: csvToArray(values.targets),
          stone: {
            enabled: values.stoneEnabled,
            name: values.stoneName,
            lore: linesToArray(values.stoneLore),
            item: values.stoneItem,
            craftable: values.stoneCraftable,
            'recipe-permission': values.stoneRecipePermission,
            shapeless: values.stoneShapeless,
            recipe: values.stoneCraftable ? linesToArray(values.stoneRecipe, { preserveEmpty: true }) : undefined,
            price: buildPrice(values.priceValue, values.priceType, values.priceDisplay),
          },
          effects: buildEffects(values.effects),
          conditions: buildConditions(values.conditions),
          'on-reforge-effects': buildEffects(values.onReforgeEffects),
        }),
      },
    ],
  };

export default plugin;
