import {
  buildConditions,
  buildEffects,
  cleanObject,
  deriveFileName,
  linesToArray,
} from '../../lib/schema.js';
import { buildXpMethods, conditionField, effectField, xpMethodsField } from '../_helpers.js';

const plugin = {
    id: 'EcoQuests',
    name: 'EcoQuests',
    group: 'Progression',
    accent: '#6c7c3b',
    requires: ['eco'],
    uses: ['libreforge'],
    description: 'Create quests with tasks, GUI presence, start conditions, and completion rewards.',
    reference: [
      'Quest files are a compact combination of tasks, reward text, and start gating.',
      'Reset time, auto-start behavior, and the task list define the core player loop.',
    ],
    templates: [
      {
        id: 'quest-config',
        name: 'Quest',
        description: 'Generate a quest file for `plugins/EcoQuests/quests/`.',
        getOutputPath: (values) => `plugins/EcoQuests/quests/${deriveFileName(values, 'quest')}`,
        initialValues: {
          id: 'traveller',
          name: 'Traveller',
          description: '&7Stretch your legs and explore.',
          guiEnabled: true,
          guiAlways: false,
          guiItem: 'paper',
          resetTime: -1,
          tasks: [{ task: 'move', xp: 1000 }],
          taskAmount: -1,
          rewardMessages: '&8» &r&f+2 %ecoskills_defense_name%',
          rewards: [],
          startEffects: [],
          startConditions: [],
          autoStart: true,
          announceStart: false,
        },
        sections: [
          {
            title: 'Quest shell',
            fields: [
              { key: 'id', label: 'Quest ID', type: 'text', width: 'half' },
              { key: 'name', label: 'Quest name', type: 'text', width: 'half' },
              { key: 'description', label: 'Description', type: 'text', width: 'half' },
              { key: 'resetTime', label: 'Reset time (minutes, -1 = never)', type: 'number', width: 'half' },
              { key: 'guiEnabled', label: 'Show in GUI', type: 'switch', width: 'half' },
              { key: 'guiAlways', label: 'Always show in GUI', type: 'switch', width: 'half' },
              { key: 'guiItem', label: 'GUI item', type: 'text', width: 'full' },
              { key: 'autoStart', label: 'Auto-start', type: 'switch', width: 'half' },
              { key: 'announceStart', label: 'Announce on start', type: 'switch', width: 'half' },
            ],
          },
          {
            title: 'Tasks and rewards',
            fields: [
              {
                key: 'tasks',
                label: 'Tasks',
                type: 'collection',
                width: 'full',
                addLabel: 'Add task',
                fields: [
                  { key: 'task', label: 'Task ID', type: 'text' },
                  { key: 'xp', label: 'XP requirement', type: 'number' },
                ],
              },
              { key: 'taskAmount', label: 'Task amount (-1 = all)', type: 'number', width: 'half', help: 'For resettable quests, how many tasks to randomly pick.' },
              { key: 'rewardMessages', label: 'Reward messages', type: 'multiline-list', width: 'full' },
              effectField('rewards', 'Completion rewards'),
            ],
          },
          {
            title: 'Start behavior',
            fields: [effectField('startEffects', 'Start effects'), conditionField('startConditions', 'Start conditions')],
          },
        ],
        toConfig: (values) => ({
          name: values.name,
          description: values.description,
          gui: {
            enabled: values.guiEnabled,
            always: values.guiAlways,
            item: values.guiItem,
          },
          'reset-time': Number(values.resetTime),
          tasks: cleanObject(
            (values.tasks ?? []).map((task) => ({
              task: task.task,
              xp: Number(task.xp),
            })),
          ),
          'task-amount': Number(values.taskAmount),
          'reward-messages': linesToArray(values.rewardMessages),
          'announce-start': values.announceStart,
          rewards: buildEffects(values.rewards),
          'start-effects': buildEffects(values.startEffects),
          'start-conditions': buildConditions(values.startConditions),
          'auto-start': values.autoStart,
        }),
      },
      {
        id: 'quest-task',
        name: 'Task',
        description: 'Generate a task file for `plugins/EcoQuests/tasks/`. Tasks are referenced by quest configs.',
        getOutputPath: (values) => `plugins/EcoQuests/tasks/${deriveFileName(values, 'task')}`,
        initialValues: {
          id: 'break_100_stone',
          description: '&fBreak stone blocks (&a%xp%&8/&a%required-xp%&f)',
          xpMethods: [
            { trigger: 'mine_block', multiplier: '1', filtersText: 'blocks: stone' },
          ],
          onComplete: [
            { id: 'send_message', triggers: '', argsText: 'message: "Task Completed!"', filtersText: '', mutatorsText: '' },
          ],
        },
        sections: [
          {
            title: 'Task shell',
            fields: [
              { key: 'id', label: 'Task ID', type: 'text', width: 'half' },
              { key: 'description', label: 'Description', type: 'text', width: 'full', help: 'Use %xp% and %required-xp% placeholders.' },
            ],
          },
          {
            title: 'XP gain',
            fields: [xpMethodsField()],
          },
          {
            title: 'Completion',
            fields: [effectField('onComplete', 'On-complete effects')],
          },
        ],
        toConfig: (values) => ({
          description: values.description,
          'xp-gain-methods': buildXpMethods(values.xpMethods),
          'on-complete': buildEffects(values.onComplete),
        }),
      },
    ],
  };

export default plugin;
