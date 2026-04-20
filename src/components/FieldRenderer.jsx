import CollectionEditor, { normalizeOption } from './CollectionEditor.jsx';
import ConditionsEditor from './ConditionsEditor.jsx';
import EffectsEditor from './EffectsEditor.jsx';
import MinecraftText from './MinecraftText.jsx';
import PreviewPatternEditor from './PreviewPatternEditor.jsx';
import RecipeGrid from './RecipeGrid.jsx';

const MC_FORMAT_RE = /&[0-9a-frklmno]|&#[0-9a-fA-F]{6}|<gradient:|<\/gradient:|<g:|<\/g:|§[0-9a-frklmno]/i;

function hasFormatting(value) {
  return typeof value === 'string' && MC_FORMAT_RE.test(value);
}

function SingleLinePreview({ value }) {
  if (!hasFormatting(value)) return null;
  return (
    <div className="field-preview">
      <span className="field-preview-label">Preview</span>
      <MinecraftText value={value} />
    </div>
  );
}

function MultilinePreview({ value }) {
  const lines = String(value ?? '').split(/\r?\n/).filter((line) => hasFormatting(line));
  if (lines.length === 0) return null;
  return (
    <div className="field-preview multiline">
      <span className="field-preview-label">Preview</span>
      <div className="field-preview-lines">
        {String(value ?? '').split(/\r?\n/).map((line, index) => (
          <div key={index} className="field-preview-line">
            <MinecraftText value={line} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FieldRenderer({ field, value, onChange }) {
  if (field.type === 'effects') {
    return <EffectsEditor label={field.label} value={value} onChange={onChange} />;
  }

  if (field.type === 'conditions') {
    return <ConditionsEditor value={value} onChange={onChange} />;
  }

  if (field.type === 'collection') {
    return <CollectionEditor field={field} value={value} onChange={onChange} />;
  }

  if (field.type === 'select') {
    return (
      <select value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
        {(field.options ?? []).map((option) => {
          const normalized = normalizeOption(option);
          return (
            <option key={normalized.value} value={normalized.value}>
              {normalized.label}
            </option>
          );
        })}
      </select>
    );
  }

  if (field.type === 'switch') {
    return (
      <button type="button" className={`toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)}>
        <span className="toggle-knob" />
        <span>{value ? 'On' : 'Off'}</span>
      </button>
    );
  }

  if (field.type === 'recipe-grid') {
    return <RecipeGrid value={value} onChange={onChange} />;
  }

  if (field.type === 'preview-pattern') {
    return <PreviewPatternEditor value={value} onChange={onChange} />;
  }

  if (field.type === 'textarea' || field.type === 'multiline-list') {
    return (
      <>
        <textarea
          rows={field.type === 'textarea' ? 4 : 6}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder || ''}
        />
        <MultilinePreview value={value} />
      </>
    );
  }

  return (
    <>
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder || ''}
      />
      {field.type !== 'number' ? <SingleLinePreview value={value} /> : null}
    </>
  );
}
