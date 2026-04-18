import {
  buildEffects,
  deriveFileName,
  linesToArray,
} from '../../lib/schema.js';
import { clampNumber } from '../../lib/util.js';
import { buildMenuSlots, effectField } from '../_helpers.js';

const plugin = {
    id: 'EcoMenus',
    name: 'EcoMenus',
    group: 'Economy and Utility',
    accent: '#4d6a82',
    requires: ['eco'],
    uses: ['libreforge'],
    description: 'Create menu shells with slot actions, page masks, open and close effects, and command bindings.',
    reference: [
      'EcoMenus is basically a UI framework over libreforge actions.',
      'Most productive configs start with the shell, then layer in slot actions and conditional overlays.',
    ],
    templates: [
      {
        id: 'menu-config',
        name: 'Menu',
        description: 'Generate a menu with one default page and editable click slots.',
        getOutputPath: (values) => `plugins/EcoMenus/menus/${deriveFileName(values, 'menu')}`,
        initialValues: {
          id: 'example_menu',
          title: 'Example GUI',
          command: 'examplemenu',
          rows: 6,
          pageCount: 1,
          cannotOpenMessages: '&cYou cannot open this menu!',
          openEffects: [],
          closeEffects: [],
          slots: [
            {
              item: 'barrier',
              name: '&cClose',
              lore: '',
              row: 6,
              column: 5,
              page: 1,
              clickActionType: 'close_inventory',
              clickActionValue: '',
            },
          ],
        },
        sections: [
          {
            title: 'Menu shell',
            fields: [
              { key: 'id', label: 'Menu ID', type: 'text', width: 'half' },
              { key: 'title', label: 'Title', type: 'text', width: 'half' },
              { key: 'command', label: 'Command', type: 'text', width: 'half' },
              { key: 'rows', label: 'Rows', type: 'number', width: 'half' },
              { key: 'cannotOpenMessages', label: 'Cannot-open messages', type: 'multiline-list', width: 'full' },
            ],
          },
          {
            title: 'Slot actions',
            fields: [
              {
                key: 'slots',
                label: 'Slots',
                type: 'collection',
                width: 'full',
                addLabel: 'Add slot',
                fields: [
                  { key: 'item', label: 'Item', type: 'text' },
                  { key: 'name', label: 'Name', type: 'text' },
                  { key: 'lore', label: 'Lore', type: 'textarea' },
                  { key: 'row', label: 'Row', type: 'number' },
                  { key: 'column', label: 'Column', type: 'number' },
                  { key: 'page', label: 'Page', type: 'number' },
                  { key: 'clickActionType', label: 'Click action', type: 'select', options: ['none', 'close_inventory', 'run_command', 'open_menu', 'send_message'] },
                  { key: 'clickActionValue', label: 'Action value', type: 'text' },
                ],
              },
            ],
          },
          {
            title: 'Open and close logic',
            fields: [effectField('openEffects', 'Open effects'), effectField('closeEffects', 'Close effects')],
          },
        ],
        toConfig: (values) => ({
          title: values.title,
          command: values.command,
          rows: Number(values.rows),
          'cannot-open-messages': linesToArray(values.cannotOpenMessages),
          'open-effects': buildEffects(values.openEffects),
          'close-effects': buildEffects(values.closeEffects),
          pages: Array.from({ length: clampNumber(values.pageCount, 1, 9, 1) }, (_, index) => ({
            page: index + 1,
          })),
          slots: buildMenuSlots(values.slots),
        }),
      },
    ],
  };

export default plugin;
