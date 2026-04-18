import {
  deriveFileName,
} from '../../lib/schema.js';
import { buildTierRewards } from '../_helpers.js';

const plugin = {
    id: 'EcoBattlepass',
    name: 'EcoBattlepass',
    group: 'Progression',
    accent: '#89651a',
    requires: ['eco'],
    uses: ['libreforge'],
    description: 'Create battlepass tracks with tier formulas, schedule windows, and tier reward paths.',
    reference: [
      'Battlepasses combine a time window with tier XP scaling and tier reward declarations.',
      'Quest and reward files still exist separately; this builder focuses on the main battlepass track file.',
    ],
    templates: [
      {
        id: 'battlepass-track',
        name: 'Battlepass track',
        description: 'Build a seasonal pass file for `plugins/EcoBattlepass/battlepasses/`.',
        getOutputPath: (values) => `plugins/EcoBattlepass/battlepasses/${deriveFileName(values, 'battlepass')}`,
        initialValues: {
          id: 'season_one',
          name: '&6Season One',
          xpFormula: '1.5 * %level% + 5',
          maxTier: 100,
          command: 'battlepass',
          premiumPermission: 'example.pass.premium',
          battlepassStart: '2026-01-01 00:00',
          battlepassEnd: '2026-03-31 23:59',
          tiers: [
            { tier: 1, freeRewards: 'coins_5000', premiumRewards: 'coins_10000,golden_apple_3' },
          ],
        },
        sections: [
          {
            title: 'Schedule',
            fields: [
              { key: 'id', label: 'Battlepass ID', type: 'text', width: 'half' },
              { key: 'name', label: 'Battlepass name', type: 'text', width: 'half' },
              { key: 'xpFormula', label: 'Tier XP formula', type: 'text', width: 'half' },
              { key: 'maxTier', label: 'Max tier', type: 'number', width: 'half' },
              { key: 'command', label: 'Open command', type: 'text', width: 'half' },
              { key: 'premiumPermission', label: 'Premium permission', type: 'text', width: 'half' },
              { key: 'battlepassStart', label: 'Start date', type: 'text', width: 'half' },
              { key: 'battlepassEnd', label: 'End date', type: 'text', width: 'half' },
            ],
          },
          {
            title: 'Tier rewards',
            fields: [
              {
                key: 'tiers',
                label: 'Tiers',
                type: 'collection',
                width: 'full',
                addLabel: 'Add tier',
                fields: [
                  { key: 'tier', label: 'Tier', type: 'number' },
                  { key: 'freeRewards', label: 'Free reward IDs', type: 'text' },
                  { key: 'premiumRewards', label: 'Premium reward IDs', type: 'text' },
                ],
              },
            ],
          },
        ],
        toConfig: (values) => ({
          name: values.name,
          battlepass: {
            'xp-formula': values.xpFormula,
            'max-tier': Number(values.maxTier),
            command: values.command,
            'premium-permission': values.premiumPermission,
            'battlepass-start': values.battlepassStart,
            'battlepass-end': values.battlepassEnd,
          },
          tiers: buildTierRewards(values.tiers),
        }),
      },
    ],
  };

export default plugin;
