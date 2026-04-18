# Generate Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Generate" button to every plugin template that fills the form with a randomized but coherent, server-ready config.

**Architecture:** A new `src/lib/generate.js` module holds curated word/effect/stat pools and a `generate(templateId)` function that returns populated `values` objects matching each template's `initialValues` shape. `App.jsx` gets a single new button and handler. No changes to `catalog.js` — generation logic is decoupled from template definitions.

**Tech Stack:** Plain JS (no new dependencies). Pools are static arrays; randomness via `Math.random()`.

---

### Task 1: Create the generator pools and helpers (`src/lib/generate.js`)

**Files:**
- Create: `src/lib/generate.js`

This file contains:
1. Curated pools of thematic data (weapon names, adjectives, effect IDs, triggers, materials, colors, etc.)
2. Small randomness helpers: `pick`, `pickN`, `randomInt`, `randomFloat`, `randomId`
3. A single exported `generateValues(templateId)` function that dispatches to per-template generators

- [ ] **Step 1: Create `src/lib/generate.js` with pools and helpers**

```js
// ---------- helpers ----------
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, min, max) {
  const count = randomInt(min, max);
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomId(words) {
  return words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).join('_');
}

function randomHexColor() {
  const r = randomInt(40, 220);
  const g = randomInt(40, 220);
  const b = randomInt(40, 220);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ---------- pools ----------

const ADJECTIVES = [
  'Ancient', 'Blazing', 'Crimson', 'Dark', 'Ethereal', 'Frozen', 'Golden',
  'Hallowed', 'Infernal', 'Jade', 'Keen', 'Luminous', 'Mystic', 'Noble',
  'Obsidian', 'Phantom', 'Radiant', 'Shadow', 'Thundering', 'Venomous',
  'Wicked', 'Arcane', 'Brutal', 'Celestial', 'Dire', 'Eldritch', 'Feral',
  'Gilded', 'Hollow', 'Iron', 'Jagged',
];

const WEAPON_NOUNS = [
  'Blade', 'Dagger', 'Edge', 'Fang', 'Glaive', 'Halberd', 'Katana',
  'Lance', 'Maul', 'Pike', 'Rapier', 'Saber', 'Scythe', 'Striker',
  'Talon', 'Warblade', 'Cleaver', 'Reaver', 'Splitter', 'Render',
];

const TALISMAN_NOUNS = [
  'Amulet', 'Charm', 'Pendant', 'Relic', 'Sigil', 'Token', 'Ward',
  'Idol', 'Emblem', 'Totem', 'Brooch', 'Crest', 'Jewel', 'Orb', 'Rune',
];

const PET_NOUNS = [
  'Tiger', 'Phoenix', 'Drake', 'Wolf', 'Panther', 'Hawk', 'Serpent',
  'Griffin', 'Lynx', 'Raven', 'Bear', 'Fox', 'Owl', 'Stag', 'Spider',
];

const MOB_NOUNS = [
  'Soldier', 'Guardian', 'Sentinel', 'Warden', 'Brute', 'Knight',
  'Revenant', 'Wraith', 'Golem', 'Behemoth', 'Colossus', 'Fiend',
];

const SKILL_NOUNS = [
  'Mining', 'Woodcutting', 'Farming', 'Fishing', 'Combat', 'Archery',
  'Alchemy', 'Enchanting', 'Forging', 'Herbalism', 'Excavation', 'Hunting',
];

const JOB_NOUNS = [
  'Miner', 'Lumberjack', 'Farmer', 'Fisher', 'Hunter', 'Brewer',
  'Blacksmith', 'Enchanter', 'Builder', 'Explorer', 'Herbalist', 'Guard',
];

const CURRENCY_NOUNS = [
  'Crystals', 'Shards', 'Tokens', 'Orbs', 'Souls', 'Essence',
  'Fragments', 'Dust', 'Sparks', 'Embers', 'Stars', 'Pearls',
];

const CURRENCY_SYMBOLS = ['✦', '◆', '★', '⬥', '♦', '●', '◈', '✧', '⚡', '❖'];

const GRADIENT_PAIRS = [
  ['#FF6B6B', '#EE5A24'], ['#6C5CE7', '#A29BFE'], ['#00B894', '#55E6C1'],
  ['#FDCB6E', '#E17055'], ['#0984E3', '#74B9FF'], ['#E84393', '#FD79A8'],
  ['#00CEC9', '#81ECEC'], ['#F39C12', '#F1C40F'], ['#E74C3C', '#C0392B'],
  ['#8E44AD', '#9B59B6'], ['#2ECC71', '#27AE60'], ['#1ABC9C', '#16A085'],
];

const MC_COLORS = ['&a', '&b', '&c', '&d', '&e', '&6', '&9', '&5'];

const BASE_ITEMS = {
  sword: ['diamond_sword', 'iron_sword', 'netherite_sword', 'golden_sword'],
  axe: ['diamond_axe', 'iron_axe', 'netherite_axe'],
  bow: ['bow', 'crossbow'],
  pickaxe: ['diamond_pickaxe', 'iron_pickaxe', 'netherite_pickaxe'],
  helmet: ['diamond_helmet', 'iron_helmet', 'netherite_helmet'],
  tool: ['diamond_pickaxe', 'diamond_shovel', 'diamond_hoe'],
  misc: ['compass', 'clock', 'ender_pearl', 'blaze_rod', 'nether_star', 'totem_of_undying'],
};

const EFFECT_IDS = [
  'damage_multiplier', 'defense_multiplier', 'movement_speed_multiplier',
  'crit_multiplier', 'attack_speed_multiplier', 'health_multiplier',
  'give_food', 'regen', 'give_money', 'give_xp', 'potion_effect',
  'hunger_multiplier', 'damage_nearby_entities', 'permanent_potion_effect',
  'mine_radius', 'pull_towards', 'ignite',
];

const COMBAT_TRIGGERS = [
  'melee_attack', 'bow_attack', 'trident_attack', 'take_damage',
  'kill', 'shield_block', 'projectile_hit',
];

const PROGRESSION_TRIGGERS = [
  'break_block', 'mine_block', 'place_block', 'craft_item',
  'smelt_item', 'fish_item', 'brew_item', 'enchant_item',
  'harvest_crop', 'shear_entity', 'breed_entity', 'tame_entity',
];

const ALL_TRIGGERS = [...COMBAT_TRIGGERS, ...PROGRESSION_TRIGGERS];

const CONDITION_IDS = [
  'has_permission', 'in_world', 'is_sneaking', 'is_sprinting',
  'is_flying', 'below_health_percent', 'above_health_percent',
  'in_biome', 'is_night', 'is_day', 'has_potion_effect',
];

const SPAWN_EGG_ITEMS = [
  'zombie_spawn_egg', 'skeleton_spawn_egg', 'evoker_spawn_egg',
  'blaze_spawn_egg', 'wither_skeleton_spawn_egg', 'piglin_brute_spawn_egg',
];

const MOB_TYPES = [
  'zombie', 'skeleton', 'spider', 'blaze', 'wither_skeleton',
  'piglin_brute', 'vindicator', 'evoker', 'ravager', 'enderman',
];

const ARMOR_MATERIALS = ['leather', 'iron', 'diamond', 'netherite'];

const BOSSBAR_COLORS = ['white', 'red', 'yellow', 'green', 'blue', 'purple', 'pink'];

const QUEST_TASKS = [
  'kill', 'mine', 'fish', 'craft', 'move', 'breed', 'trade',
  'enchant', 'smelt', 'harvest', 'build', 'tame',
];

const ENCHANT_TYPES = ['normal', 'special', 'curse'];
const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const ENCHANT_TARGETS = ['sword', 'bow', 'pickaxe', 'axe', 'armor', 'trident', 'helmet'];

const CRATE_NAMES = [
  'Legendary', 'Mythic', 'Ancient', 'Celestial', 'Void', 'Dragon',
  'Astral', 'Titan', 'Arcane', 'Elemental', 'Phantom', 'Royal',
];

const SHOP_NAMES = [
  'General Store', 'Armory', 'Enchanter', 'Alchemist', 'Market',
  'Trading Post', 'Bazaar', 'Merchant', 'Outfitter', 'Supply Depot',
];

// ---------- name builders ----------

function gradientName(text) {
  const [a, b] = pick(GRADIENT_PAIRS);
  return `<gradient:${a.slice(1)}>${text}</gradient:${b.slice(1)}>`;
}

function coloredName(text) {
  return `${pick(MC_COLORS)}${text}`;
}

function themedName(nounPool) {
  return `${pick(ADJECTIVES)} ${pick(nounPool)}`;
}

// ---------- effect / condition builders ----------

function randomEffect(triggerPool = COMBAT_TRIGGERS) {
  const id = pick(EFFECT_IDS);
  const trigger = pick(triggerPool);
  const multiplierValue = randomFloat(0.05, 2.0, 2);
  return {
    id,
    triggers: trigger,
    argsText: `multiplier: ${multiplierValue}`,
    filtersText: '',
  };
}

function randomEffects(count = null, triggerPool = COMBAT_TRIGGERS) {
  const n = count ?? randomInt(1, 3);
  return Array.from({ length: n }, () => randomEffect(triggerPool));
}

function randomCondition() {
  return { id: pick(CONDITION_IDS), argsText: '' };
}

function randomConditions(count = null) {
  if (count === null) {
    return Math.random() < 0.3 ? [randomCondition()] : [];
  }
  return Array.from({ length: count }, () => randomCondition());
}

function xpCurve(levels) {
  const base = randomInt(30, 100);
  const growth = randomFloat(1.2, 1.8, 1);
  return Array.from({ length: levels }, (_, i) =>
    Math.round(base * Math.pow(growth, i))
  ).join('\n');
}

function recipeGrid() {
  const materials = ['diamond', 'emerald', 'gold_ingot', 'iron_ingot', 'amethyst_shard', 'netherite_scrap'];
  const mat = pick(materials);
  const center = pick(['nether_star', 'ender_eye', 'heart_of_the_sea', 'blaze_rod']);
  return `${mat}\n${mat}\n${mat}\n${mat}\n${center}\n${mat}\n${mat}\n${mat}\n${mat}`;
}

// ---------- per-template generators ----------

const generators = {};

// eco core config
generators['eco-core-config'] = () => {
  const handler = pick(['yaml', 'mysql']);
  return {
    dataHandler: handler,
    performDataMigration: true,
    saveInterval: pick([1, 2, 5]),
    autosaveInterval: pick([18000, 36000, 72000]),
    useFastCollatedDrops: true,
    useDisplayFrame: true,
    noUpdateChecker: false,
    useImmediatePlaceholderMath: pick([true, false]),
    playerflow: true,
    enforcePreparingRecipes: false,
    mysqlPrefix: `eco_${randomId([pick(ADJECTIVES).toLowerCase()])}`,
    mysqlConnections: pick([5, 10, 15, 20]),
    mysqlHost: 'localhost',
    mysqlPort: 3306,
    mysqlDatabase: `eco_${pick(['survival', 'skyblock', 'factions', 'prison'])}`,
    mysqlUser: 'eco_user',
    mysqlPassword: 'change_me',
    mongoUrl: '',
    mongoDatabase: 'eco',
    mongoCollection: 'profiles',
  };
};

// libreforge chain
generators['libreforge-chain'] = () => {
  const adj = pick(ADJECTIVES).toLowerCase();
  const noun = pick(['chain', 'combo', 'burst', 'strike', 'pulse']);
  return {
    id: `${adj}_${noun}`,
    effects: randomEffects(randomInt(1, 3)),
  };
};

// action file
generators['action-file'] = () => {
  const adj = pick(ADJECTIVES).toLowerCase();
  const verb = pick(['reward', 'boost', 'heal', 'buff', 'strike']);
  return {
    id: `${adj}_${verb}`,
    enabled: true,
    effects: randomEffects(randomInt(1, 2)),
    conditions: randomConditions(),
  };
};

// reforge
generators['reforge-config'] = () => {
  const name = themedName(WEAPON_NOUNS);
  const id = randomId(name.split(' '));
  const [g1, g2] = pick(GRADIENT_PAIRS);
  return {
    id,
    name: `<gradient:${g1.slice(1)}>${name}</gradient:${g2.slice(1)}>`,
    description: `${pick(MC_COLORS)}+${randomInt(5, 25)}% ${pick(MC_COLORS)}Damage\n${pick(MC_COLORS)}+${randomInt(3, 15)}% ${pick(MC_COLORS)}Crit Chance`,
    targets: pick(['melee', 'ranged', 'armor', 'sword,axe']),
    stoneEnabled: true,
    stoneItem: 'player_head texture:paste_texture_here',
    stoneName: `${coloredName(name)}&f Reforge Stone`,
    stoneLore: '&7Place on the right of the\n&7reforge menu to apply it',
    priceValue: randomInt(5, 50) * 10000,
    priceType: 'coins',
    priceDisplay: '&6$%value%',
    effects: randomEffects(randomInt(1, 3)),
    conditions: randomConditions(),
  };
};

// stat tracker
generators['tracker-config'] = () => {
  const tracked = pick(['Damage Dealt', 'Kills', 'Blocks Mined', 'Arrows Shot', 'Mobs Slain', 'Distance Walked']);
  const id = randomId(tracked.split(' '));
  const trigger = tracked.includes('Damage') ? 'melee_attack'
    : tracked.includes('Kill') || tracked.includes('Mob') ? 'kill'
    : tracked.includes('Block') || tracked.includes('Mine') ? 'break_block'
    : tracked.includes('Arrow') ? 'bow_attack'
    : 'move';
  return {
    id,
    display: `&b${tracked}: %value%`,
    applicableTo: tracked.includes('Arrow') ? 'bow,crossbow' : 'sword,bow,trident,axe',
    counters: [{ trigger, multiplier: '1', filtersText: '' }],
    trackerItem: 'compass max_stack_size:1',
    trackerName: `&eTracker - ${tracked}`,
    trackerLore: `&8Drop this onto an item\n&8to display ${tracked.toLowerCase()}`,
    craftable: true,
    recipe: recipeGrid(),
  };
};

// talisman
generators['talisman-config'] = () => {
  const name = themedName(TALISMAN_NOUNS);
  const id = randomId(name.split(' '));
  const tier = randomInt(1, 3);
  return {
    id: `${id}_${tier}`,
    name: `${coloredName(name)} ${['I', 'II', 'III'][tier - 1]}`,
    description: `&8${pick(['Grants', 'Provides', 'Bestows'])} a passive ${pick(['damage', 'defense', 'speed', 'health', 'crit'])} bonus`,
    higherLevelOf: tier > 1 ? `${id}_${tier - 1}` : '',
    item: 'player_head texture:paste_texture_here',
    craftable: true,
    recipe: recipeGrid(),
    effects: randomEffects(randomInt(1, 2)),
    conditions: randomConditions(),
  };
};

// shop
generators['shop-config'] = () => {
  const name = pick(SHOP_NAMES);
  const id = randomId(name.split(' '));
  const cats = pickN(['weapons', 'armor', 'tools', 'food', 'blocks', 'potions', 'misc', 'rare'], 2, 5);
  return {
    id,
    title: name,
    command: id,
    rows: pick([3, 4, 5, 6]),
    categoryIds: cats.join(','),
    directCategory: '',
    buyBroadcastsEnabled: true,
    clickSoundEnabled: true,
  };
};

// skill
generators['skill-config'] = () => {
  const name = pick(SKILL_NOUNS);
  const id = name.toLowerCase();
  const triggerMap = {
    Mining: 'break_block', Woodcutting: 'break_block', Farming: 'harvest_crop',
    Fishing: 'fish_item', Combat: 'melee_attack', Archery: 'bow_attack',
    Alchemy: 'brew_item', Enchanting: 'enchant_item', Forging: 'smelt_item',
    Herbalism: 'harvest_crop', Excavation: 'break_block', Hunting: 'kill',
  };
  return {
    id,
    name,
    description: `${pick(['Earn XP by', 'Level up through', 'Advance by'])} ${name.toLowerCase()}`,
    guiIcon: 'player_head texture:paste_texture_here',
    guiRow: randomInt(2, 4),
    guiColumn: randomInt(2, 7),
    hideBeforeLevelOne: pick([true, false]),
    xpRequirements: xpCurve(randomInt(5, 10)),
    rewards: [
      { reward: pick(['defense', 'strength', 'speed', 'health']), levels: randomInt(1, 3), startLevel: '', endLevel: '', every: '' },
    ],
    xpMethods: [{ trigger: triggerMap[name] || 'break_block', multiplier: String(randomFloat(0.5, 2.0, 1)), filtersText: '' }],
    levelUpEffects: [],
    placeholders: [{ id: pick(['bonus', 'scaling', 'value']), value: `%level% * ${randomFloat(0.2, 1.0, 1)}` }],
    conditions: randomConditions(),
  };
};

// stat
generators['stat-config'] = () => {
  const stats = ['Defense', 'Strength', 'Speed', 'Health', 'Luck', 'Wisdom'];
  const name = pick(stats);
  const id = name.toLowerCase();
  return {
    id,
    name: `${pick(['&#x1f6e1;', '&#x2694;', '&#x26a1;', '&#x2764;', '&#x2618;', '&#x269b;'])}️ ${name}`,
    placeholder: `%level% * ${randomInt(1, 5)}`,
    description: `&8${pick(['Increases', 'Boosts', 'Enhances'])} ${name.toLowerCase()} by &a%placeholder%%`,
    guiEnabled: true,
    guiIcon: 'player_head texture:paste_texture_here',
    guiRow: randomInt(2, 4),
    guiColumn: randomInt(2, 7),
    effects: randomEffects(1),
    conditions: [],
  };
};

// pet
generators['pet-config'] = () => {
  const animal = pick(PET_NOUNS);
  const adj = pick(ADJECTIVES);
  const id = randomId([adj, animal]);
  return {
    id,
    name: `${coloredName(`${adj} ${animal}`)}`,
    description: `&8&o${pick(['A loyal companion that', 'This creature', 'Your faithful ally'])} boosts ${pick(['damage', 'defense', 'speed', 'luck'])}`,
    levelXpRequirements: xpCurve(randomInt(5, 8)),
    entityTexture: 'paste_texture_here',
    icon: 'player_head texture:paste_texture_here',
    xpMethods: [{ trigger: pick(ALL_TRIGGERS), multiplier: String(randomFloat(0.3, 1.5, 1)), filtersText: '' }],
    levelPlaceholders: [{ id: pick(['bonus', 'scaling']), value: '%level%' }],
    effectsDescription: `&8\u00bb &8Gives a ${pick(MC_COLORS)}+%bonus%%&8 bonus to\n&8${pick(['melee damage', 'defense', 'movement speed', 'health'])}`,
    effects: randomEffects(randomInt(1, 2)),
    conditions: randomConditions(),
  };
};

// quest
generators['quest-config'] = () => {
  const verb = pick(['Slay', 'Gather', 'Explore', 'Craft', 'Discover', 'Harvest', 'Build', 'Trade']);
  const noun = pick(['the Depths', 'Resources', 'the Wilds', 'Rare Items', 'New Lands', 'Materials', 'a Fortress', 'with Villagers']);
  const id = randomId([verb, noun.replace(/^the /, '').replace(/^a /, '')]);
  const task = pick(QUEST_TASKS);
  return {
    id,
    name: `${verb} ${noun}`,
    description: `&7${pick(['Complete this challenge to', 'Your mission is to', 'Prove your worth and'])} earn rewards.`,
    guiEnabled: true,
    guiAlways: false,
    guiItem: pick(['paper', 'book', 'map', 'writable_book', 'compass']),
    resetTime: pick([-1, 1440, 10080]),
    tasks: [{ task, xp: randomInt(100, 5000) }],
    rewardMessages: `&8\u00bb &r&f+${randomInt(1, 5)} ${pick(['Crystals', 'Tokens', 'Skill Points'])}`,
    rewards: [],
    startEffects: [],
    startConditions: [],
    autoStart: pick([true, false]),
  };
};

// scroll
generators['scroll-config'] = () => {
  const adj = pick(ADJECTIVES);
  const name = `${adj} Scroll`;
  const id = randomId([adj, 'scroll']);
  return {
    id,
    name: `&6${name}`,
    maxLevel: randomInt(1, 5),
    maxUses: randomInt(1, 3),
    item: 'paper glint',
    itemName: `&6&l${name}`,
    itemLore: `&7${pick(['An ancient scroll of power', 'Inscribe this onto a weapon', 'A magical inscription'])}`,
    inscriptionPrice: randomInt(5, 50) * 1000,
    inscriptionPriceType: 'coins',
    priceLevelMultiplier: `1 + %level% * ${randomFloat(0.3, 1.0, 1)}`,
    dragAndDrop: true,
    inscriptionTable: true,
    targets: pick(['sword', 'bow', 'pickaxe', 'axe', 'armor']),
    requirements: [],
    lore: `&7This item has been inscribed with\n&6${name}`,
    placeholders: [{ id: 'bonus', value: `%level% * ${randomInt(2, 10)}` }],
    inscriptionEffects: [],
    effects: randomEffects(randomInt(1, 2)),
    conditions: randomConditions(),
  };
};

// job
generators['job-config'] = () => {
  const name = pick(JOB_NOUNS);
  const id = name.toLowerCase();
  const triggerMap = {
    Miner: 'mine_block', Lumberjack: 'break_block', Farmer: 'harvest_crop',
    Fisher: 'fish_item', Hunter: 'kill', Brewer: 'brew_item',
    Blacksmith: 'smelt_item', Enchanter: 'enchant_item', Builder: 'place_block',
    Explorer: 'move', Herbalist: 'harvest_crop', Guard: 'kill',
  };
  return {
    id,
    name: `${coloredName(name)}`,
    description: `&8&o${pick(['Earn a living as a', 'Work hard as a', 'Level up being a'])} ${name.toLowerCase()}`,
    unlockedByDefault: pick([true, false]),
    resetOnQuit: false,
    joinPrice: randomInt(0, 5) * 5000,
    leavePrice: randomInt(1, 5) * 10000,
    levelXpRequirements: xpCurve(randomInt(5, 10)),
    icon: 'player_head texture:paste_texture_here',
    xpMethods: [{ trigger: triggerMap[name] || 'break_block', multiplier: String(randomFloat(0.3, 1.5, 1)), filtersText: '' }],
    effects: randomEffects(randomInt(1, 2)),
    conditions: randomConditions(),
  };
};

// menu
generators['menu-config'] = () => {
  const name = pick(['Hub Menu', 'Server Menu', 'Info Panel', 'Player Menu', 'Warp Menu', 'Help Menu']);
  const id = randomId(name.split(' '));
  const rows = pick([3, 4, 5, 6]);
  return {
    id,
    title: name,
    command: id,
    rows,
    pageCount: 1,
    cannotOpenMessages: '&cYou cannot open this menu!',
    openEffects: [],
    closeEffects: [],
    slots: [
      {
        item: 'barrier',
        name: '&cClose',
        lore: '',
        row: rows,
        column: 5,
        page: 1,
        clickActionType: 'close_inventory',
        clickActionValue: '',
      },
      {
        item: pick(['compass', 'clock', 'book', 'map']),
        name: `${coloredName(pick(['Info', 'Help', 'Guide', 'Navigation']))}`,
        lore: '&7Click for more information',
        row: Math.max(1, rows - 2),
        column: randomInt(2, 8),
        page: 1,
        clickActionType: pick(['run_command', 'send_message']),
        clickActionValue: pick(['help', 'spawn', '&aWelcome!']),
      },
    ],
  };
};

// mob
generators['mob-config'] = () => {
  const adj = pick(ADJECTIVES);
  const noun = pick(MOB_NOUNS);
  const name = `${adj} ${noun}`;
  const id = randomId(name.split(' '));
  const mobType = pick(MOB_TYPES);
  const hp = randomInt(200, 5000);
  const dmg = randomInt(20, 150);
  const color = pick(MC_COLORS);
  return {
    id,
    mob: `${mobType} attack-damage:${dmg} movement-speed:${randomFloat(1.0, 2.5, 1)} follow-range:${randomInt(12, 32)} health:${hp}`,
    category: pick(['common', 'elite', 'boss', 'miniboss']),
    displayName: `${color}${name} &7| ${color}%health%\u2764`,
    hand: `${pick(BASE_ITEMS.sword)} sharpness:${randomInt(1, 5)}`,
    head: pick([`${pick(ARMOR_MATERIALS)}_helmet`, '']),
    chest: pick([`${pick(ARMOR_MATERIALS)}_chestplate`, '']),
    legs: '',
    feet: '',
    bossbarEnabled: true,
    bossbarColor: pick(BOSSBAR_COLORS),
    bossbarStyle: pick(['progress', 'notched_20', 'notched_12']),
    eggEnabled: true,
    eggItem: `${pick(SPAWN_EGG_ITEMS)} unbreaking:1 hide_enchants`,
    eggName: `${color}${name}&f Spawn Egg`,
    eggLore: `&8&oPlace on the ground to\n&8&osummon a ${color}${name}`,
    permanentEffects: [],
    spawnEffects: [],
    deathEffects: [],
    killEffects: [],
  };
};

// mob category
generators['category-config'] = () => {
  const categories = ['elite', 'boss', 'miniboss', 'rare', 'ancient'];
  const id = pick(categories);
  const spawningType = pick(['replace', 'custom', 'none']);
  return {
    id,
    spawningType,
    replaceEntities: pickN(['zombie', 'skeleton', 'spider', 'creeper', 'enderman'], 1, 3).join(','),
    replaceChance: randomInt(1, 15),
    customSpawnTypes: pick(['land', 'water', 'land,water']),
    customChance: randomInt(1, 5),
    persistent: pick([true, false]),
    conditions: randomConditions(),
  };
};

// currency (EcoBits)
generators['currency-config'] = () => {
  const name = pick(CURRENCY_NOUNS);
  const id = name.toLowerCase();
  const symbol = pick(CURRENCY_SYMBOLS);
  return {
    serverId: 'main',
    leaderboardEnabled: true,
    shortcuts: ',k,M,B,T,P,E',
    currencyId: id,
    currencyName: name,
    symbol,
    defaultBalance: pick([0, 100, 500]),
    maxBalance: -1,
    payable: pick([true, false]),
    decimal: pick([true, false]),
    maxDecimals: 2,
    vault: false,
    local: false,
    balanceShorthand: false,
    commands: `${id},eco${id}`,
    format: `&b${symbol}&a%amount% &b%currency%`,
    formatShort: `&b${symbol} %amount%`,
    decimalFormat: '#,##0.00',
    decimalFormatShort: '#,##0.00',
  };
};

// crate
generators['crate-config'] = () => {
  const name = `${pick(CRATE_NAMES)} Crate`;
  const id = randomId(name.split(' '));
  const rewards = pickN(['diamond_sword', 'netherite_ingot', 'elytra', 'enchanted_golden_apple', 'totem_of_undying', 'beacon', 'trident', 'mending_book'], 3, 6);
  return {
    id,
    name,
    roll: pick(['csgo', 'encircle', 'quick']),
    key: `${id}_key`,
    canReroll: pick([true, false]),
    previewRows: pick([4, 5, 6]),
    rewards: rewards.join(','),
    payToOpenEnabled: pick([true, false]),
    payToOpenPrice: randomInt(1, 20) * 5000,
    payToOpenType: 'coins',
    openEffects: [],
    finishEffects: [],
  };
};

// enchantment
generators['enchant-config'] = () => {
  const adj = pick(ADJECTIVES);
  const id = adj.toLowerCase();
  return {
    id,
    displayName: adj,
    description: `${pick(['Deal', 'Gain', 'Grants', 'Adds'])} ${pick(['extra damage', 'bonus defense', 'increased speed', 'life steal', 'critical chance'])} based on level`,
    placeholder: `%level% * ${randomInt(5, 30)}`,
    type: pick(ENCHANT_TYPES),
    targets: pick(ENCHANT_TARGETS),
    conflicts: pick(['sharpness', 'smite', 'bane_of_arthropods', '']),
    required: '',
    rarity: pick(RARITIES),
    maxLevel: randomInt(1, 5),
    tradeable: true,
    discoverable: true,
    enchantable: true,
    effects: randomEffects(randomInt(1, 2)),
    conditions: randomConditions(),
  };
};

// custom item (EcoItems)
generators['custom-item'] = () => {
  const adj = pick(ADJECTIVES);
  const noun = pick(WEAPON_NOUNS);
  const name = `${adj} ${noun}`;
  const id = randomId(name.split(' '));
  const [g1, g2] = pick(GRADIENT_PAIRS);
  const dmg = randomInt(8, 25);
  const spd = randomFloat(1.0, 2.0, 1);
  const itemType = pick(['sword', 'axe']);
  return {
    id,
    baseItem: `${pick(BASE_ITEMS[itemType])} hide_attributes`,
    displayName: `<g:${g1.slice(1)}>${name}</g:${g2.slice(1)}>`,
    lore: `&7Damage: &c${dmg}\u2764\n&7Attack Speed: &c${spd}`,
    craftable: true,
    shapeless: false,
    recipe: recipeGrid(),
    slot: 'mainhand',
    baseDamage: dmg,
    baseAttackSpeed: spd,
    rarity: pick(RARITIES),
    effects: randomEffects(randomInt(1, 2)),
    conditions: randomConditions(),
  };
};

// booster
generators['booster-config'] = () => {
  const multiplier = randomFloat(1.2, 3.0, 1);
  const type = pick(['Sell', 'XP', 'Damage', 'Mining', 'Drop', 'Luck']);
  const name = `${multiplier}x ${type} Multiplier`;
  const id = randomId(name.split(' '));
  return {
    id,
    name,
    duration: pick([36000, 72000, 144000]),
    category: randomId([type.toLowerCase(), 'multiplier']),
    mergeTag: id,
    bossbarEnabled: true,
    bossbarColor: pick(['GREEN', 'BLUE', 'PINK', 'PURPLE', 'RED', 'YELLOW']),
    bossbarStyle: 'SOLID',
    guiItem: 'player_head texture:paste_texture_here',
    guiName: `${coloredName(name)}`,
    guiLore: `&fGives everyone a ${type.toLowerCase()} multiplier\n&fDuration: &a${pick(['30 Minutes', '1 Hour', '2 Hours'])}`,
    guiRow: randomInt(2, 4),
    guiColumn: randomInt(2, 7),
    effects: randomEffects(1),
    activationEffects: [],
    expiryEffects: [],
    conditions: [],
  };
};

// armor set
generators['armor-set'] = () => {
  const adj = pick(ADJECTIVES);
  const id = adj.toLowerCase();
  const material = pick(ARMOR_MATERIALS);
  const color = material === 'leather' ? randomHexColor() : '#303030';
  return {
    id,
    setName: adj,
    baseMaterial: material,
    color,
    tier: 'default',
    lore: `${pick(MC_COLORS)}&l${adj.toUpperCase()} SET BONUS\n&8\u00bb ${pick(MC_COLORS)}${pick(['Deal', 'Take', 'Gain'])} ${randomInt(10, 35)}% ${pick(['more damage', 'less damage', 'more health'])}\n&8&oRequires full set to be worn`,
    advancedLore: `<gradient:f12711>&lADVANCED BONUS</gradient:f5af19>\n&8\u00bb &6${pick(['Take', 'Deal', 'Gain'])} ${randomInt(5, 20)}% ${pick(['less damage', 'more speed', 'more health'])}`,
    effects: randomEffects(randomInt(1, 2)),
    advancedEffects: randomEffects(1),
    partialTwoEffects: [],
    partialThreeEffects: [],
  };
};

// battlepass
generators['battlepass-track'] = () => {
  const season = pick(['One', 'Two', 'Three', 'Four', 'Five', 'Alpha', 'Beta', 'Launch', 'Summer', 'Winter']);
  const id = `season_${season.toLowerCase()}`;
  return {
    id,
    name: `&6Season ${season}`,
    xpFormula: `${randomFloat(1.2, 2.0, 1)} * %level% + ${randomInt(3, 10)}`,
    maxTier: pick([50, 75, 100]),
    command: 'battlepass',
    premiumPermission: `server.pass.premium`,
    battlepassStart: '2026-01-01 00:00',
    battlepassEnd: '2026-06-30 23:59',
    tiers: [
      { tier: 1, freeRewards: 'coins_5000', premiumRewards: 'coins_10000,golden_apple_3' },
      { tier: 5, freeRewards: 'diamond_5', premiumRewards: 'diamond_20,xp_bottle_10' },
      { tier: 10, freeRewards: pick(['iron_sword', 'iron_pickaxe']), premiumRewards: pick(['diamond_sword', 'diamond_pickaxe']) },
    ],
  };
};

// ---------- main export ----------

export function generateValues(templateId) {
  const gen = generators[templateId];
  if (!gen) {
    return null;
  }
  return gen();
}
```

