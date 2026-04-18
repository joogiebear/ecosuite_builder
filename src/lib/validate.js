import { collectDraftIds } from './knownIds.js';
import { csvToArray } from './schema.js';
import { clampNumber, hasText } from './util.js';

function validateKeyValueLines(text, label, issues) {
  const lines = String(text ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const [index, line] of lines.entries()) {
    if (!line.includes(':')) {
      issues.push({
        severity: 'warning',
        message: `${label} line ${index + 1} should use key:value format.`,
      });
    }
  }
}

function validateEffects(effects, label, issues) {
  for (const [index, effect] of (effects ?? []).entries()) {
    if (!hasText(effect?.id)) {
      issues.push({
        severity: 'error',
        message: `${label} #${index + 1} is missing an effect ID.`,
      });
    }

    validateKeyValueLines(effect?.argsText, `${label} #${index + 1} args`, issues);
    validateKeyValueLines(effect?.filtersText, `${label} #${index + 1} filters`, issues);
  }
}

function validateConditions(conditions, label, issues) {
  for (const [index, condition] of (conditions ?? []).entries()) {
    if (!hasText(condition?.id)) {
      issues.push({
        severity: 'error',
        message: `${label} #${index + 1} is missing a condition ID.`,
      });
    }

    validateKeyValueLines(condition?.argsText, `${label} #${index + 1} args`, issues);
  }
}

function validateRecipe(text, label, issues) {
  const lines = String(text ?? '').split(/\r?\n/);
  const hasAnyContent = lines.some((line) => line.trim() !== '');

  if (hasAnyContent && lines.length !== 9) {
    issues.push({
      severity: 'warning',
      message: `${label} should usually use 9 lines for a full crafting grid.`,
    });
  }
}

function collectFieldKeysByType(template, type) {
  const keys = [];
  for (const section of template.sections ?? []) {
    for (const field of section.fields ?? []) {
      if (field.type === type) {
        keys.push({ key: field.key, label: field.label ?? field.key });
      }
    }
  }
  return keys;
}

export function collectValidationIssues(plugin, template, values, library) {
  const issues = [];

  if ('id' in values && !hasText(values.id)) {
    issues.push({ severity: 'error', message: 'ID is required.' });
  }

  if ('title' in values && !hasText(values.title)) {
    issues.push({ severity: 'error', message: 'Title is required.' });
  }

  if ('name' in values && !hasText(values.name)) {
    issues.push({ severity: 'error', message: 'Name is required.' });
  }

  if ('displayName' in values && !hasText(values.displayName)) {
    issues.push({ severity: 'error', message: 'Display name is required.' });
  }

  if ('rows' in values) {
    const rows = Number(values.rows);
    if (Number.isNaN(rows) || rows < 1 || rows > 6) {
      issues.push({ severity: 'error', message: 'Rows must be between 1 and 6.' });
    }
  }

  for (const { key, label } of collectFieldKeysByType(template, 'effects')) {
    if (Array.isArray(values[key])) {
      validateEffects(values[key], label, issues);
    }
  }

  for (const { key, label } of collectFieldKeysByType(template, 'conditions')) {
    if (Array.isArray(values[key])) {
      validateConditions(values[key], label, issues);
    }
  }

  if (plugin.id === 'EcoMenus' && template.id === 'menu-config') {
    const seen = new Set();
    const rows = clampNumber(values.rows, 1, 6, 6);
    const pageCount = clampNumber(values.pageCount, 1, 9, 1);
    const slots = values.slots ?? [];

    if (slots.length === 0) {
      issues.push({ severity: 'warning', message: 'No menu slots have been placed yet.' });
    }

    for (const slot of slots) {
      const row = Number(slot.row || 1);
      const column = Number(slot.column || 1);
      const page = Number(slot.page || 1);
      const key = `${page}:${row}:${column}`;

      if (seen.has(key)) {
        issues.push({
          severity: 'error',
          message: `Duplicate menu slot at page ${page}, row ${row}, column ${column}.`,
        });
      } else {
        seen.add(key);
      }

      if (row < 1 || row > rows || column < 1 || column > 9 || page < 1 || page > pageCount) {
        issues.push({
          severity: 'error',
          message: `Slot at page ${page}, row ${row}, column ${column} is outside the configured menu bounds.`,
        });
      }

      if (!hasText(slot.item)) {
        issues.push({
          severity: 'error',
          message: `Menu slot at page ${page}, row ${row}, column ${column} is missing an item.`,
        });
      }

      if (
        ['run_command', 'open_menu', 'send_message'].includes(slot.clickActionType) &&
        !hasText(slot.clickActionValue)
      ) {
        issues.push({
          severity: 'warning',
          message: `Menu slot at page ${page}, row ${row}, column ${column} needs an action value.`,
        });
      }
    }
  }

  if (plugin.id === 'EcoCrates' && template.id === 'crate-config' && !hasText(values.rewards)) {
    issues.push({ severity: 'error', message: 'At least one crate reward ID is needed.' });
  }

  if (plugin.id === 'EcoBits' && template.id === 'currency-config') {
    if (!hasText(values.currencyId)) {
      issues.push({ severity: 'error', message: 'Currency ID is required.' });
    }

    if (!hasText(values.currencyName)) {
      issues.push({ severity: 'error', message: 'Currency name is required.' });
    }
  }

  if (plugin.id === 'EcoBattlepass' && template.id === 'battlepass-track') {
    if (!hasText(values.battlepassStart) || !hasText(values.battlepassEnd)) {
      issues.push({ severity: 'error', message: 'Battlepass start and end dates are required.' });
    }
  }

  if (plugin.id === 'EcoItems' && values.craftable) {
    validateRecipe(values.recipe, 'Item recipe', issues);
  }

  if (plugin.id === 'Talismans' && values.craftable) {
    validateRecipe(values.recipe, 'Talisman recipe', issues);
  }

  if (plugin.id === 'StatTrackers' && values.craftable) {
    validateRecipe(values.recipe, 'Tracker recipe', issues);
  }

  if (plugin.id === 'Reforges' && values.stoneEnabled && values.stoneCraftable) {
    validateRecipe(values.stoneRecipe, 'Reforge stone recipe', issues);
  }

  addCrossReferenceWarnings(plugin, template, values, issues, library);

  return issues;
}

