// Curated catalog of common libreforge effect and condition IDs with default arg templates.
// Not exhaustive — covers the ones used across EcoSuite plugins.
// Users can still type any ID freely; this is a helper picker.

export const EFFECT_CATALOG = [
  // Damage / combat
  {
    id: 'damage_multiplier',
    category: 'Combat',
    description: 'Multiply outgoing damage.',
    argsTemplate: 'multiplier: 1.2',
  },
  {
    id: 'damage_victim',
    category: 'Combat',
    description: 'Deal extra damage to the victim.',
    argsTemplate: 'damage: 2',
  },
  {
    id: 'defense_multiplier',
    category: 'Combat',
    description: 'Multiply incoming damage (use values below 1 to reduce).',
    argsTemplate: 'multiplier: 0.85',
  },
  {
    id: 'crit_multiplier',
    category: 'Combat',
    description: 'Multiply crit damage.',
    argsTemplate: 'multiplier: 1.5',
  },
  {
    id: 'attack_speed_multiplier',
    category: 'Combat',
    description: 'Multiply attack speed.',
    argsTemplate: 'multiplier: 1.2',
  },
  {
    id: 'ignite',
    category: 'Combat',
    description: 'Set the target on fire for N seconds.',
    argsTemplate: 'duration: 3',
  },
  {
    id: 'knockback',
    category: 'Combat',
    description: 'Apply extra knockback.',
    argsTemplate: 'strength: 1.0',
  },
  {
    id: 'damage_nearby_entities',
    category: 'Combat',
    description: 'Damage entities in a radius.',
    argsTemplate: 'damage: 5\nradius: 3',
  },

  // Stats
  {
    id: 'health_multiplier',
    category: 'Stats',
    description: 'Multiply max health.',
    argsTemplate: 'multiplier: 1.2',
  },
  {
    id: 'movement_speed_multiplier',
    category: 'Stats',
    description: 'Multiply movement speed.',
    argsTemplate: 'multiplier: 1.1',
  },
  {
    id: 'regen',
    category: 'Stats',
    description: 'Passive regeneration.',
    argsTemplate: 'amount: 0.5\ndelay: 20',
  },
  {
    id: 'give_food',
    category: 'Stats',
    description: 'Restore hunger.',
    argsTemplate: 'amount: 2',
  },
  {
    id: 'hunger_multiplier',
    category: 'Stats',
    description: 'Multiply hunger consumption (<1 = slower).',
    argsTemplate: 'multiplier: 0.5',
  },
  {
    id: 'potion_effect',
    category: 'Stats',
    description: 'Apply a vanilla potion effect.',
    argsTemplate: 'effect: strength\nlevel: 1\nduration: 200',
  },
  {
    id: 'permanent_potion_effect',
    category: 'Stats',
    description: 'Apply a permanent potion effect while the holder is active.',
    argsTemplate: 'effect: speed\nlevel: 1',
  },

  // Economy / reward
  {
    id: 'give_money',
    category: 'Economy',
    description: 'Give coins (Vault/EcoBits).',
    argsTemplate: 'amount: 100',
  },
  {
    id: 'give_points',
    category: 'Economy',
    description: 'Give PlayerPoints.',
    argsTemplate: 'amount: 10',
  },
  {
    id: 'give_xp',
    category: 'Economy',
    description: 'Give vanilla XP.',
    argsTemplate: 'amount: 10',
  },
  {
    id: 'give_item',
    category: 'Economy',
    description: 'Give an item to the player.',
    argsTemplate: 'item: diamond_sword sharpness:5\namount: 1',
  },
  {
    id: 'drop_item',
    category: 'Economy',
    description: 'Drop an item at the location.',
    argsTemplate: 'item: diamond',
  },

  // Messaging / presentation
  {
    id: 'send_message',
    category: 'Messaging',
    description: 'Send a chat message to the player.',
    argsTemplate: 'message: "&aHello!"',
  },
  {
    id: 'broadcast',
    category: 'Messaging',
    description: 'Broadcast to the whole server.',
    argsTemplate: 'message: "&b%player% did something!"',
  },
  {
    id: 'send_title',
    category: 'Messaging',
    description: 'Show a title and subtitle.',
    argsTemplate: 'title: "&aTitle"\nsubtitle: "&7Subtitle"\nfade_in: 10\nstay: 40\nfade_out: 10',
  },
  {
    id: 'send_actionbar',
    category: 'Messaging',
    description: 'Show an actionbar message.',
    argsTemplate: 'message: "&a+1 XP"',
  },
  {
    id: 'play_sound',
    category: 'Messaging',
    description: 'Play a sound to the player.',
    argsTemplate: 'sound: entity_player_levelup\nvolume: 1\npitch: 1',
  },
  {
    id: 'spawn_particle',
    category: 'Messaging',
    description: 'Spawn a particle effect.',
    argsTemplate: 'particle: flame\ncount: 10',
  },

  // Commands / control flow
  {
    id: 'run_command',
    category: 'Control flow',
    description: 'Run a console command.',
    argsTemplate: 'command: "say hello"',
  },
  {
    id: 'run_chain',
    category: 'Control flow',
    description: 'Run a chain from libreforge/chains.yml.',
    argsTemplate: 'chain: combo_chain',
  },
  {
    id: 'delay',
    category: 'Control flow',
    description: 'Delay subsequent effects (placed as a mutator on the next effect).',
    argsTemplate: 'ticks: 20',
  },
  {
    id: 'random',
    category: 'Control flow',
    description: 'Roll a random check; effect only runs when the chance succeeds.',
    argsTemplate: 'chance: 25',
  },
  {
    id: 'teleport',
    category: 'Control flow',
    description: 'Teleport the player.',
    argsTemplate: 'x: 0\ny: 64\nz: 0\nworld: world',
  },

  // Progression
  {
    id: 'give_skill_xp',
    category: 'Progression',
    description: 'Give XP to an EcoSkills skill.',
    argsTemplate: 'skill: mining\namount: 5',
  },
  {
    id: 'give_pet_xp',
    category: 'Progression',
    description: 'Give XP to the active pet.',
    argsTemplate: 'amount: 5',
  },
  {
    id: 'give_magic',
    category: 'Progression',
    description: 'Add/subtract magic type (mana, etc.).',
    argsTemplate: 'type: mana\namount: 10',
  },

  // Other
  {
    id: 'pull_towards',
    category: 'Other',
    description: 'Pull nearby entities toward the player.',
    argsTemplate: 'strength: 1.2\nradius: 5',
  },
  {
    id: 'launch_projectile',
    category: 'Other',
    description: 'Launch a projectile from the player.',
    argsTemplate: 'projectile: arrow\nspeed: 1.5',
  },
  {
    id: 'mine_radius',
    category: 'Other',
    description: 'Mine blocks in a radius.',
    argsTemplate: 'radius: 2',
  },
  {
    id: 'shoot_arrow',
    category: 'Other',
    description: 'Shoot an arrow.',
    argsTemplate: 'inherit_velocity: true',
  },
];

