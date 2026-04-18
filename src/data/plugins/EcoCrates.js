import {
  autoGrid,
  buildEffects,
  cleanObject,
  csvToArray,
  deriveFileName,
  linesToArray,
} from '../../lib/schema.js';
import { effectField } from '../_helpers.js';

const plugin = {
    id: 'EcoCrates',
    name: 'EcoCrates',
    group: 'Economy and Utility',
    accent: '#8b5a2b',
    requires: ['eco'],
    uses: ['libreforge'],
    description: 'Create crate shells with reward previews, keys, open effects, and finish effects.',
    reference: [
      'The crate file mostly controls presentation, reward IDs, and opening behavior.',
      'Reward definitions and key definitions still live in their own folders; this builder produces the crate shell.',
    ],
    templates: [
      {
        id: 'crate-config',
        name: 'Crate',
        description: 'Generate a single crate with an auto-laid preview page.',
        getOutputPath: (values) => `plugins/EcoCrates/crates/${deriveFileName(values, 'crate')}`,
        initialValues: {
          id: 'demo_crate',
          name: 'Demo Crate',
          roll: 'csgo',
          key: 'demo_key',
          canReroll: true,
          previewRows: 6,
          previewMask1: 'gray_stained_glass_pane',
          previewMask2: 'black_stained_glass_pane',
          previewPattern: '222222222\n211111112\n211011112\n211110112\n211111112\n222222222',
          forwardsArrowItem: 'arrow name:"&fNext Page"',
          forwardsArrowRow: 6,
          forwardsArrowColumn: 6,
          backwardsArrowItem: 'arrow name:"&fPrevious Page"',
          backwardsArrowRow: 6,
          backwardsArrowColumn: 4,
          rewards: 'diamond_sword,stack_of_emeralds,bedrock,coins_1000',
          payToOpenEnabled: false,
          payToOpenPrice: 5000,
          payToOpenType: 'coins',
          placedRandomRewardEnabled: true,
          placedRandomRewardHeight: 1.5,
          placedRandomRewardDelay: 30,
          placedRandomRewardName: '&fYou could win:',
          placedParticles: [
            { particle: 'flame', animation: 'spiral' },
          ],
          placedHologramEnabled: true,
          placedHologramHeight: 1.5,
          placedHologramTicks: 200,
          placedHologramFrames: [
            {
              tick: 0,
              lines: '<g:#56ab2f>&lDEMO CRATE</g:#a8e063>\n&b&lLeft Click to Preview\n&a&lRight click to Open',
            },
          ],
          openEffects: [],
          finishEffects: [],
        },
        sections: [
          {
            title: 'Crate shell',
            fields: [
              { key: 'id', label: 'Crate ID', type: 'text', width: 'half' },
              { key: 'name', label: 'Display name', type: 'text', width: 'half' },
              { key: 'roll', label: 'Roll animation', type: 'text', width: 'half' },
              { key: 'key', label: 'Key ID', type: 'text', width: 'half' },
              { key: 'canReroll', label: 'Allow reroll', type: 'switch', width: 'half' },
              { key: 'previewRows', label: 'Preview rows', type: 'number', width: 'half' },
              { key: 'rewards', label: 'Reward IDs', type: 'text', width: 'full' },
            ],
          },
          {
            title: 'Preview GUI',
            fields: [
              { key: 'previewMask1', label: 'Mask item 1', type: 'text', width: 'half' },
              { key: 'previewMask2', label: 'Mask item 2', type: 'text', width: 'half' },
              { key: 'previewPattern', label: 'Mask pattern (6×9)', type: 'multiline-list', width: 'full', help: 'Six rows of nine digits each. Digit references the mask items above (1, 2). Use 0 for empty slots.' },
              { key: 'forwardsArrowItem', label: 'Next-page arrow item', type: 'text', width: 'full' },
              { key: 'forwardsArrowRow', label: 'Next arrow row', type: 'number', width: 'half' },
              { key: 'forwardsArrowColumn', label: 'Next arrow column', type: 'number', width: 'half' },
              { key: 'backwardsArrowItem', label: 'Previous-page arrow item', type: 'text', width: 'full' },
              { key: 'backwardsArrowRow', label: 'Previous arrow row', type: 'number', width: 'half' },
              { key: 'backwardsArrowColumn', label: 'Previous arrow column', type: 'number', width: 'half' },
            ],
          },
          {
            title: 'Pay to open',
            fields: [
              { key: 'payToOpenEnabled', label: 'Enable pay-to-open', type: 'switch', width: 'half' },
              { key: 'payToOpenPrice', label: 'Price', type: 'number', width: 'half' },
              { key: 'payToOpenType', label: 'Currency type', type: 'text', width: 'half' },
            ],
          },
          {
            title: 'Physically placed crate',
            fields: [
              { key: 'placedRandomRewardEnabled', label: 'Show random reward hologram', type: 'switch', width: 'half' },
              { key: 'placedRandomRewardHeight', label: 'Reward hologram height', type: 'number', width: 'half' },
              { key: 'placedRandomRewardDelay', label: 'Ticks between items', type: 'number', width: 'half' },
              { key: 'placedRandomRewardName', label: 'Reward hologram label', type: 'text', width: 'half' },
              {
                key: 'placedParticles',
                label: 'Particles',
                type: 'collection',
                width: 'full',
                addLabel: 'Add particle',
                fields: [
                  { key: 'particle', label: 'Particle', type: 'text', width: 'half', placeholder: 'flame' },
                  { key: 'animation', label: 'Animation', type: 'select', width: 'half', options: ['spiral', 'double_spiral', 'circle', 'twirl'] },
                ],
              },
              { key: 'placedHologramEnabled', label: 'Show text hologram', type: 'switch', width: 'half' },
              { key: 'placedHologramHeight', label: 'Hologram height', type: 'number', width: 'half' },
              { key: 'placedHologramTicks', label: 'Total cycle ticks', type: 'number', width: 'half' },
              {
                key: 'placedHologramFrames',
                label: 'Hologram frames',
                type: 'collection',
                width: 'full',
                addLabel: 'Add frame',
                fields: [
                  { key: 'tick', label: 'Starting tick', type: 'number', width: 'half' },
                  { key: 'lines', label: 'Frame lines', type: 'multiline-list', width: 'full' },
                ],
              },
            ],
          },
          {
            title: 'Effects',
            fields: [effectField('openEffects', 'Open effects'), effectField('finishEffects', 'Finish effects')],
          },
        ],
        toConfig: (values) => {
          const rewardIds = csvToArray(values.rewards);
          const layout = autoGrid(rewardIds, { startRow: 3, startColumn: 3, columns: 3 });
          const pattern = linesToArray(values.previewPattern);

          const placedParticles = cleanObject(
            (values.placedParticles ?? []).map((entry) =>
              cleanObject({
                particle: entry.particle,
                animation: entry.animation,
              }),
            ),
          );

          const hologramFrames = cleanObject(
            (values.placedHologramFrames ?? []).map((frame) =>
              cleanObject({
                tick: frame.tick === '' || frame.tick === undefined ? undefined : Number(frame.tick),
                lines: linesToArray(frame.lines),
              }),
            ),
          );

          return {
            name: values.name,
            roll: values.roll,
            'can-reroll': values.canReroll,
            key: values.key,
            preview: {
              title: values.name,
              rows: Number(values.previewRows),
              'forwards-arrow': {
                item: values.forwardsArrowItem,
                row: Number(values.forwardsArrowRow),
                column: Number(values.forwardsArrowColumn),
              },
              'backwards-arrow': {
                item: values.backwardsArrowItem,
                row: Number(values.backwardsArrowRow),
                column: Number(values.backwardsArrowColumn),
              },
              pages: [
                {
                  page: 1,
                  mask: {
                    items: [values.previewMask1, values.previewMask2].filter(Boolean),
                    pattern,
                  },
                  rewards: layout,
                },
              ],
            },
            'pay-to-open': values.payToOpenEnabled
              ? {
                  enabled: true,
                  price: Number(values.payToOpenPrice),
                  type: values.payToOpenType,
                }
              : {
                  enabled: false,
                },
            placed: {
              'random-reward': {
                enabled: values.placedRandomRewardEnabled,
                height: Number(values.placedRandomRewardHeight),
                delay: Number(values.placedRandomRewardDelay),
                name: values.placedRandomRewardName,
              },
              particles: placedParticles,
              hologram: values.placedHologramEnabled
                ? {
                    height: Number(values.placedHologramHeight),
                    ticks: Number(values.placedHologramTicks),
                    frames: hologramFrames,
                  }
                : undefined,
            },
            'open-effects': buildEffects(values.openEffects),
            'finish-effects': buildEffects(values.finishEffects),
            rewards: rewardIds,
          };
        },
      },
      {
        id: 'crate-reward',
        name: 'Crate reward',
        description: 'Generate a reward file for `plugins/EcoCrates/rewards/`. Referenced by crate configs.',
        getOutputPath: (values) => `plugins/EcoCrates/rewards/${deriveFileName(values, 'reward')}`,
        initialValues: {
          id: 'diamond_sword',
          name: '&bDiamond Sword',
          weightValue: '1',
          permissionMultipliers: true,
          maxWins: -1,
          displayItem: 'diamond_sword sharpness:5 unbreaking:3',
          displayName: '&bDiamond Sword',
          displayLore: '&fChance: &a%chance%%',
          dontKeepLore: false,
          winEffects: [
            { id: 'give_item', triggers: '', argsText: 'item: diamond_sword sharpness:5 unbreaking:3', filtersText: '', mutatorsText: '' },
            { id: 'send_message', triggers: '', argsText: 'message: "&fYou won the %reward% &fin %crate%&f!"', filtersText: '', mutatorsText: '' },
          ],
        },
        sections: [
          {
            title: 'Reward shell',
            fields: [
              { key: 'id', label: 'Reward ID', type: 'text', width: 'half' },
              { key: 'name', label: 'Reward name', type: 'text', width: 'half' },
              { key: 'weightValue', label: 'Weight / chance', type: 'text', width: 'half', help: 'Accepts expressions and placeholders.' },
              { key: 'permissionMultipliers', label: 'Permission multipliers', type: 'switch', width: 'half' },
              { key: 'maxWins', label: 'Max wins per player (-1 = no limit)', type: 'number', width: 'half' },
            ],
          },
          {
            title: 'Display',
            fields: [
              { key: 'displayItem', label: 'Display item', type: 'text', width: 'full' },
              { key: 'displayName', label: 'Display name', type: 'text', width: 'full' },
              { key: 'displayLore', label: 'Display lore', type: 'multiline-list', width: 'full' },
              { key: 'dontKeepLore', label: 'Override item lore completely', type: 'switch', width: 'half' },
            ],
          },
          {
            title: 'Win effects',
            fields: [effectField('winEffects', 'Win effects')],
          },
        ],
        toConfig: (values) => ({
          name: values.name,
          'win-effects': buildEffects(values.winEffects),
          weight: {
            'permission-multipliers': values.permissionMultipliers,
            value: Number.isNaN(Number(values.weightValue)) ? values.weightValue : Number(values.weightValue),
          },
          'max-wins': Number(values.maxWins),
          display: {
            name: values.displayName,
            item: values.displayItem,
            'dont-keep-lore': values.dontKeepLore,
            lore: linesToArray(values.displayLore),
          },
        }),
      },
      {
        id: 'crate-key',
        name: 'Crate key',
        description: 'Generate a key file for `plugins/EcoCrates/keys/`.',
        getOutputPath: (values) => `plugins/EcoCrates/keys/${deriveFileName(values, 'key')}`,
        initialValues: {
          id: 'demo_key',
          keyItem: 'tripwire_hook unbreaking:1 hide_enchants name:"&aDemo Key"',
          keyLore: '&fUse this key to open\n&fdemonstration crates',
          useCustomItem: false,
          guiEnabled: true,
          guiCrate: 'demo_crate',
          guiItem: 'tripwire_hook unbreaking:1 hide_enchants name:"Demo Key"',
          guiLore: '<g:#56ab2f>Demo Key</g:#a8e063>\n&fYou have %keys% keys\n&fGet more at &astore.example.net',
          guiRow: 2,
          guiColumn: 3,
          rightClickPreviews: true,
          leftClickOpens: true,
          shiftLeftClickMessage: 'Buy a key here! &astore.example.net',
        },
        sections: [
          {
            title: 'Key item',
            fields: [
              { key: 'id', label: 'Key ID', type: 'text', width: 'half' },
              { key: 'keyItem', label: 'Physical key item', type: 'text', width: 'full' },
              { key: 'keyLore', label: 'Key lore', type: 'multiline-list', width: 'full' },
              { key: 'useCustomItem', label: 'Use existing custom item', type: 'switch', width: 'half', help: 'If enabled, key lore is not applied.' },
            ],
          },
          {
            title: '/keys GUI',
            fields: [
              { key: 'guiEnabled', label: 'Show in /keys GUI', type: 'switch', width: 'half' },
              { key: 'guiCrate', label: 'Crate to preview', type: 'text', width: 'half' },
              { key: 'guiItem', label: 'GUI item', type: 'text', width: 'full' },
              { key: 'guiLore', label: 'GUI lore', type: 'multiline-list', width: 'full' },
              { key: 'guiRow', label: 'Row', type: 'number', width: 'half' },
              { key: 'guiColumn', label: 'Column', type: 'number', width: 'half' },
              { key: 'rightClickPreviews', label: 'Right-click previews', type: 'switch', width: 'half' },
              { key: 'leftClickOpens', label: 'Left-click opens', type: 'switch', width: 'half' },
              { key: 'shiftLeftClickMessage', label: 'Shift-left-click messages', type: 'multiline-list', width: 'full' },
            ],
          },
        ],
        toConfig: (values) => ({
          item: values.keyItem,
          lore: linesToArray(values.keyLore),
          'use-custom-item': values.useCustomItem,
          keygui: {
            enabled: values.guiEnabled,
            crate: values.guiCrate,
            item: values.guiItem,
            lore: linesToArray(values.guiLore),
            row: Number(values.guiRow),
            column: Number(values.guiColumn),
            'right-click-previews': values.rightClickPreviews,
            'left-click-opens': values.leftClickOpens,
            'shift-left-click-message': linesToArray(values.shiftLeftClickMessage),
          },
        }),
      },
    ],
  };

export default plugin;
