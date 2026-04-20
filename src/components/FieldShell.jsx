const BLOCK_FIELD_TYPES = new Set(['effects', 'conditions', 'collection']);

export default function FieldShell({ field, children, error }) {
  const Tag = BLOCK_FIELD_TYPES.has(field.type) ? 'div' : 'label';
  return (
    <Tag className={`field ${field.width === 'full' ? 'full' : ''}`}>
      <span className="field-label">{field.label}</span>
      {children}
      {error ? <span className="field-error" role="alert">{error}</span> : null}
      {field.help ? <span className="field-help">{field.help}</span> : null}
    </Tag>
  );
}