function checkReferencedIds(ids, targetPlugin, targetTemplate, kind, issues, library) {
  const known = collectDraftIds(targetPlugin, targetTemplate, library);
  for (const id of ids) {
    if (!id) continue;
    if (!known.has(id)) {
      issues.push({
        severity: 'info',
        message: `${kind} "${id}" is referenced but has no saved draft or library entry yet.`,
      });
    }
  }
}

function addCrossReferenceWarnings(plugin, template, values, issues, library) {
  if (plugin.id === 'EcoShop' && template.id === 'shop-config') {
    const categoryIds = hasText(values.directCategory)
      ? [values.directCategory.trim()]
      : csvToArray(values.categoryIds);
    checkReferencedIds(categoryIds, 'EcoShop', 'shop-category', 'Shop category', issues, library);
  }

  if (plugin.id === 'EcoCrates' && template.id === 'crate-config') {
    const rewardIds = csvToArray(values.rewards);
    checkReferencedIds(rewardIds, 'EcoCrates', 'crate-reward', 'Crate reward', issues, library);
    if (hasText(values.key)) {
      checkReferencedIds([values.key.trim()], 'EcoCrates', 'crate-key', 'Crate key', issues, library);
    }
  }

  if (plugin.id === 'EcoCrates' && template.id === 'crate-key' && hasText(values.guiCrate)) {
    checkReferencedIds([values.guiCrate.trim()], 'EcoCrates', 'crate-config', 'Crate', issues, library);
  }

  if (plugin.id === 'EcoItems' && template.id === 'custom-item' && hasText(values.rarity)) {
    checkReferencedIds([values.rarity.trim()], 'EcoItems', 'item-rarity', 'Item rarity', issues, library);
  }

  if (plugin.id === 'EcoArmor' && template.id === 'armor-set' && hasText(values.tier)) {
    checkReferencedIds([values.tier.trim()], 'EcoArmor', 'armor-tier', 'Armor tier', issues, library);
  }

  if (plugin.id === 'EcoArmor' && template.id === 'armor-tier') {
    const priors = csvToArray(values.requiresTiers);
    checkReferencedIds(priors, 'EcoArmor', 'armor-tier', 'Prior tier', issues, library);
  }

  if (plugin.id === 'EcoMobs' && template.id === 'mob-config' && hasText(values.category)) {
    checkReferencedIds([values.category.trim()], 'EcoMobs', 'category-config', 'Mob category', issues, library);
  }

  if (plugin.id === 'EcoQuests' && template.id === 'quest-config' && Array.isArray(values.tasks)) {
    const taskIds = values.tasks
      .map((entry) => (entry?.task ?? '').toString().trim())
      .filter(Boolean);
    checkReferencedIds(taskIds, 'EcoQuests', 'quest-task', 'Quest task', issues, library);
  }
}
