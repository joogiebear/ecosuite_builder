import {
  buildConditions,
  buildEffects,
  deriveFileName,
  numberLinesToArray,
} from '../../lib/schema.js';
import { conditionField, effectField } from '../_helpers.js';

const plugin = {
    id: 'libreforge',
    name: 'libreforge',
    group: 'Core Systems',
    accent: '#9f6f1d',
    requires: ['eco'],
    uses: [],
    description: 'The shared logic engine. Use this when you want reusable chains, custom argument packs, or a focused place to prototype effect grammar.',
    reference: [
      'Most Auxilor plugins call into libreforge for effects, conditions, filters, mutators, and placeholders.',
      'If you understand this file format well, every other plugin becomes easier to configure.',
    ],
    templates: [
      {
        id: 'libreforge-chain',
        name: 'Effect chain',
        description: 'Build a reusable chain for `plugins/libreforge/chains.yml` that can be referenced by other configs.',
        getOutputPath: () => 'plugins/libreforge/chains.yml',
        initialValues: {
          id: 'combo_chain',
          effects: [
            {
              id: 'damage_multiplier',
              triggers: 'melee_attack',
              argsText: 'multiplier: 1.15',
              filtersText: '',
            },
          ],
        },
        sections: [
          {
            title: 'Chain',
            fields: [
              { key: 'id', label: 'Chain ID', type: 'text', width: 'half' },
              effectField('effects', 'Chain effects'),
            ],
          },
        ],
        toConfig: (values) => ({
          chains: [
            {
              id: values.id,
              effects: buildEffects(values.effects),
            },
          ],
        }),
      },
      {
        id: 'libreforge-argument',
        name: 'Custom argument',
        description: 'Generate a custom effect argument for `plugins/libreforge/arguments/`. Used inside effect args as custom_<id>: ...',
        getOutputPath: (values) => `plugins/libreforge/arguments/${deriveFileName(values, 'argument')}`,
        initialValues: {
          id: 'named_mana',
          isMet: [
            { id: 'above_magic', argsText: 'type: mana\namount: %amount%' },
          ],
          ifMet: [
            { id: 'give_magic', triggers: '', argsText: 'type: mana\namount: - %amount%', filtersText: '', mutatorsText: '' },
          ],
          ifNotMet: [],
        },
        sections: [
          {
            title: 'Argument shell',
            fields: [
              { key: 'id', label: 'Argument ID', type: 'text', width: 'half', help: 'Used as custom_<id> in effect configs.' },
            ],
          },
          {
            title: 'Logic',
            fields: [
              conditionField('isMet', 'Is-met conditions'),
              effectField('ifMet', 'If-met effects'),
              effectField('ifNotMet', 'If-not-met effects'),
            ],
          },
        ],
        toConfig: (values) => ({
          'is-met': buildConditions(values.isMet),
          'if-met': buildEffects(values.ifMet),
          'if-not-met': buildEffects(values.ifNotMet),
        }),
      },
      {
        id: 'libreforge-levels',
        name: 'Item levels',
        description: 'Generate a level config for `plugins/libreforge/levels/`. Controls XP curve and level-up effects for leveling items.',
        getOutputPath: (values) => `plugins/libreforge/levels/${deriveFileName(values, 'level')}`,
        initialValues: {
          id: 'example',
          useFormula: false,
          xpFormula: '(2 ^ %level%) * 25',
          maxLevel: 10,
          requirements: '50\n100\n200\n400\n1000\n2000\n5000\n10000',
          levelUpEffects: [
            { id: 'send_message', triggers: '', argsText: 'message: "&fYou leveled up to &a%level%&f!"', filtersText: '', mutatorsText: '' },
            { id: 'play_sound', triggers: '', argsText: 'sound: entity_player_levelup\nvolume: 1.0\npitch: 1.5', filtersText: '', mutatorsText: '' },
          ],
        },
        sections: [
          {
            title: 'Level curve',
            fields: [
              { key: 'id', label: 'Level type ID', type: 'text', width: 'half' },
              { key: 'useFormula', label: 'Use XP formula instead of list', type: 'switch', width: 'half' },
              { key: 'xpFormula', label: 'XP formula', type: 'text', width: 'half' },
              { key: 'maxLevel', label: 'Max level', type: 'number', width: 'half' },
              { key: 'requirements', label: 'Level requirements (one per line)', type: 'multiline-list', width: 'full' },
            ],
          },
          {
            title: 'Level-up effects',
            fields: [effectField('levelUpEffects', 'Level-up effects')],
          },
        ],
        toConfig: (values) => ({
          'xp-formula': values.useFormula ? values.xpFormula : undefined,
          'max-level': values.useFormula ? Number(values.maxLevel) : undefined,
          requirements: values.useFormula ? undefined : numberLinesToArray(values.requirements),
          'level-up-effects': buildEffects(values.levelUpEffects),
        }),
      },
    ],
  };

export default plugin;
