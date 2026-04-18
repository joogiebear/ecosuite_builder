import {
  buildConditions,
  buildEffects,
  cleanObject,
  csvToArray,
  deriveFileName,
  linesToArray,
  parseKeyValueText,
} from '../../lib/schema.js';
import { conditionField, effectField } from '../_helpers.js';

const plugin = {
    id: 'EcoMobs',
    name: 'EcoMobs',
    group: 'Mobs and World',
    accent: '#75513d',
    requires: ['eco'],
    uses: ['libreforge'],
    description: 'Build custom mobs with stat strings, equipment, spawn eggs, bossbars, and event-based effect buckets.',
    reference: [
      'EcoMobs uses a large schema, so productivity comes from generating a solid base shell quickly.',
      'This builder focuses on the highest-value sections: entity stats, key event effects, spawn egg, and bossbar.',
    ],
    templates: [
      {
        id: 'mob-config',
        name: 'Mob',
        description: 'Generate a custom mob starter file with the most common gameplay sections.',
        getOutputPath: (values) => `plugins/EcoMobs/mobs/${deriveFileName(values, 'mob')}`,
        initialValues: {
          id: 'necrotic_soldier',
          mob: 'zombie attack-damage:90 movement-speed:1.5 follow-range:16 health:1200',
          category: 'common',
          displayName: '&cNecrotic Soldier &7| &c%health%♥ &7| &e%time%',
          hand: 'diamond_sword sharpness:2',
          offHand: '',
          head: '',
          chest: '',
          legs: '',
          feet: '',
          lifespan: 120,
          canMount: true,
          damageModifiersText:
            'hot_floor: 1\nfire_tick: 1\nlava: 1\nsuffocation: 1\ndrowning: 1\nentity_explosion: 1\nblock_explosion: 1',
          levelledMobsCanLevel: true,
          modelEngineId: '',
          betterModelId: '',
          libsDisguisesId: '',
          customAiClear: false,
          targetGoals: [],
          entityGoals: [],
          permanentEffects: [],
          spawnEffects: [],
          despawnEffects: [],
          interactEffects: [],
          meleeAttackEffects: [],
          rangedAttackEffects: [],
          anyAttackEffects: [],
          takeDamageEffects: [],
          damagePlayerEffects: [],
          killPlayerEffects: [],
          deathEffects: [],
          killEffects: [],
          bossbarEnabled: true,
          bossbarColor: 'white',
          bossbarStyle: 'progress',
          bossbarRadius: 120,
          experienceDrop: 30,
          dropGroups: [
            { chance: 100, itemsText: 'diamond_sword unbreaking:1 name:"Example Sword"' },
          ],
          totemEnabled: false,
          totemTop: 'netherite_block',
          totemMiddle: 'iron_block',
          totemBottom: 'magma_block',
          totemConditions: [],
          eggEnabled: true,
          eggItem: 'evoker_spawn_egg unbreaking:1 hide_enchants',
          eggName: '&cNecrotic Soldier&f Spawn Egg',
          eggLore: '&8&oPlace on the ground to\n&8&osummon a &cNecrotic Soldier',
          eggCraftable: false,
          eggRecipePermission: '',
          eggShapeless: false,
          eggRecipe: '',
          eggConditions: [],
        },
        sections: [
          {
            title: 'Mob shell',
            fields: [
              { key: 'id', label: 'Mob ID', type: 'text', width: 'half' },
              { key: 'mob', label: 'Entity lookup string', type: 'text', width: 'half' },
              { key: 'category', label: 'Spawn category', type: 'text', width: 'half' },
              { key: 'displayName', label: 'Display name', type: 'text', width: 'half' },
              { key: 'lifespan', label: 'Lifespan (seconds, -1 = none)', type: 'number', width: 'half' },
            ],
          },
          {
            title: 'Equipment',
            fields: [
              { key: 'hand', label: 'Hand item', type: 'text', width: 'half' },
              { key: 'offHand', label: 'Off-hand item', type: 'text', width: 'half' },
              { key: 'head', label: 'Head item', type: 'text', width: 'half' },
              { key: 'chest', label: 'Chest item', type: 'text', width: 'half' },
              { key: 'legs', label: 'Leg item', type: 'text', width: 'half' },
              { key: 'feet', label: 'Feet item', type: 'text', width: 'half' },
            ],
          },
          {
            title: 'Integrations',
            fields: [
              { key: 'levelledMobsCanLevel', label: 'LevelledMobs can-level', type: 'switch', width: 'half' },
              { key: 'modelEngineId', label: 'ModelEngine ID', type: 'text', width: 'half' },
              { key: 'betterModelId', label: 'BetterModel ID', type: 'text', width: 'half' },
              { key: 'libsDisguisesId', label: 'LibsDisguises ID', type: 'text', width: 'half' },
            ],
          },
          {
            title: 'Custom AI',
            fields: [
              { key: 'customAiClear', label: 'Override vanilla AI', type: 'switch', width: 'half' },
              {
                key: 'targetGoals',
                label: 'Target goals',
                type: 'collection',
                width: 'full',
                addLabel: 'Add target goal',
                fields: [
                  { key: 'key', label: 'Goal type', type: 'text', width: 'half', placeholder: 'nearest_attackable_target' },
                  { key: 'argsText', label: 'Args', type: 'multiline-list', width: 'full', placeholder: 'priority: 1\ntarget: player' },
                ],
              },
              {
                key: 'entityGoals',
                label: 'Entity goals',
                type: 'collection',
                width: 'full',
                addLabel: 'Add entity goal',
                fields: [
                  { key: 'key', label: 'Goal type', type: 'text', width: 'half', placeholder: 'melee_attack' },
                  { key: 'argsText', label: 'Args', type: 'multiline-list', width: 'full', placeholder: 'priority: 1\nspeed: 1.0' },
                ],
              },
            ],
          },
          {
            title: 'Effect buckets',
            fields: [
              effectField('permanentEffects', 'Permanent effects'),
              effectField('spawnEffects', 'Spawn effects'),
              effectField('despawnEffects', 'Despawn effects'),
              effectField('interactEffects', 'Interact effects'),
              effectField('meleeAttackEffects', 'Melee-attack effects'),
              effectField('rangedAttackEffects', 'Ranged-attack effects'),
              effectField('anyAttackEffects', 'Any-attack effects'),
              effectField('takeDamageEffects', 'Take-damage effects'),
              effectField('damagePlayerEffects', 'Damage-player effects'),
              effectField('killPlayerEffects', 'Kill-player effects'),
              effectField('deathEffects', 'Death effects'),
              effectField('killEffects', 'Kill effects'),
            ],
          },
          {
            title: 'Defence',
            fields: [
              { key: 'canMount', label: 'Can mount vehicles', type: 'switch', width: 'half' },
              { key: 'damageModifiersText', label: 'Damage modifiers (key: value)', type: 'textarea', width: 'full', help: 'One damage cause per line, value is the multiplier.' },
            ],
          },
          {
            title: 'Drops',
            fields: [
              { key: 'experienceDrop', label: 'Experience drop', type: 'number', width: 'half' },
              {
                key: 'dropGroups',
                label: 'Drop groups',
                type: 'collection',
                width: 'full',
                addLabel: 'Add drop group',
                fields: [
                  { key: 'chance', label: 'Chance (%)', type: 'number', width: 'half' },
                  { key: 'itemsText', label: 'Items (one per line)', type: 'multiline-list', width: 'full' },
                ],
              },
            ],
          },
          {
            title: 'Bossbar',
            fields: [
              { key: 'bossbarEnabled', label: 'Bossbar enabled', type: 'switch', width: 'half' },
              { key: 'bossbarColor', label: 'Bossbar color', type: 'select', width: 'half', options: ['white', 'red', 'yellow', 'green', 'blue', 'purple', 'pink'] },
              { key: 'bossbarStyle', label: 'Bossbar style', type: 'select', width: 'half', options: ['progress', 'notched_20', 'notched_12', 'notched_10', 'notched_6'] },
              { key: 'bossbarRadius', label: 'Visibility radius', type: 'number', width: 'half' },
            ],
          },
          {
            title: 'Spawn totem',
            fields: [
              { key: 'totemEnabled', label: 'Totem spawning', type: 'switch', width: 'half' },
              { key: 'totemTop', label: 'Top block', type: 'text', width: 'half' },
              { key: 'totemMiddle', label: 'Middle block', type: 'text', width: 'half' },
              { key: 'totemBottom', label: 'Bottom block', type: 'text', width: 'half' },
              conditionField('totemConditions', 'Totem conditions'),
            ],
          },
          {
            title: 'Spawn egg',
            fields: [
              { key: 'eggEnabled', label: 'Spawn egg enabled', type: 'switch', width: 'half' },
              { key: 'eggItem', label: 'Spawn egg item', type: 'text', width: 'full' },
              { key: 'eggName', label: 'Spawn egg name', type: 'text', width: 'half' },
              { key: 'eggLore', label: 'Spawn egg lore', type: 'multiline-list', width: 'half' },
              { key: 'eggCraftable', label: 'Egg craftable', type: 'switch', width: 'half' },
              { key: 'eggShapeless', label: 'Shapeless recipe', type: 'switch', width: 'half' },
              { key: 'eggRecipePermission', label: 'Recipe permission', type: 'text', width: 'full' },
              { key: 'eggRecipe', label: 'Recipe (9 lines)', type: 'multiline-list', width: 'full', help: 'One ingredient per line, 9 lines for a full crafting grid.' },
              conditionField('eggConditions', 'Egg conditions'),
            ],
          },
        ],
        toConfig: (values) => {
          const buildGoals = (entries) =>
            cleanObject(
              (entries ?? []).map((entry) =>
                cleanObject({
                  key: entry.key,
                  args: parseKeyValueText(entry.argsText),
                }),
              ),
            );

          const dropItems = cleanObject(
            (values.dropGroups ?? []).map((group) =>
              cleanObject({
                chance: group.chance === '' || group.chance === undefined ? undefined : Number(group.chance),
                items: linesToArray(group.itemsText),
              }),
            ),
          );

          return {
            mob: values.mob,
            category: values.category,
            'display-name': values.displayName,
            equipment: {
              hand: values.hand,
              'off-hand': values.offHand,
              head: values.head,
              chest: values.chest,
              legs: values.legs,
              feet: values.feet,
            },
            integrations: {
              'levelled-mobs': { 'can-level': values.levelledMobsCanLevel },
              'model-engine': { id: values.modelEngineId },
              'better-model': { id: values.betterModelId },
              'libs-disguises': { id: values.libsDisguisesId },
            },
            'custom-ai': {
              clear: values.customAiClear,
              'target-goals': buildGoals(values.targetGoals),
              'entity-goals': buildGoals(values.entityGoals),
            },
            effects: {
              'permanent-effects': buildEffects(values.permanentEffects),
              spawn: buildEffects(values.spawnEffects),
              despawn: buildEffects(values.despawnEffects),
              interact: buildEffects(values.interactEffects),
              'melee-attack': buildEffects(values.meleeAttackEffects),
              'ranged-attack': buildEffects(values.rangedAttackEffects),
              'any-attack': buildEffects(values.anyAttackEffects),
              'take-damage': buildEffects(values.takeDamageEffects),
              'damage-player': buildEffects(values.damagePlayerEffects),
              'kill-player': buildEffects(values.killPlayerEffects),
              death: buildEffects(values.deathEffects),
              kill: buildEffects(values.killEffects),
            },
            lifespan: Number(values.lifespan),
            defence: {
              'can-mount': values.canMount,
              'damage-modifiers': parseKeyValueText(values.damageModifiersText),
            },
            drops: {
              experience: Number(values.experienceDrop),
              items: dropItems,
            },
            'boss-bar': {
              enabled: values.bossbarEnabled,
              color: values.bossbarColor,
              style: values.bossbarStyle,
              radius: Number(values.bossbarRadius),
            },
            spawn: {
              totem: values.totemEnabled
                ? {
                    enabled: true,
                    top: values.totemTop,
                    middle: values.totemMiddle,
                    bottom: values.totemBottom,
                    conditions: buildConditions(values.totemConditions),
                  }
                : { enabled: false },
              egg: {
                enabled: values.eggEnabled,
                conditions: buildConditions(values.eggConditions),
                item: values.eggItem,
                name: values.eggName,
                lore: linesToArray(values.eggLore),
                craftable: values.eggCraftable,
                'recipe-permission': values.eggRecipePermission,
                shapeless: values.eggShapeless,
                recipe: values.eggCraftable ? linesToArray(values.eggRecipe, { preserveEmpty: true }) : undefined,
              },
            },
          };
        },
      },
      {
        id: 'category-config',
        name: 'Category',
        description: 'Generate a mob category config for `plugins/EcoMobs/categories/`.',
        getOutputPath: (values) => `plugins/EcoMobs/categories/${deriveFileName(values, 'category')}`,
        initialValues: {
          id: 'elite',
          spawningType: 'replace',
          replaceEntities: 'zombie,skeleton,spider',
          replaceChance: 5,
          customSpawnTypes: 'land',
          customChance: 1,
          persistent: false,
          conditions: [],
        },
        sections: [
          {
            title: 'Category shell',
            fields: [
              { key: 'id', label: 'Category ID', type: 'text', width: 'half' },
              { key: 'persistent', label: 'Persistent', type: 'switch', width: 'half', help: 'Whether mobs survive server restarts' },
            ],
          },
          {
            title: 'Spawning',
            fields: [
              { key: 'spawningType', label: 'Spawn type', type: 'select', width: 'half', options: [
                { label: 'Replace vanilla mobs', value: 'replace' },
                { label: 'Custom spawning', value: 'custom' },
                { label: 'None (egg only)', value: 'none' },
              ]},
              { key: 'replaceEntities', label: 'Replace entities', type: 'text', width: 'half', help: 'Comma-separated vanilla mob names (for replace type)' },
              { key: 'replaceChance', label: 'Replace chance (%)', type: 'number', width: 'half' },
              { key: 'customSpawnTypes', label: 'Custom spawn types', type: 'text', width: 'half', help: 'Comma-separated: land, water (for custom type)' },
              { key: 'customChance', label: 'Custom spawn chance', type: 'number', width: 'half' },
            ],
          },
          {
            title: 'Spawn conditions',
            fields: [conditionField()],
          },
        ],
        toConfig: (values) => {
          const conditions = buildConditions(values.conditions);
          const spawning = { type: values.spawningType };

          if (values.spawningType === 'replace') {
            spawning.replace = {
              replace: csvToArray(values.replaceEntities),
              chance: Number(values.replaceChance),
            };
          } else if (values.spawningType === 'custom') {
            spawning.custom = {
              'spawn-types': csvToArray(values.customSpawnTypes),
              conditions,
              chance: Number(values.customChance),
            };
          }

          return cleanObject({
            spawning,
            persistent: values.persistent,
          });
        },
      },
    ],
  };

export default plugin;
