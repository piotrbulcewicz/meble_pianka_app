import "../styles/SearchSelect.css";

export default function SearchSelect({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  helperText = ""
}) {
  return (
    <label className="search-select" htmlFor={id}>
      <span className="search-select__label">{label}</span>
      <select
        className="search-select__field"
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {helperText && <span className="search-select__helper">{helperText}</span>}
    </label>
  );
}
