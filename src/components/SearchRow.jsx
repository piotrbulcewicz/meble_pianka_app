import SearchSelect from "./SearchSelect";
import SearchNumberInput from "./SearchNumberInput";
import "../styles/SearchRow.css";

export default function SearchRow({
  row,
  rowNumber,
  modelOptions,
  variantOptions,
  onChange,
  onDelete
}) {
  return (
    <div className="search-row">
      <span className="search-row__index">{rowNumber}.</span>

      <div className="search-row__fields">
        <SearchSelect
          id={`model-${row.id}`}
          label="Model"
          placeholder="Wybierz model"
          options={modelOptions}
          value={row.model}
          onChange={(value) => onChange(row.id, "model", value)}
        />

        <SearchSelect
          id={`variant-${row.id}`}
          label="Wariant"
          placeholder="Wybierz wariant"
          options={variantOptions}
          value={row.variant}
          onChange={(value) => onChange(row.id, "variant", value)}
          helperText={!variantOptions.length ? "Tutaj możesz później dopisać własne opcje." : ""}
        />

        <SearchNumberInput
          id={`quantity-${row.id}`}
          label="Ilość"
          value={row.quantity}
          onChange={(value) => onChange(row.id, "quantity", value)}
        />
      </div>

      <button
        className="search-row__delete"
        type="button"
        onClick={() => onDelete(row.id)}
      >
        Usuń
      </button>
    </div>
  );
}
