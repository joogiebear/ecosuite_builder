import {
  autoGrid,
  buildConditions,
  cleanObject,
  csvToArray,
  deriveFileName,
  linesToArray,
  parseKeyValueText,
} from '../../lib/schema.js';

const plugin = {
    id: 'EcoShop',
    name: 'EcoShop',
    group: 'Economy and Utility',
    accent: '#4f806f',
    requires: ['eco'],
    uses: ['libreforge'],
    description: 'Create shop hub files with commands, category layout, sounds, and optional direct-category routing.',
    reference: [
      'The shop file is mostly GUI scaffolding around category IDs.',
      'This builder is best for hub shops or single-category direct shops that you will flesh out with category files afterward.',
    ],
    templates: [
      {
        id: 'shop-config',
        name: 'Shop',
        description: 'Generate a category hub or direct-category shop shell.',
        getOutputPath: (values) => `plugins/EcoShop/shops/${deriveFileName(values, 'shop')}`,
        initialValues: {
          id: 'demoshop',
          title: 'Demo Shop',
          command: 'demoshop',
          rows: 3,
          categoryIds: 'example,example_2',
          directCategory: '',
          forwardsArrowItem: 'arrow name:"&fNext Page"',
          forwardsArrowRow: 6,
          forwardsArrowColumn: 6,
          backwardsArrowItem: 'arrow name:"&fPrevious Page"',
          backwardsArrowRow: 6,
          backwardsArrowColumn: 4,
          maskItem1: 'gray_stained_glass_pane',
          maskItem2: 'black_stained_glass_pane',
          maskPattern: '222222222\n211111112\n211000112\n211000112\n211111112\n222222222',
          customSlots: [],
          buyBroadcastsEnabled: true,
          buyBroadcastMessage: '&b&lShop&r &8»&r %player%&r&f has bought &r%item%&r&ffrom the shop!',
          buyBroadcastSoundEnabled: true,
          buyBroadcastSound: 'ui_toast_challenge_complete',
          buyBroadcastSoundPitch: 1.5,
          buyBroadcastSoundVolume: 2,
          buyBroadcastSoundCategory: 'players',
          clickSoundEnabled: true,
          clickSound: 'block_stone_button_click_on',
          clickSoundPitch: 1,
          clickSoundVolume: 1,
          clickSoundCategory: 'UI',
          buySoundEnabled: true,
          buySound: 'entity_player_levelup',
          buySoundPitch: 2,
          buySoundVolume: 1,
          buySoundCategory: 'players',
          sellSoundEnabled: true,
          sellSound: 'block_amethyst_block_place',
          sellSoundPitch: 1.5,
          sellSoundVolume: 1,
          sellSoundCategory: 'players',
        },
        sections: [
          {
            title: 'Shop shell',
            fields: [
              { key: 'id', label: 'Shop ID', type: 'text', width: 'half' },
              { key: 'title', label: 'Title', type: 'text', width: 'half' },
              { key: 'command', label: 'Command', type: 'text', width: 'half' },
              { key: 'rows', label: 'Rows', type: 'number', width: 'half' },
              { key: 'directCategory', label: 'Direct category ID', type: 'text', width: 'half', help: 'If set, shop skips the hub and opens this category directly.' },
              { key: 'categoryIds', label: 'Category IDs', type: 'text', width: 'full', help: 'Comma-separated. Used when direct-category is empty.' },
            ],
          },
          {
            title: 'Arrows and mask',
            fields: [
              { key: 'forwardsArrowItem', label: 'Next-page arrow item', type: 'text', width: 'full' },
              { key: 'forwardsArrowRow', label: 'Next arrow row', type: 'number', width: 'half' },
              { key: 'forwardsArrowColumn', label: 'Next arrow column', type: 'number', width: 'half' },
              { key: 'backwardsArrowItem', label: 'Previous-page arrow item', type: 'text', width: 'full' },
              { key: 'backwardsArrowRow', label: 'Previous arrow row', type: 'number', width: 'half' },
              { key: 'backwardsArrowColumn', label: 'Previous arrow column', type: 'number', width: 'half' },
              { key: 'maskItem1', label: 'Mask item 1', type: 'text', width: 'half' },
              { key: 'maskItem2', label: 'Mask item 2', type: 'text', width: 'half' },
              { key: 'maskPattern', label: 'Mask pattern', type: 'multiline-list', width: 'full' },
            ],
          },
          {
            title: 'Custom GUI slots',
            fields: [
              {
                key: 'customSlots',
                label: 'Custom slots',
                type: 'collection',
                width: 'full',
                addLabel: 'Add custom slot',
                help: 'Custom GUI slot overrides. See https://plugins.auxilor.io/all-plugins/custom-gui-slots',
                fields: [
                  { key: 'id', label: 'ID', type: 'text', width: 'half' },
                  { key: 'row', label: 'Row', type: 'number', width: 'half' },
                  { key: 'column', label: 'Column', type: 'number', width: 'half' },
                  { key: 'item', label: 'Item', type: 'text', width: 'full' },
                  { key: 'name', label: 'Name', type: 'text', width: 'full' },
                  { key: 'lore', label: 'Lore', type: 'multiline-list', width: 'full' },
                ],
              },
            ],
          },
          {
            title: 'Buy broadcasts',
            fields: [
              { key: 'buyBroadcastsEnabled', label: 'Broadcast purchases', type: 'switch', width: 'half' },
              { key: 'buyBroadcastMessage', label: 'Broadcast message', type: 'text', width: 'full' },
              { key: 'buyBroadcastSoundEnabled', label: 'Broadcast sound', type: 'switch', width: 'half' },
              { key: 'buyBroadcastSound', label: 'Sound ID', type: 'text', width: 'half' },
              { key: 'buyBroadcastSoundPitch', label: 'Pitch', type: 'number', width: 'half' },
              { key: 'buyBroadcastSoundVolume', label: 'Volume', type: 'number', width: 'half' },
              { key: 'buyBroadcastSoundCategory', label: 'Category', type: 'text', width: 'half' },
            ],
          },
          {
            title: 'Sounds',
            fields: [
              { key: 'clickSoundEnabled', label: 'Click sound', type: 'switch', width: 'half' },
              { key: 'clickSound', label: 'Click sound ID', type: 'text', width: 'half' },
              { key: 'clickSoundPitch', label: 'Click pitch', type: 'number', width: 'half' },
              { key: 'clickSoundVolume', label: 'Click volume', type: 'number', width: 'half' },
              { key: 'clickSoundCategory', label: 'Click category', type: 'text', width: 'half' },
              { key: 'buySoundEnabled', label: 'Buy sound', type: 'switch', width: 'half' },
              { key: 'buySound', label: 'Buy sound ID', type: 'text', width: 'half' },
              { key: 'buySoundPitch', label: 'Buy pitch', type: 'number', width: 'half' },
              { key: 'buySoundVolume', label: 'Buy volume', type: 'number', width: 'half' },
              { key: 'buySoundCategory', label: 'Buy category', type: 'text', width: 'half' },
              { key: 'sellSoundEnabled', label: 'Sell sound', type: 'switch', width: 'half' },
              { key: 'sellSound', label: 'Sell sound ID', type: 'text', width: 'half' },
              { key: 'sellSoundPitch', label: 'Sell pitch', type: 'number', width: 'half' },
              { key: 'sellSoundVolume', label: 'Sell volume', type: 'number', width: 'half' },
              { key: 'sellSoundCategory', label: 'Sell category', type: 'text', width: 'half' },
            ],
          },
        ],
        toConfig: (values) => {
          const categoryIds = csvToArray(values.categoryIds);
          const layout = autoGrid(categoryIds, { startRow: 3, startColumn: 3, columns: 3 });

          const customSlots = cleanObject(
            (values.customSlots ?? []).map((slot) =>
              cleanObject({
                id: slot.id,
                row: slot.row ? Number(slot.row) : undefined,
                column: slot.column ? Number(slot.column) : undefined,
                item: slot.item,
                name: slot.name,
                lore: linesToArray(slot.lore),
              }),
            ),
          );

          const soundBlock = (enabled, sound, pitch, volume, category) => ({
            enabled,
            sound,
            pitch: Number(pitch),
            volume: Number(volume),
            category,
          });

          return cleanObject({
            title: values.title,
            command: values.command,
            rows: Number(values.rows),
            'direct-category': values.directCategory,
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
            'buy-broadcasts': {
              enabled: values.buyBroadcastsEnabled,
              message: values.buyBroadcastMessage,
              sound: soundBlock(
                values.buyBroadcastSoundEnabled,
                values.buyBroadcastSound,
                values.buyBroadcastSoundPitch,
                values.buyBroadcastSoundVolume,
                values.buyBroadcastSoundCategory,
              ),
            },
            'click-sound': soundBlock(
              values.clickSoundEnabled,
              values.clickSound,
              values.clickSoundPitch,
              values.clickSoundVolume,
              values.clickSoundCategory,
            ),
            'buy-sound': soundBlock(
              values.buySoundEnabled,
              values.buySound,
              values.buySoundPitch,
              values.buySoundVolume,
              values.buySoundCategory,
            ),
            'sell-sound': soundBlock(
              values.sellSoundEnabled,
              values.sellSound,
              values.sellSoundPitch,
              values.sellSoundVolume,
              values.sellSoundCategory,
            ),
            pages: values.directCategory
              ? undefined
              : [
                  {
                    page: 1,
                    mask: {
                      items: [values.maskItem1, values.maskItem2].filter(Boolean),
                      pattern: linesToArray(values.maskPattern),
                    },
                    categories: layout,
                    'custom-slots': customSlots,
                  },
                ],
          });
        },
      },
      {
        id: 'shop-category',
        name: 'Shop category',
        description: 'Generate a category file for `plugins/EcoShop/categories/`. Referenced by shops.',
        getOutputPath: (values) => `plugins/EcoShop/categories/${deriveFileName(values, 'category')}`,
        initialValues: {
          id: 'example_category',
          categoryItem: 'diamond_sword name:"&fExample Category"',
          categoryLore: '',
          permission: '',
          guiRows: 6,
          guiTitle: 'Demo Category',
          forwardsArrowItem: 'arrow name:"&fNext Page"',
          forwardsArrowRow: 6,
          forwardsArrowColumn: 6,
          backwardsArrowItem: 'arrow name:"&fPrevious Page"',
          backwardsArrowRow: 6,
          backwardsArrowColumn: 4,
          maskItem1: 'gray_stained_glass_pane',
          maskItem2: 'black_stained_glass_pane',
          maskPattern: '222222222\n211111112\n211111112\n211111112\n211111112\n222222222',
          items: [
            {
              id: 'example_item',
              item: 'ecoitems:enchanted_diamond',
              name: '&b<gradient:#2193b0>Example</gradient:#6dd5ed>',
              row: 3,
              column: 4,
              page: 1,
              buyValue: '500',
              buyType: 'coins',
              buyDisplay: '$%value%',
              buyAmount: 1,
              buyMaxAtOnce: '',
              buyLimit: '',
              buyRequire: '',
              sellValue: '100',
              sellType: 'coins',
              sellDisplay: '$%value%',
              sellLimit: '',
              sellGlobalLimit: '',
              buyEffectsText: '',
              buyConditions: [],
              sellConditions: [],
              loreText: '',
            },
          ],
        },
        sections: [
          {
            title: 'Category shell',
            fields: [
              { key: 'id', label: 'Category ID', type: 'text', width: 'half' },
              { key: 'permission', label: 'Access permission', type: 'text', width: 'half' },
              { key: 'categoryItem', label: 'Category tile item', type: 'text', width: 'full', help: 'Shown in the parent shop.' },
              { key: 'categoryLore', label: 'Category tile lore', type: 'multiline-list', width: 'full' },
            ],
          },
          {
            title: 'GUI',
            fields: [
              { key: 'guiRows', label: 'Rows', type: 'number', width: 'half' },
              { key: 'guiTitle', label: 'GUI title', type: 'text', width: 'half' },
              { key: 'forwardsArrowItem', label: 'Next-page arrow item', type: 'text', width: 'full' },
              { key: 'forwardsArrowRow', label: 'Next arrow row', type: 'number', width: 'half' },
              { key: 'forwardsArrowColumn', label: 'Next arrow column', type: 'number', width: 'half' },
              { key: 'backwardsArrowItem', label: 'Previous-page arrow item', type: 'text', width: 'full' },
              { key: 'backwardsArrowRow', label: 'Previous arrow row', type: 'number', width: 'half' },
              { key: 'backwardsArrowColumn', label: 'Previous arrow column', type: 'number', width: 'half' },
              { key: 'maskItem1', label: 'Mask item 1', type: 'text', width: 'half' },
              { key: 'maskItem2', label: 'Mask item 2', type: 'text', width: 'half' },
              { key: 'maskPattern', label: 'Mask pattern', type: 'multiline-list', width: 'full' },
            ],
          },
          {
            title: 'Items',
            fields: [
              {
                key: 'items',
                label: 'Shop items',
                type: 'collection',
                width: 'full',
                addLabel: 'Add item',
                fields: [
                  { key: 'id', label: 'Item ID', type: 'text', width: 'half' },
                  { key: 'item', label: 'Item lookup', type: 'text', width: 'full' },
                  { key: 'name', label: 'Display name', type: 'text', width: 'full' },
                  { key: 'loreText', label: 'Display lore', type: 'multiline-list', width: 'full' },
                  { key: 'page', label: 'Page', type: 'number', width: 'half' },
                  { key: 'row', label: 'Row', type: 'number', width: 'half' },
                  { key: 'column', label: 'Column', type: 'number', width: 'half' },
                  { key: 'buyValue', label: 'Buy price', type: 'text', width: 'half', help: 'Leave blank to disable buying.' },
                  { key: 'buyType', label: 'Buy currency', type: 'text', width: 'half' },
                  { key: 'buyDisplay', label: 'Buy display', type: 'text', width: 'half' },
                  { key: 'buyAmount', label: 'Default buy amount', type: 'number', width: 'half' },
                  { key: 'buyMaxAtOnce', label: 'Max at once', type: 'number', width: 'half' },
                  { key: 'buyLimit', label: 'Per-player buy limit', type: 'number', width: 'half' },
                  { key: 'buyRequire', label: 'Buy require expression', type: 'text', width: 'full' },
                  { key: 'buyEffectsText', label: 'Buy effects (one per block)', type: 'textarea', width: 'full', help: 'Use id: <effect> followed by args. Blank line between entries.' },
                  { key: 'sellValue', label: 'Sell price', type: 'text', width: 'half', help: 'Leave blank to disable selling.' },
                  { key: 'sellType', label: 'Sell currency', type: 'text', width: 'half' },
                  { key: 'sellDisplay', label: 'Sell display', type: 'text', width: 'half' },
                  { key: 'sellLimit', label: 'Per-player sell limit', type: 'number', width: 'half' },
                  { key: 'sellGlobalLimit', label: 'Global sell limit', type: 'number', width: 'half' },
                ],
              },
            ],
          },
        ],
        toConfig: (values) => {
          const parseMaybeNumber = (value) => {
            if (value === '' || value === undefined || value === null) return undefined;
            const numeric = Number(value);
            return Number.isNaN(numeric) ? value : numeric;
          };

          const parseEffectBlocks = (text) => {
            const blocks = String(text ?? '').split(/\r?\n\s*\r?\n/).map((block) => block.trim()).filter(Boolean);
            return cleanObject(
              blocks.map((block) => {
                const parsed = parseKeyValueText(block);
                const { id, ...rest } = parsed;
                if (!id) return undefined;
                return cleanObject({
                  id,
                  args: Object.keys(rest).length > 0 ? rest : undefined,
                });
              }),
            );
          };

          const items = cleanObject(
            (values.items ?? []).map((item) => {
              const entry = {
                id: item.id,
                item: item.item,
                name: item.name,
                gui: cleanObject({
                  column: item.column ? Number(item.column) : undefined,
                  row: item.row ? Number(item.row) : undefined,
                  page: item.page ? Number(item.page) : undefined,
                  display: item.loreText
                    ? cleanObject({
                        lore: linesToArray(item.loreText),
                      })
                    : undefined,
                }),
              };

              if (item.buyValue) {
                entry.buy = cleanObject({
                  value: parseMaybeNumber(item.buyValue),
                  type: item.buyType,
                  display: item.buyDisplay,
                  amount: item.buyAmount ? Number(item.buyAmount) : undefined,
                  'max-at-once': item.buyMaxAtOnce ? Number(item.buyMaxAtOnce) : undefined,
                  limit: item.buyLimit ? Number(item.buyLimit) : undefined,
                  require: item.buyRequire,
                  conditions: buildConditions(item.buyConditions),
                });
              }

              if (item.sellValue) {
                entry.sell = cleanObject({
                  value: parseMaybeNumber(item.sellValue),
                  type: item.sellType,
                  display: item.sellDisplay,
                  limit: item.sellLimit ? Number(item.sellLimit) : undefined,
                  'global-limit': item.sellGlobalLimit ? Number(item.sellGlobalLimit) : undefined,
                  conditions: buildConditions(item.sellConditions),
                });
              }

              const buyEffects = parseEffectBlocks(item.buyEffectsText);
              if (buyEffects) {
                entry['buy-effects'] = buyEffects;
              }

              return cleanObject(entry);
            }),
          );

          return {
            item: values.categoryItem,
            lore: linesToArray(values.categoryLore),
            permission: values.permission,
            gui: {
              rows: Number(values.guiRows),
              title: values.guiTitle,
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
                    items: [values.maskItem1, values.maskItem2].filter(Boolean),
                    pattern: linesToArray(values.maskPattern),
                  },
                },
              ],
            },
            items,
          };
        },
      },
    ],
  };

export default plugin;
