import FieldShell from './FieldShell.jsx';

export function normalizeOption(option) {
  if (typeof option === 'string') {
    return { label: option, value: option };
  }

  return option;
}

function createCollectionItem(fields) {
  return Object.fromEntries((fields ?? []).map((field) => [field.key, field.type === 'switch' ? false : '']));
}

export default function CollectionEditor({ field, value, onChange }) {
  const items = Array.isArray(value) ? value : [];

  function updateItem(index, key, nextValue) {
    const nextItems = items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: nextValue } : item));
    onChange(nextItems);
  }

  function addItem() {
    onChange([...items, createCollectionItem(field.fields)]);
  }

  function removeItem(index) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="collection-editor">
      <div className="collection-toolbar">
        <span>{items.length} configured</span>
        <button type="button" className="ghost-button" onClick={addItem}>
          {field.addLabel || 'Add'}
        </button>
      </div>
      {items.length === 0 ? <div className="empty-state compact">Nothing added yet.</div> : null}
      {items.map((item, index) => (
        <div className="collection-card" key={`${field.key}-${index}`}>
          <div className="collection-card-header">
            <span>{field.label} #{index + 1}</span>
            <button type="button" className="ghost-button danger" onClick={() => removeItem(index)}>
              Remove
            </button>
          </div>
          <div className="collection-grid">
            {(field.fields ?? []).map((subField) => (
              <FieldShell field={subField} key={`${field.key}-${subField.key}-${index}`}>
                {subField.type === 'select' ? (
                  <select
                    value={item[subField.key] ?? ''}
                    onChange={(event) => updateItem(index, subField.key, event.target.value)}
                  >
                    {(subField.options ?? []).map((option) => {
                      const normalized = normalizeOption(option);
                      return (
                        <option key={normalized.value} value={normalized.value}>
                          {normalized.label}
                        </option>
                      );
                    })}
                  </select>
                ) : subField.type === 'textarea' || subField.type === 'multiline-list' ? (
                  <textarea
                    rows={4}
                    value={item[subField.key] ?? ''}
                    onChange={(event) => updateItem(index, subField.key, event.target.value)}
                    placeholder={subField.placeholder || ''}
                  />
                ) : subField.type === 'switch' ? (
                  <button
                    type="button"
                    className={`toggle ${item[subField.key] ? 'on' : ''}`}
                    onClick={() => updateItem(index, subField.key, !item[subField.key])}
                  >
                    <span className="toggle-knob" />
                    <span>{item[subField.key] ? 'On' : 'Off'}</span>
                  </button>
                  ) : (
                  <input
                    type={subField.type === 'number' ? 'number' : 'text'}
                    value={item[subField.key] ?? ''}
                    onChange={(event) => updateItem(index, subField.key, event.target.value)}
                    placeholder={subField.placeholder || ''}
                  />
                )}
              </FieldShell>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
