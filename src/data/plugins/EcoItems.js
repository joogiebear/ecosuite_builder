import {
  buildConditions,
  buildEffects,
  csvToArray,
  deriveFileName,
  linesToArray,
} from '../../lib/schema.js';
import { conditionField, effectField } from '../_helpers.js';

const plugin = {
    id: 'EcoItems',
    name: 'EcoItems',
    group: 'Items and Equipment',
    accent: '#9a4f3d',
    requires: ['eco'],
    uses: ['libreforge'],
    description: 'Build custom items with item lookup syntax, slots, combat stats, rarity, and effects.',
    reference: [
      'EcoItems wraps a physical item declaration around shared effect logic.',
      'Slot selection is important because it decides when the item is considered active.',
    ],
    templates: [
      {
        id: 'custom-item',
        name: 'Custom item',
        description: 'Create an item file with item metadata, recipe placeholders, and effect hooks.',
        getOutputPath: (values) => `plugins/EcoItems/items/${deriveFileName(values, 'item')}`,
        initialValues: {
          id: 'mithril_sword',
          baseItem: 'iron_sword hide_attributes',
          displayName: '<g:#f953c6>Mithril Sword</g:#b91d73>',
          lore: '&7Damage: &c12❤\n&7Attack Speed: &c1.5',
          craftable: true,
          shapeless: false,
          recipeGiveAmount: 1,
          craftingPermission: '',
          recipe: 'ecoitems:mithril 2\n\n\necoitems:mithril 2\n\n\nstick',
          slot: 'mainhand',
          baseDamage: 12,
          baseAttackSpeed: 1.5,
          rarity: 'rare',
          effects: [],
          conditions: [],
        },
        sections: [
          {
            title: 'Item shell',
            fields: [
              { key: 'id', label: 'Item ID', type: 'text', width: 'half' },
              { key: 'baseItem', label: 'Item lookup string', type: 'text', width: 'half' },
              { key: 'displayName', label: 'Display name', type: 'text', width: 'half' },
              { key: 'slot', label: 'Active slot', type: 'text', width: 'half', help: 'mainhand, offhand, hands, helmet, chestplate, leggings, boots, armor, any, or a numeric slot.' },
              { key: 'lore', label: 'Lore', type: 'multiline-list', width: 'full' },
              { key: 'baseDamage', label: 'Base damage', type: 'number', width: 'half' },
              { key: 'baseAttackSpeed', label: 'Base attack speed', type: 'number', width: 'half' },
              { key: 'rarity', label: 'Rarity', type: 'text', width: 'half' },
            ],
          },
          {
            title: 'Recipe',
            fields: [
              { key: 'craftable', label: 'Craftable', type: 'switch', width: 'half' },
              { key: 'shapeless', label: 'Shapeless recipe', type: 'switch', width: 'half' },
              { key: 'recipeGiveAmount', label: 'Give amount per craft', type: 'number', width: 'half' },
              { key: 'craftingPermission', label: 'Crafting permission', type: 'text', width: 'full' },
              { key: 'recipe', label: 'Recipe grid', type: 'multiline-list', width: 'full', preserveEmpty: true, help: 'Use nine lines. Empty lines are preserved so shaped recipes stay aligned.' },
            ],
          },
          {
            title: 'Logic',
            fields: [effectField(), conditionField()],
          },
        ],
        toConfig: (values) => ({
          item: {
            item: values.baseItem,
            'display-name': values.displayName,
            lore: linesToArray(values.lore),
            craftable: values.craftable,
            'recipe-give-amount': values.craftable && values.recipeGiveAmount
              ? Number(values.recipeGiveAmount)
              : undefined,
            'crafting-permission': values.craftable ? values.craftingPermission : undefined,
            shapeless: values.shapeless,
            recipe: values.craftable ? linesToArray(values.recipe, { preserveEmpty: true }) : undefined,
          },
          slot: values.slot,
          'base-damage': Number(values.baseDamage),
          'base-attack-speed': Number(values.baseAttackSpeed),
          rarity: values.rarity,
          effects: buildEffects(values.effects),
          conditions: buildConditions(values.conditions),
        }),
      },
      {
        id: 'item-rarity',
        name: 'Item rarity',
        description: 'Generate a rarity file for `plugins/EcoItems/rarities/`. Referenced by items via the rarity field.',
        getOutputPath: (values) => `plugins/EcoItems/rarities/${deriveFileName(values, 'rarity')}`,
        initialValues: {
          id: 'common',
          lore: '&a&lCOMMON',
          weight: 1,
          items: '',
        },
        sections: [
          {
            title: 'Rarity shell',
            fields: [
              { key: 'id', label: 'Rarity ID', type: 'text', width: 'half' },
              { key: 'weight', label: 'Weight', type: 'number', width: 'half', help: 'Higher weight wins if an item matches multiple rarities.' },
              { key: 'lore', label: 'Applied lore', type: 'multiline-list', width: 'full' },
              { key: 'items', label: 'Vanilla item IDs', type: 'text', width: 'full', help: 'Comma-separated. EcoItems items should set rarity in their own file instead.' },
            ],
          },
        ],
        toConfig: (values) => ({
          lore: linesToArray(values.lore),
          weight: Number(values.weight),
          items: csvToArray(values.items),
        }),
      },
      {
        id: 'item-recipe',
        name: 'Standalone recipe',
        description: 'Generate a standalone crafting recipe for `plugins/EcoItems/recipes/`.',
        getOutputPath: (values) => `plugins/EcoItems/recipes/${deriveFileName(values, 'recipe')}`,
        initialValues: {
          id: 'enchanted_emerald_block',
          result: 'ecoitems:enchanted_emerald 9',
          permission: '',
          shapeless: false,
          recipe: '\nemerald_block 32\n\nemerald_block 32\nemerald_block 32\nemerald_block 32\n\nemerald_block 32\n',
        },
        sections: [
          {
            title: 'Recipe',
            fields: [
              { key: 'id', label: 'Recipe ID', type: 'text', width: 'half' },
              { key: 'result', label: 'Result item', type: 'text', width: 'half', help: 'Item lookup string, can include a count suffix like "diamond_sword 1".' },
              { key: 'permission', label: 'Crafting permission', type: 'text', width: 'full' },
              { key: 'shapeless', label: 'Shapeless', type: 'switch', width: 'half' },
              { key: 'recipe', label: 'Recipe grid (9 lines)', type: 'multiline-list', width: 'full', preserveEmpty: true },
            ],
          },
        ],
        toConfig: (values) => ({
          result: values.result,
          permission: values.permission,
          shapeless: values.shapeless,
          recipe: linesToArray(values.recipe, { preserveEmpty: true }),
        }),
      },
    ],
  };

export default plugin;
