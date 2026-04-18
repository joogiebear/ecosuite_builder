import { EFFECT_CATALOG } from '../data/libreforgeCatalog.js';
import FieldShell from './FieldShell.jsx';
import IdPicker from './IdPicker.jsx';

export default function EffectsEditor({ label, value, onChange }) {
  const effects = Array.isArray(value) ? value : [];

  function updateEffect(index, key, nextValue) {
    onChange(effects.map((effect, effectIndex) => (effectIndex === index ? { ...effect, [key]: nextValue } : effect)));
  }

  function applyPreset(index, entry) {
    onChange(
      effects.map((effect, effectIndex) =>
        effectIndex === index
          ? {
              ...effect,
              id: entry.id,
              argsText: effect.argsText && effect.argsText.trim() !== '' ? effect.argsText : entry.argsTemplate,
            }
          : effect,
      ),
    );
  }

  function addEffect() {
    onChange([...effects, { id: '', triggers: '', argsText: '', filtersText: '', mutatorsText: '' }]);
  }

  function removeEffect(index) {
    onChange(effects.filter((_, effectIndex) => effectIndex !== index));
  }

  return (
    <div className="collection-editor">
      <div className="collection-toolbar">
        <span>{effects.length} effect blocks</span>
        <button type="button" className="ghost-button" onClick={addEffect}>
          Add effect
        </button>
      </div>
      {effects.length === 0 ? <div className="empty-state compact">Add a libreforge effect block to start.</div> : null}
      {effects.map((effect, index) => (
        <div className="collection-card" key={`${label}-${index}`}>
          <div className="collection-card-header">
            <span>{label} #{index + 1}</span>
            <button type="button" className="ghost-button danger" onClick={() => removeEffect(index)}>
              Remove
            </button>
          </div>
          <div className="collection-grid">
            <FieldShell field={{ label: 'Effect ID', width: 'half' }}>
              <div className="input-with-picker">
                <input
                  value={effect.id ?? ''}
                  onChange={(event) => updateEffect(index, 'id', event.target.value)}
                  placeholder="damage_multiplier"
                />
                <IdPicker
                  catalog={EFFECT_CATALOG}
                  currentId={effect.id}
                  onPick={(entry) => applyPreset(index, entry)}
                  placeholder="Browse effects"
                />
              </div>
            </FieldShell>
            <FieldShell field={{ label: 'Triggers', width: 'half', help: 'Comma-separated: melee_attack, bow_attack' }}>
              <input value={effect.triggers ?? ''} onChange={(event) => updateEffect(index, 'triggers', event.target.value)} placeholder="melee_attack" />
            </FieldShell>
            <FieldShell field={{ label: 'Args', width: 'full', help: 'Write one key:value pair per line. Nested keys can use dots.' }}>
              <textarea rows={5} value={effect.argsText ?? ''} onChange={(event) => updateEffect(index, 'argsText', event.target.value)} placeholder={'multiplier: 1.2\nrequire: %level% >= 10'} />
            </FieldShell>
            <FieldShell field={{ label: 'Filters', width: 'full', help: 'Optional. Example: entities: zombie,skeleton' }}>
              <textarea rows={4} value={effect.filtersText ?? ''} onChange={(event) => updateEffect(index, 'filtersText', event.target.value)} placeholder={'entities: zombie,skeleton\nitems: *diamond_sword'} />
            </FieldShell>
            <FieldShell field={{ label: 'Mutators', width: 'full', help: 'One mutator per block. Use key:value lines; blank lines separate mutators. Start each with id: <mutator_id>.' }}>
              <textarea rows={4} value={effect.mutatorsText ?? ''} onChange={(event) => updateEffect(index, 'mutatorsText', event.target.value)} placeholder={'id: spin_velocity\nangle: %repeat_count%\n\nid: delay_effects\nticks: 20'} />
            </FieldShell>
          </div>
        </div>
      ))}
    </div>
  );
}