export const CONDITION_CATALOG = [
  {
    id: 'has_permission',
    category: 'Player',
    description: 'Player must have a permission node.',
    argsTemplate: 'permission: example.perm',
  },
  {
    id: 'in_world',
    category: 'World',
    description: 'Player must be in a given world.',
    argsTemplate: 'world: world_nether',
  },
  {
    id: 'in_biome',
    category: 'World',
    description: 'Player must be in a biome.',
    argsTemplate: 'biome: desert',
  },
  {
    id: 'is_night',
    category: 'World',
    description: 'The world time must be night.',
    argsTemplate: '',
  },
  {
    id: 'is_day',
    category: 'World',
    description: 'The world time must be day.',
    argsTemplate: '',
  },
  {
    id: 'is_sneaking',
    category: 'Player',
    description: 'Player must be sneaking.',
    argsTemplate: '',
  },
  {
    id: 'is_sprinting',
    category: 'Player',
    description: 'Player must be sprinting.',
    argsTemplate: '',
  },
  {
    id: 'is_flying',
    category: 'Player',
    description: 'Player must be flying.',
    argsTemplate: '',
  },
  {
    id: 'above_health_percent',
    category: 'Stats',
    description: 'Player health must be above N%.',
    argsTemplate: 'amount: 50',
  },
  {
    id: 'below_health_percent',
    category: 'Stats',
    description: 'Player health must be below N%.',
    argsTemplate: 'amount: 30',
  },
  {
    id: 'above_magic',
    category: 'Stats',
    description: 'Player must have at least N of a magic type.',
    argsTemplate: 'type: mana\namount: 20',
  },
  {
    id: 'has_potion_effect',
    category: 'Stats',
    description: 'Player has a potion effect.',
    argsTemplate: 'effect: strength',
  },
  {
    id: 'above_y',
    category: 'World',
    description: 'Player Y must be above a value.',
    argsTemplate: 'y: 64',
  },
  {
    id: 'below_y',
    category: 'World',
    description: 'Player Y must be below a value.',
    argsTemplate: 'y: 60',
  },
  {
    id: 'holding_item',
    category: 'Inventory',
    description: 'Player must be holding an item.',
    argsTemplate: 'item: diamond_sword',
  },
  {
    id: 'is_in_combat',
    category: 'Player',
    description: 'Player must have recently taken damage.',
    argsTemplate: '',
  },
  {
    id: 'in_region',
    category: 'World',
    description: 'Player must be in a WorldGuard region.',
    argsTemplate: 'region: spawn',
  },
  {
    id: 'above_money',
    category: 'Economy',
    description: 'Player must have at least N coins.',
    argsTemplate: 'amount: 1000',
  },
  {
    id: 'below_money',
    category: 'Economy',
    description: 'Player must have less than N coins.',
    argsTemplate: 'amount: 500',
  },
];
