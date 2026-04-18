import {
  buildConditions,
  buildEffects,
  deriveFileName,
  linesToArray,
} from '../../lib/schema.js';
import { conditionField, effectField } from '../_helpers.js';

const plugin = {
    id: 'Boosters',
    name: 'Boosters',
    group: 'Economy and Utility',
    accent: '#568f49',
    requires: ['eco'],
    uses: ['libreforge'],
    description: 'Create timed global or per-player boosters with bossbars, activation messaging, and effect payloads.',
    reference: [
      'Most boosters are a timed effect holder plus queueing metadata and GUI presentation.',
      'Name, category, merge-tag, and duration shape the player experience before you even get to the effect list.',
    ],
    templates: [
      {
        id: 'booster-config',
        name: 'Booster',
        description: 'Build a queueable booster config with shared activation and expiry messaging.',
        getOutputPath: (values) => `plugins/Boosters/boosters/${deriveFileName(values, 'booster')}`,
        initialValues: {
          id: 'sell_multiplier',
          name: '1.5x Sell Multiplier',
          duration: 72000,
          category: 'sell_multiplier',
          mergeTag: '1_5x_sell_multiplier',
          bossbarEnabled: true,
          bossbarColor: 'GREEN',
          bossbarStyle: 'SOLID',
          guiItem: 'player_head texture:paste_texture_here',
          guiName: '&d1.5x Sell Multiplier',
          guiLore: '&fGives everyone a multiplier\n&fDuration: &a1 Hour',
          guiRow: 2,
          guiColumn: 2,
          effects: [],
          activationEffects: [],
          expiryEffects: [],
          conditions: [],
        },
        sections: [
          {
            title: 'Identity',
            fields: [
              { key: 'id', label: 'Booster ID', type: 'text', width: 'half' },
              { key: 'name', label: 'Booster name', type: 'text', width: 'half' },
              { key: 'duration', label: 'Duration (ticks)', type: 'number', width: 'half' },
              { key: 'category', label: 'Category', type: 'text', width: 'half' },
              { key: 'mergeTag', label: 'Merge tag', type: 'text', width: 'full' },
            ],
          },
          {
            title: 'Bossbar and GUI',
            fields: [
              { key: 'bossbarEnabled', label: 'Bossbar enabled', type: 'switch', width: 'half' },
              { key: 'bossbarColor', label: 'Bossbar color', type: 'select', width: 'half', options: ['GREEN', 'BLUE', 'PINK', 'PURPLE', 'RED', 'WHITE', 'YELLOW'] },
              { key: 'bossbarStyle', label: 'Bossbar style', type: 'select', width: 'half', options: ['SOLID', 'SEGMENTED_6', 'SEGMENTED_10', 'SEGMENTED_12', 'SEGMENTED_20'] },
              { key: 'guiItem', label: 'GUI item', type: 'text', width: 'full' },
              { key: 'guiName', label: 'GUI name', type: 'text', width: 'half' },
              { key: 'guiLore', label: 'GUI lore', type: 'multiline-list', width: 'half' },
              { key: 'guiRow', label: 'GUI row', type: 'number', width: 'half' },
              { key: 'guiColumn', label: 'GUI column', type: 'number', width: 'half' },
            ],
          },
          {
            title: 'Effects',
            fields: [effectField('effects', 'Active effects'), effectField('activationEffects', 'Activation effects'), effectField('expiryEffects', 'Expiry effects'), conditionField()],
          },
        ],
        toConfig: (values) => ({
          name: values.name,
          duration: Number(values.duration),
          category: values.category,
          'merge-tag': values.mergeTag,
          bossbar: {
            enabled: values.bossbarEnabled,
            color: values.bossbarColor,
            style: values.bossbarStyle,
          },
          effects: buildEffects(values.effects),
          'activation-effects': buildEffects(values.activationEffects),
          'expiry-effects': buildEffects(values.expiryEffects),
          conditions: buildConditions(values.conditions),
          gui: {
            item: values.guiItem,
            name: values.guiName,
            lore: linesToArray(values.guiLore),
            position: {
              row: Number(values.guiRow),
              column: Number(values.guiColumn),
            },
          },
        }),
      },
    ],
  };

export default plugin;
