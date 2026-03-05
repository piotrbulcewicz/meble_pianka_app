import { useState } from "react";
import SearchRow from "./SearchRow";
import "../styles/Search.css";

function createEmptyRow() {
  return {
    id: crypto.randomUUID(),
    model: "",
    variant: "",
    quantity: ""
  };
}

export default function Search({
  modelCatalog,
  onSubmit,
  submitState
}) {
  const [ rows, setRows ] = useState([createEmptyRow()]);
  const modelOptions = modelCatalog.map(({ model }) => model);

  function handleRowChange(rowId, field, value) {
    setRows((currentRows) => {
      const nextRows = currentRows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        if (field === "model") {
          return {
            ...row,
            model: value,
            variant: ""
          };
        }

        return {
          ...row,
          [field]: value
        };
      });

      const lastRow = nextRows[nextRows.length - 1];

      if (lastRow.model && lastRow.variant && lastRow.quantity) {
        return [...nextRows, createEmptyRow()];
      }

      return nextRows;
    });
  }

  function handleRowDelete(rowId) {
    setRows((currentRows) => {
      const nextRows = currentRows.filter((row) => row.id !== rowId);

      if (!nextRows.length) {
        return [createEmptyRow()];
      }

      return nextRows;
    });
  }

  const completedRows = rows.filter((row) => row.model && row.variant && row.quantity);

  function handleSubmit(event) {
    event.preventDefault();

    if (!completedRows.length || submitState.loading) {
      return;
    }

    onSubmit(completedRows.map(({ id, ...rowData }) => rowData));
  }

  return (
    <form className="search" onSubmit={handleSubmit}>
      <div className="search__header">
        <h1>Stwórz zestawienie</h1>
        <p>Po uzupełnieniu wszystkich pól automatycznie pojawi się kolejny wiersz.</p>
      </div>

      <div className="search__rows">
        {rows.map((row, index) => (
          <SearchRow
            key={row.id}
            row={row}
            rowNumber={index + 1}
            modelOptions={modelOptions}
            variantOptions={
              modelCatalog.find(({ model }) => model === row.model)?.variants ?? []
            }
            onChange={handleRowChange}
            onDelete={handleRowDelete}
          />
        ))}
      </div>

      <div className="search__footer">
        <div className="search__status">
          <span>Gotowe rekordy: {completedRows.length}</span>
          {submitState.error && (
            <span className="search__message search__message--error">
              {submitState.error}
            </span>
          )}
          {submitState.success && (
            <span className="search__message search__message--success">
              {submitState.success}
            </span>
          )}
        </div>

        <button
          className="search__submit"
          type="submit"
          disabled={!completedRows.length || submitState.loading}
        >
          {submitState.loading ? "Wysyłanie..." : "Wyślij rekordy"}
        </button>
      </div>
    </form>
  );
}
