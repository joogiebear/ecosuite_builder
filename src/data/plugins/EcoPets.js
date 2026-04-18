import {
  buildConditions,
  buildEffects,
  cleanObject,
  deriveFileName,
  numberLinesToArray,
} from '../../lib/schema.js';
import {
  buildLevelKeyedLines,
  buildXpMethods,
  conditionField,
  effectField,
  levelLinesField,
  xpMethodsField,
} from '../_helpers.js';

const plugin = {
    id: 'EcoPets',
    name: 'EcoPets',
    group: 'Progression',
    accent: '#6c5a8a',
    requires: ['eco'],
    uses: ['libreforge'],
    description: 'Create leveling pets with XP methods, level placeholders, GUI assets, and ongoing passive effects.',
    reference: [
      'Pet configs blend progression data with a normal effect holder pattern.',
      'You usually iterate on three things: XP gain, level placeholder formulas, and the main effect list.',
    ],
    templates: [
      {
        id: 'pet-config',
        name: 'Pet',
        description: 'Generate a leveling pet file for `plugins/EcoPets/pets/`.',
        getOutputPath: (values) => `plugins/EcoPets/pets/${deriveFileName(values, 'pet')}`,
        initialValues: {
          id: 'tiger',
          name: '&6Tiger',
          description: '&8&oLevel up by dealing melee damage',
          useFormula: false,
          xpFormula: '(2 ^ %level%) * 25',
          maxLevel: 100,
          levelXpRequirements: '50\n125\n200\n300',
          entityTexture: 'paste_texture_here',
          icon: 'player_head texture:paste_texture_here',
          xpMethods: [{ trigger: 'melee_attack', multiplier: '0.5', filtersText: '' }],
          levelPlaceholders: [{ id: 'damage_multiplier', value: '%level%' }],
          effectsDescription: [
            { level: 1, lines: '&8» &8Gives a &a+%damage_multiplier%%&8 bonus to\n   &8melee damage' },
          ],
          rewardsDescription: [],
          levelUpMessages: [],
          levelUpEffects: [],
          effects: [],
          conditions: [],
        },
        sections: [
          {
            title: 'Pet shell',
            fields: [
              { key: 'id', label: 'Pet ID', type: 'text', width: 'half' },
              { key: 'name', label: 'Display name', type: 'text', width: 'half' },
              { key: 'description', label: 'Description', type: 'text', width: 'full' },
              { key: 'entityTexture', label: 'Entity texture', type: 'text', width: 'full' },
              { key: 'icon', label: 'GUI icon', type: 'text', width: 'full' },
            ],
          },
          {
            title: 'Leveling',
            fields: [
              { key: 'useFormula', label: 'Use XP formula instead of list', type: 'switch', width: 'half' },
              { key: 'xpFormula', label: 'XP formula', type: 'text', width: 'half' },
              { key: 'maxLevel', label: 'Max level', type: 'number', width: 'half' },
              { key: 'levelXpRequirements', label: 'Level XP list', type: 'multiline-list', width: 'full' },
            ],
          },
          {
            title: 'Progression',
            fields: [
              xpMethodsField('xpMethods', 'XP gain methods'),
              {
                key: 'levelPlaceholders',
                label: 'Level placeholders',
                type: 'collection',
                width: 'full',
                addLabel: 'Add placeholder',
                fields: [
                  { key: 'id', label: 'Placeholder ID', type: 'text' },
                  { key: 'value', label: 'Formula', type: 'text' },
                ],
              },
            ],
          },
          {
            title: 'Per-level descriptions',
            fields: [
              levelLinesField('effectsDescription', 'Effects description (by level)'),
              levelLinesField('rewardsDescription', 'Rewards description (by level)'),
              levelLinesField('levelUpMessages', 'Level-up messages (by level)'),
            ],
          },
          {
            title: 'Logic',
            fields: [effectField(), effectField('levelUpEffects', 'Level-up effects'), conditionField()],
          },
        ],
        toConfig: (values) => ({
          name: values.name,
          description: values.description,
          'xp-formula': values.useFormula ? values.xpFormula : undefined,
          'max-level': values.useFormula ? Number(values.maxLevel) : undefined,
          'level-xp-requirements': values.useFormula ? undefined : numberLinesToArray(values.levelXpRequirements),
          'xp-gain-methods': buildXpMethods(values.xpMethods, 'id'),
          'level-placeholders': cleanObject(
            (values.levelPlaceholders ?? []).map((entry) =>
              cleanObject({
                id: entry.id,
                value: entry.value,
              }),
            ),
          ),
          'effects-description': buildLevelKeyedLines(values.effectsDescription),
          'rewards-description': buildLevelKeyedLines(values.rewardsDescription),
          'level-up-messages': buildLevelKeyedLines(values.levelUpMessages),
          'level-up-effects': buildEffects(values.levelUpEffects),
          effects: buildEffects(values.effects),
          conditions: buildConditions(values.conditions),
          'entity-texture': values.entityTexture,
          icon: values.icon,
        }),
      },
    ],
  };

export default plugin;
