import './PillGroup.css';

export default function PillGroup({ id, label, hint, options, value, onChange, multiple = false }) {
  const isChecked = (optionValue) =>
    multiple ? value.includes(optionValue) : value === optionValue;

  function toggle(optionValue) {
    if (!multiple) return onChange(optionValue);
    onChange(
      value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue]
    );
  }

  return (
    <fieldset className="pill-group">
      <legend id={id}>
        {label}
        {hint && <span className="pill-group__hint"> {hint}</span>}
      </legend>
      <div className="pill-group__options">
        {options.map(([optionValue, optionLabel]) => (
          <label key={optionValue || 'any'} className="pill">
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={id}
              value={optionValue}
              checked={isChecked(optionValue)}
              onChange={() => toggle(optionValue)}
            />
            <span>{optionLabel}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
