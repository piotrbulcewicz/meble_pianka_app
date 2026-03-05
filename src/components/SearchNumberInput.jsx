import "../styles/SearchNumberInput.css";

export default function SearchNumberInput({
  id,
  label,
  value,
  onChange
}) {
  function handleChange(event) {
    const digitsOnlyValue = event.target.value.replace(/\D/g, "");
    onChange(digitsOnlyValue);
  }

  return (
    <label className="search-number-input" htmlFor={id}>
      <span className="search-number-input__label">{label}</span>
      <input
        className="search-number-input__field"
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleChange}
        placeholder="Wpisz ilość"
      />
    </label>
  );
}
