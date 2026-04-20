import {
  buildConditions,
  buildEffects,
  cleanObject,
  csvToArray,
  deriveFileName,
  linesToArray,
} from '../../lib/schema.js';
import { armorPiece, conditionField, effectField } from '../_helpers.js';

const plugin = {
    id: 'EcoArmor',
    name: 'EcoArmor',
    group: 'Items and Equipment',
    accent: '#7d4e51',
    requires: ['eco'],
    uses: ['libreforge'],
    description: 'Build armor set configs with full-set bonuses, advanced states, and optional partial scaling.',
    reference: [
      'Armor sets combine a top-level set bonus with per-piece item sections.',
      'This builder focuses on clean starter sets so you can iterate on shard recipes, tiers, and advanced states later.',
    ],
    templates: [
      {
        id: 'armor-set',
        name: 'Armor set',
        description: 'Generate a four-piece set skeleton with full and partial bonuses already wired.',
        getOutputPath: (values) => `plugins/EcoArmor/sets/${deriveFileName(values, 'armor_set')}`,
        initialValues: {
          id: 'reaper',
          setName: 'Reaper',
          baseMaterial: 'leather',
          color: '#303030',
          tier: 'default',
          effectiveDurability: 2048,
          lore: '&c&lREAPER SET BONUS\n&8» &cDeal 25% more damage\n&8&oRequires full set to be worn\n\n&fTier: %tier%\n&8&oUpgrade with an Upgrade Crystal',
          advancedLore: '\n<gradient:f12711>&lADVANCED BONUS</gradient:f5af19>\n&8» &6Take 10% less damage\n&8&oRequires full set to be worn',
          piecesCraftable: true,
          piecesCraftingPermission: '',
          piecesShapeless: false,
          includeElytra: false,
          effects: [],
          advancedEffects: [],
          partialTwoEffects: [],
          partialThreeEffects: [],
          helmetConditions: [],
          chestplateConditions: [],
          leggingsConditions: [],
          bootsConditions: [],
          elytraConditions: [],
          equipSoundEnabled: true,
          equipSound: 'BLOCK_ANVIL_PLACE',
          equipSoundVolume: 1,
          equipSoundPitch: 1,
          advancedEquipSoundEnabled: true,
          advancedEquipSound: 'ENTITY_PLAYER_LEVELUP',
          advancedEquipSoundVolume: 1,
          advancedEquipSoundPitch: 1,
          unequipSoundEnabled: true,
          unequipSound: 'ENTITY_ITEM_BREAK',
          unequipSoundVolume: 1,
          unequipSoundPitch: 1,
          shardEnabled: true,
          shardItem: 'prismarine_shard unbreaking:1 hide_enchants',
          shardName: '<gradient:f12711>Advancement Shard:</gradient:f5af19> &cReaper',
          shardLore: '&8Drop this onto &cReaper Armor\n&8to make it <gradient:f12711>Advanced</gradient:f5af19>.',
          shardCraftable: false,
          shardRecipePermission: '',
          shardShapeless: false,
          shardRecipe: '',
        },
        sections: [
          {
            title: 'Set shell',
            fields: [
              { key: 'id', label: 'Set ID', type: 'text', width: 'half' },
              { key: 'setName', label: 'Set name', type: 'text', width: 'half' },
              { key: 'baseMaterial', label: 'Base armor material', type: 'select', width: 'half', options: ['leather', 'iron', 'diamond', 'netherite'] },
              { key: 'color', label: 'Leather color', type: 'text', width: 'half', help: 'Only applies if base material is leather.' },
              { key: 'tier', label: 'Default tier', type: 'text', width: 'half' },
              { key: 'effectiveDurability', label: 'Effective durability', type: 'number', width: 'half', help: 'Scales wear rate. Higher = tougher.' },
              { key: 'lore', label: 'Shared piece lore', type: 'multiline-list', width: 'half' },
              { key: 'advancedLore', label: 'Advanced lore', type: 'multiline-list', width: 'half' },
              { key: 'includeElytra', label: 'Include elytra piece', type: 'switch', width: 'half' },
            ],
          },
          {
            title: 'Piece crafting defaults',
            fields: [
              { key: 'piecesCraftable', label: 'Pieces craftable', type: 'switch', width: 'half' },
              { key: 'piecesShapeless', label: 'Shapeless recipes', type: 'switch', width: 'half' },
              { key: 'piecesCraftingPermission', label: 'Crafting permission', type: 'text', width: 'full' },
            ],
          },
          {
            title: 'Set bonuses',
            fields: [
              effectField('effects', 'Full set effects'),
              effectField('advancedEffects', 'Advanced full-set effects'),
              effectField('partialTwoEffects', 'Two-piece effects'),
              effectField('partialThreeEffects', 'Three-piece effects'),
            ],
          },
          {
            title: 'Per-piece conditions',
            fields: [
              conditionField('helmetConditions', 'Helmet conditions'),
              conditionField('chestplateConditions', 'Chestplate conditions'),
              conditionField('leggingsConditions', 'Leggings conditions'),
              conditionField('bootsConditions', 'Boots conditions'),
              conditionField('elytraConditions', 'Elytra conditions'),
            ],
          },
          {
            title: 'Sounds',
            fields: [
              { key: 'equipSoundEnabled', label: 'Equip sound', type: 'switch', width: 'half' },
              { key: 'equipSound', label: 'Equip sound ID', type: 'text', width: 'half' },
              { key: 'equipSoundVolume', label: 'Equip volume', type: 'number', width: 'half' },
              { key: 'equipSoundPitch', label: 'Equip pitch', type: 'number', width: 'half' },
              { key: 'advancedEquipSoundEnabled', label: 'Advanced equip sound', type: 'switch', width: 'half' },
              { key: 'advancedEquipSound', label: 'Advanced equip sound ID', type: 'text', width: 'half' },
              { key: 'advancedEquipSoundVolume', label: 'Advanced equip volume', type: 'number', width: 'half' },
              { key: 'advancedEquipSoundPitch', label: 'Advanced equip pitch', type: 'number', width: 'half' },
              { key: 'unequipSoundEnabled', label: 'Unequip sound', type: 'switch', width: 'half' },
              { key: 'unequipSound', label: 'Unequip sound ID', type: 'text', width: 'half' },
              { key: 'unequipSoundVolume', label: 'Unequip volume', type: 'number', width: 'half' },
              { key: 'unequipSoundPitch', label: 'Unequip pitch', type: 'number', width: 'half' },
            ],
          },
          {
            title: 'Advancement shard',
            fields: [
              { key: 'shardEnabled', label: 'Include shard section', type: 'switch', width: 'half' },
              { key: 'shardItem', label: 'Shard item', type: 'text', width: 'full' },
              { key: 'shardName', label: 'Shard name', type: 'text', width: 'full' },
              { key: 'shardLore', label: 'Shard lore', type: 'multiline-list', width: 'full' },
              { key: 'shardCraftable', label: 'Shard craftable', type: 'switch', width: 'half' },
              { key: 'shardShapeless', label: 'Shapeless recipe', type: 'switch', width: 'half' },
              { key: 'shardRecipePermission', label: 'Shard recipe permission', type: 'text', width: 'full' },
              { key: 'shardRecipe', label: 'Shard recipe', type: 'recipe-grid', width: 'full' },
            ],
          },
        ],
        toConfig: (values) => {
          const lore = linesToArray(values.lore);
          const advancedLore = linesToArray(values.advancedLore);
          const craftable = values.piecesCraftable;
          const recipePermission = values.piecesCraftingPermission;
          const shapeless = values.piecesShapeless;

          const makePiece = (suffix, pieceKey, conditionsValue) => ({
            item: armorPiece(values.baseMaterial, pieceKey, values.color),
            name: `&c${values.setName} ${suffix}`,
            advancedName: `<gradient:f12711>Advanced</gradient:f5af19>&c ${values.setName} ${suffix}`,
            lore,
            craftable,
            'crafting-permission': recipePermission,
            shapeless,
            recipe: undefined,
            defaultTier: values.tier,
            effectiveDurability: values.effectiveDurability ? Number(values.effectiveDurability) : undefined,
            effects: [],
            advancedEffects: [],
            conditions: buildConditions(conditionsValue),
          });

          const sound = (enabled, id, volume, pitch) => ({
            enabled,
            sound: id,
            volume: Number(volume),
            pitch: Number(pitch),
            category: 'PLAYERS',
          });

          const set = {
            effects: buildEffects(values.effects),
            advancedEffects: buildEffects(values.advancedEffects),
            partialEffects: {
              enabled: true,
              stacked: false,
              disabledByFull: false,
              amounts: cleanObject({
                2: buildEffects(values.partialTwoEffects) ? { effects: buildEffects(values.partialTwoEffects) } : undefined,
                3: buildEffects(values.partialThreeEffects) ? { effects: buildEffects(values.partialThreeEffects) } : undefined,
              }),
            },
            sounds: {
              equip: sound(values.equipSoundEnabled, values.equipSound, values.equipSoundVolume, values.equipSoundPitch),
              advancedEquip: sound(values.advancedEquipSoundEnabled, values.advancedEquipSound, values.advancedEquipSoundVolume, values.advancedEquipSoundPitch),
              unequip: sound(values.unequipSoundEnabled, values.unequipSound, values.unequipSoundVolume, values.unequipSoundPitch),
            },
            advancedLore,
            helmet: makePiece('Helmet', 'helmet', values.helmetConditions),
            chestplate: makePiece('Chestplate', 'chestplate', values.chestplateConditions),
            leggings: makePiece('Leggings', 'leggings', values.leggingsConditions),
            boots: makePiece('Boots', 'boots', values.bootsConditions),
          };

          if (values.includeElytra) {
            set.elytra = makePiece('Elytra', 'elytra', values.elytraConditions);
            set.elytra.item = 'elytra';
          }

          if (values.shardEnabled) {
            set.shard = {
              item: values.shardItem,
              name: values.shardName,
              lore: linesToArray(values.shardLore),
              craftable: values.shardCraftable,
              'crafting-permission': values.shardRecipePermission,
              shapeless: values.shardShapeless,
              recipe: values.shardCraftable ? linesToArray(values.shardRecipe, { preserveEmpty: true }) : undefined,
            };
          }

          return set;
        },
      },
      {
        id: 'armor-tier',
        name: 'Armor tier',
        description: 'Generate a tier file for `plugins/EcoArmor/tiers/`. Referenced by armor sets via defaultTier.',
        getOutputPath: (values) => `plugins/EcoArmor/tiers/${deriveFileName(values, 'tier')}`,
        initialValues: {
          id: 'netherite',
          display: '&c&lNETHERITE',
          requiresTiers: 'diamond,iron',
          crystalItem: 'end_crystal',
          crystalName: '&cNetherite Upgrade Crystal',
          crystalLore: '&8Drop this onto an armor piece\n&8to set its tier to:\n&c&lNETHERITE\n\n&8&oRequires the armor to already have Diamond tier',
          crystalCraftable: true,
          crystalPermission: '',
          crystalShapeless: false,
          crystalGiveAmount: 1,
          crystalRecipe:
            'air\nnetherite_ingot\nair\nnetherite_ingot\necoarmor:upgrade_crystal_diamond\nnetherite_ingot\nair\nnetherite_ingot\nair',
          propertiesText:
            'helmet:\n  armor: 3\n  toughness: 3\n  knockbackResistance: 1\n\nchestplate:\n  armor: 8\n  toughness: 3\n  knockbackResistance: 1\n\nelytra:\n  armor: 3\n  toughness: 0\n  knockbackResistance: 1\n\nleggings:\n  armor: 6\n  toughness: 3\n  knockbackResistance: 1\n\nboots:\n  armor: 3\n  toughness: 3\n  knockbackResistance: 1',
        },
        sections: [
          {
            title: 'Tier shell',
            fields: [
              { key: 'id', label: 'Tier ID', type: 'text', width: 'half' },
              { key: 'display', label: 'Display text', type: 'text', width: 'half' },
              { key: 'requiresTiers', label: 'Required prior tiers', type: 'text', width: 'full', help: 'Comma-separated tier IDs.' },
            ],
          },
          {
            title: 'Upgrade crystal',
            fields: [
              { key: 'crystalItem', label: 'Crystal item', type: 'text', width: 'full' },
              { key: 'crystalName', label: 'Crystal name', type: 'text', width: 'full' },
              { key: 'crystalLore', label: 'Crystal lore', type: 'multiline-list', width: 'full' },
              { key: 'crystalCraftable', label: 'Craftable', type: 'switch', width: 'half' },
              { key: 'crystalShapeless', label: 'Shapeless', type: 'switch', width: 'half' },
              { key: 'crystalPermission', label: 'Crafting permission', type: 'text', width: 'full' },
              { key: 'crystalGiveAmount', label: 'Give amount', type: 'number', width: 'half' },
              { key: 'crystalRecipe', label: 'Crystal recipe', type: 'recipe-grid', width: 'full', preserveEmpty: true },
            ],
          },
          {
            title: 'Properties',
            fields: [
              { key: 'propertiesText', label: 'Properties (YAML)', type: 'textarea', width: 'full', help: 'Per-piece stat block. Use helmet:, chestplate:, elytra:, leggings:, boots: as top-level keys; indent stats below with two spaces.' },
            ],
          },
        ],
        toConfig: (values) => {
          const parseProperties = (text) => {
            const result = {};
            let current = null;
            for (const rawLine of String(text ?? '').split(/\r?\n/)) {
              if (!rawLine.trim()) continue;

              const headerMatch = rawLine.match(/^(\w[\w-]*)\s*:\s*$/);
              if (headerMatch) {
                current = headerMatch[1];
                result[current] = {};
                continue;
              }

              const statMatch = rawLine.match(/^\s+(\w[\w-]*)\s*:\s*(.+)$/);
              if (statMatch && current) {
                const value = statMatch[2].trim();
                const numeric = Number(value);
                result[current][statMatch[1]] = Number.isNaN(numeric) ? value : numeric;
              }
            }
            return cleanObject(result);
          };

          return {
            display: values.display,
            requiresTiers: csvToArray(values.requiresTiers),
            crystal: {
              item: values.crystalItem,
              name: values.crystalName,
              lore: linesToArray(values.crystalLore),
              craftable: values.crystalCraftable,
              'crafting-permission': values.crystalCraftable ? values.crystalPermission : undefined,
              shapeless: values.crystalShapeless,
              recipe: values.crystalCraftable ? linesToArray(values.crystalRecipe, { preserveEmpty: true }) : undefined,
              giveAmount: values.crystalGiveAmount ? Number(values.crystalGiveAmount) : undefined,
            },
            properties: parseProperties(values.propertiesText),
          };
        },
      },
    ],
  };

export default plugin;