- [ ] **Step 2: Verify the file has no syntax errors**

Run: `cd S:/Codex/AuxilorConfigStudio && npx vite build --mode development 2>&1 | head -5`
Expected: Build starts without import errors (full build not required, just checking syntax)

- [ ] **Step 3: Commit**

```bash
git add src/lib/generate.js
git commit -m "feat: add generator pools and per-template value generators"
```

---

### Task 2: Wire the Generate button into `App.jsx`

**Files:**
- Modify: `src/App.jsx:4` (add import)
- Modify: `src/App.jsx:1137-1139` (add handler after `resetTemplate`)
- Modify: `src/App.jsx:1227-1236` (add button to toolbar)

- [ ] **Step 1: Add the import at the top of App.jsx**

At line 4, after the existing `import { cleanObject, cloneValue } from './lib/schema.js';` line, add:

```js
import { generateValues } from './lib/generate.js';
```

- [ ] **Step 2: Add the `handleGenerate` function**

After the `resetTemplate` function (after line 1139), add:

```js
  function handleGenerate() {
    const generated = generateValues(activeTemplate.id);
    if (generated) {
      setValues(generated);
      setStatus('Random config generated.');
    } else {
      setStatus('No generator available for this template.');
    }
  }
```

- [ ] **Step 3: Add the Generate button to the toolbar**

