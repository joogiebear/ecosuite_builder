function parseSlots(value) {
  const lines = String(value ?? '').split(/\r?\n/);
  return Array.from({ length: 9 }, (_, i) => lines[i] ?? '');
}

export default function RecipeGrid({ value, onChange }) {
  const slots = parseSlots(value);

  function updateSlot(i, next) {
    const updated = [...slots];
    updated[i] = next;
    onChange(updated.join('\n'));
  }

  return (
    <div className="recipe-grid-input">
      {slots.map((slot, i) => (
        <input
          key={i}
          value={slot}
          onChange={(e) => updateSlot(i, e.target.value)}
          placeholder="air"
          aria-label={`Recipe slot ${i + 1}`}
        />
      ))}
    </div>
  );
}
