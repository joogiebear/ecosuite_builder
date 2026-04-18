import { CONDITION_CATALOG } from '../data/libreforgeCatalog.js';
import FieldShell from './FieldShell.jsx';
import IdPicker from './IdPicker.jsx';

export default function ConditionsEditor({ value, onChange }) {
  const conditions = Array.isArray(value) ? value : [];

  function updateCondition(index, key, nextValue) {
    onChange(
      conditions.map((condition, conditionIndex) =>
        conditionIndex === index ? { ...condition, [key]: nextValue } : condition,
      ),
    );
  }

  function applyPreset(index, entry) {
    onChange(
      conditions.map((condition, conditionIndex) =>
        conditionIndex === index
          ? {
              ...condition,
              id: entry.id,
              argsText: condition.argsText && condition.argsText.trim() !== '' ? condition.argsText : entry.argsTemplate,
            }
          : condition,
      ),
    );
  }

  function addCondition() {
    onChange([...conditions, { id: '', argsText: '' }]);
  }

  function removeCondition(index) {
    onChange(conditions.filter((_, conditionIndex) => conditionIndex !== index));
  }

  return (
    <div className="collection-editor">
      <div className="collection-toolbar">
        <span>{conditions.length} conditions</span>
        <button type="button" className="ghost-button" onClick={addCondition}>
          Add condition
        </button>
      </div>
      {conditions.length === 0 ? <div className="empty-state compact">No conditions added.</div> : null}
      {conditions.map((condition, index) => (
        <div className="collection-card" key={`condition-${index}`}>
          <div className="collection-card-header">
            <span>Condition #{index + 1}</span>
            <button type="button" className="ghost-button danger" onClick={() => removeCondition(index)}>
              Remove
            </button>
          </div>
          <div className="collection-grid">
            <FieldShell field={{ label: 'Condition ID', width: 'half' }}>
              <div className="input-with-picker">
                <input
                  value={condition.id ?? ''}
                  onChange={(event) => updateCondition(index, 'id', event.target.value)}
                  placeholder="in_world"
                />
                <IdPicker
                  catalog={CONDITION_CATALOG}
                  currentId={condition.id}
                  onPick={(entry) => applyPreset(index, entry)}
                  placeholder="Browse conditions"
                />
              </div>
            </FieldShell>
            <FieldShell field={{ label: 'Args', width: 'full', help: 'One key:value pair per line.' }}>
              <textarea rows={4} value={condition.argsText ?? ''} onChange={(event) => updateCondition(index, 'argsText', event.target.value)} placeholder="world: world_nether" />
            </FieldShell>
          </div>
        </div>
      ))}
    </div>
  );
}