In the `header-actions-row` div (lines 1227-1237), add the Generate button before the Reset button:

```jsx
            <div className="header-actions-row">
              <button type="button" className="secondary-button" onClick={handleGenerate}>
                Generate
              </button>
              <button type="button" className="secondary-button" onClick={resetTemplate}>
                Reset
              </button>
              <button type="button" className="ghost-button" onClick={handleCopy}>
                Copy YAML
              </button>
              <button type="button" className="primary-button" onClick={handleExport}>
                Export
              </button>
            </div>
```

- [ ] **Step 4: Run the dev server and test**

Run: `cd S:/Codex/AuxilorConfigStudio && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add Generate button to toolbar for random config generation"
```

---

### Task 3: Manual smoke test across plugin types

Test the Generate button on representative plugins from each group to confirm it produces valid YAML.

- [ ] **Step 1: Start the dev server**

Run: `cd S:/Codex/AuxilorConfigStudio && npm run dev`

- [ ] **Step 2: Test content plugins**

In the browser, for each of these plugins, select the plugin, click Generate, and verify:
1. Form fields populate with themed values (not empty, not placeholder text)
2. YAML preview updates and shows valid content
3. No console errors

Test list:
- EcoItems > Custom item (should show a themed weapon name, damage, recipe)
- EcoEnchants > Enchantment (should show a named enchant with rarity and targets)
- Talismans > Talisman (should show themed talisman with tier)
- EcoPets > Pet (should show named pet with XP curve)
- EcoSkills > Skill (should show a skill with progression)
- EcoMobs > Mob (should show a named mob with stats)
- Reforges > Reforge (should show a themed reforge)

- [ ] **Step 3: Test infrastructure plugins**

- eco > Core config (should produce valid storage config)
- EcoBits > Currency (should produce named currency with symbol)
- EcoMenus > Menu (should produce a menu with close button)
- EcoShop > Shop (should produce a shop with categories)

- [ ] **Step 4: Test clicking Generate multiple times**

On any plugin, click Generate 3-4 times rapidly. Each click should produce different values. No freezes or console errors.

- [ ] **Step 5: Test that Reset still works after Generate**

Click Generate, then click Reset. Form should return to the template's original starter values.
