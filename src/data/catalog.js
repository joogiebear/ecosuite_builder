import eco from './plugins/eco.js';
import libreforge from './plugins/libreforge.js';
import Actions from './plugins/Actions.js';
import Reforges from './plugins/Reforges.js';
import StatTrackers from './plugins/StatTrackers.js';
import Talismans from './plugins/Talismans.js';
import EcoShop from './plugins/EcoShop.js';
import EcoSkills from './plugins/EcoSkills.js';
import EcoPets from './plugins/EcoPets.js';
import EcoQuests from './plugins/EcoQuests.js';
import EcoScrolls from './plugins/EcoScrolls.js';
import EcoJobs from './plugins/EcoJobs.js';
import EcoMenus from './plugins/EcoMenus.js';
import EcoMobs from './plugins/EcoMobs.js';
import EcoBits from './plugins/EcoBits.js';
import EcoCrates from './plugins/EcoCrates.js';
import EcoEnchants from './plugins/EcoEnchants.js';
import EcoItems from './plugins/EcoItems.js';
import Boosters from './plugins/Boosters.js';
import EcoArmor from './plugins/EcoArmor.js';
import EcoBattlepass from './plugins/EcoBattlepass.js';

const PLUGIN_DOCS = {
  eco: 'https://plugins.auxilor.io/all-plugins/eco',
  libreforge: 'https://plugins.auxilor.io/effects/configuring-an-effect',
  Actions: 'https://plugins.auxilor.io/actions',
  Reforges: 'https://plugins.auxilor.io/reforges',
  StatTrackers: 'https://plugins.auxilor.io/stattrackers',
  Talismans: 'https://plugins.auxilor.io/talismans',
  EcoShop: 'https://plugins.auxilor.io/ecoshop',
  EcoSkills: 'https://plugins.auxilor.io/ecoskills',
  EcoPets: 'https://plugins.auxilor.io/ecopets',
  EcoQuests: 'https://plugins.auxilor.io/ecoquests',
  EcoScrolls: 'https://plugins.auxilor.io/ecoscrolls',
  EcoJobs: 'https://plugins.auxilor.io/ecojobs',
  EcoMenus: 'https://plugins.auxilor.io/ecomenus',
  EcoMobs: 'https://plugins.auxilor.io/ecomobs',
  EcoBits: 'https://plugins.auxilor.io/ecobits',
  EcoCrates: 'https://plugins.auxilor.io/ecocrates',
  EcoEnchants: 'https://plugins.auxilor.io/ecoenchants',
  EcoItems: 'https://plugins.auxilor.io/ecoitems',
  Boosters: 'https://plugins.auxilor.io/boosters',
  EcoArmor: 'https://plugins.auxilor.io/ecoarmor',
  EcoBattlepass: 'https://plugins.auxilor.io/ecobattlepass',
};

const PLUGIN_SOURCE = {
  eco: 'https://github.com/Auxilor/eco',
  libreforge: 'https://github.com/Auxilor/libreforge',
  Actions: 'https://github.com/Auxilor/Actions',
  Reforges: 'https://github.com/Auxilor/Reforges',
  StatTrackers: 'https://github.com/Auxilor/StatTrackers',
  Talismans: 'https://github.com/Auxilor/Talismans',
  EcoShop: 'https://github.com/Auxilor/EcoShop',
  EcoSkills: 'https://github.com/Auxilor/EcoSkills',
  EcoPets: 'https://github.com/Auxilor/EcoPets',
  EcoQuests: 'https://github.com/Auxilor/EcoQuests',
  EcoScrolls: 'https://github.com/Auxilor/EcoScrolls',
  EcoJobs: 'https://github.com/Auxilor/EcoJobs',
  EcoMenus: 'https://github.com/Auxilor/EcoMenus',
  EcoMobs: 'https://github.com/Auxilor/EcoMobs',
  EcoBits: 'https://github.com/Auxilor/EcoBits',
  EcoCrates: 'https://github.com/Auxilor/EcoCrates',
  EcoEnchants: 'https://github.com/Auxilor/EcoEnchants',
  EcoItems: 'https://github.com/Auxilor/EcoItems',
  Boosters: 'https://github.com/Auxilor/Boosters',
  EcoArmor: 'https://github.com/Auxilor/EcoArmor',
  EcoBattlepass: 'https://github.com/Auxilor/EcoBattlepass',
};

export function getPluginDocsUrl(pluginId) {
  return PLUGIN_DOCS[pluginId];
}

export function getPluginSourceUrl(pluginId) {
  return PLUGIN_SOURCE[pluginId];
}

export const groupOrder = [
  'Core Systems',
  'Items and Equipment',
  'Progression',
  'Economy and Utility',
  'Mobs and World',
];

export const pluginCatalog = [
  eco,
  libreforge,
  Actions,
  Reforges,
  StatTrackers,
  Talismans,
  EcoShop,
  EcoSkills,
  EcoPets,
  EcoQuests,
  EcoScrolls,
  EcoJobs,
  EcoMenus,
  EcoMobs,
  EcoBits,
  EcoCrates,
  EcoEnchants,
  EcoItems,
  Boosters,
  EcoArmor,
  EcoBattlepass,
];
