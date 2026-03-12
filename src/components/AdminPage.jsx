import axios from "axios";
import { useMemo, useState } from "react";
import SearchSelect from "./SearchSelect";
import { BACKEND_URL } from "../config/api";
import "../styles/AdminPage.css";

const ELEMENT_FIELDS = [
  { key: "element", label: "Element" },
  { key: "length", label: "Dlugosc" },
  { key: "width", label: "Szerokosc" },
  { key: "thickness", label: "Grubosc" },
  { key: "quantity", label: "Ilosc" },
  { key: "shape", label: "Ksztalt" },
  { key: "waste", label: "Odpady" },
  { key: "material", label: "Material" },
];

function createElementRow(element = {}) {
  return {
    ...element,
    __key: crypto.randomUUID(),
  };
}

function getAuthConfig(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

function getEmptyRecord() {
  return {
    _id: "",
    model: "",
    model_variant: "",
    dev_name: "",
    dev_name_model_variant: "",
    elements: [],
  };
}

function mapDocumentToForm(document) {
  return {
    _id: document._id,
    model: document.model ?? "",
    model_variant: document.model_variant ?? "",
    dev_name: document.dev_name ?? "",
    dev_name_model_variant: document.dev_name_model_variant ?? "",
    elements: Array.isArray(document.elements)
      ? document.elements.map((element) => createElementRow(element))
      : [],
  };
}

function mapFormToPayload(formState) {
  return {
    model: formState.model.trim(),
    model_variant: formState.model_variant.trim(),
    dev_name: formState.dev_name.trim(),
    dev_name_model_variant: formState.dev_name_model_variant.trim(),
    elements: formState.elements.map(({ __key, ...element }) => {
      const nextElement = {};

      ELEMENT_FIELDS.forEach(({ key }) => {
        nextElement[key] = element[key] ?? "";
      });

      return nextElement;
    }),
  };
}

export default function AdminPage({ authToken, modelCatalog, onCatalogRefresh }) {
  const [ selection, setSelection ] = useState({
    model: "",
    variant: "",
  });
  const [ formState, setFormState ] = useState(() => getEmptyRecord());
  const [ loadState, setLoadState ] = useState({
    loading: false,
    error: "",
  });
  const [ saveState, setSaveState ] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const modelOptions = useMemo(
    () => (modelCatalog ?? []).map(({ model }) => model),
    [ modelCatalog ]
  );
  const variantOptions =
    modelCatalog?.find(({ model }) => model === selection.model)?.variants ?? [];

  function handleSelectionChange(field, value) {
    setSelection((currentSelection) => ({
      ...currentSelection,
      [field]: value,
      ...(field === "model" ? { variant: "" } : {}),
    }));
    setLoadState({
      loading: false,
      error: "",
    });
    setSaveState({
      loading: false,
      error: "",
      success: "",
    });
  }

  async function handleLoadRecord() {
    if (!selection.model || !selection.variant) {
      setLoadState({
        loading: false,
        error: "Wybierz model i wariant.",
      });
      return;
    }

    setLoadState({
      loading: true,
      error: "",
    });
    setSaveState({
      loading: false,
      error: "",
      success: "",
    });

    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/admin/model-details`,
        {
          ...getAuthConfig(authToken),
          params: {
            model: selection.model,
            variant: selection.variant,
          },
        }
      );

      setFormState(mapDocumentToForm(response.data));
      setLoadState({
        loading: false,
        error: "",
      });
    } catch (error) {
      console.log(error);
      setFormState(getEmptyRecord());
      setLoadState({
        loading: false,
        error: error.response?.data?.message ?? "Nie udalo sie pobrac rekordu.",
      });
    }
  }

  function handleFormFieldChange(field, value) {
    setFormState((currentFormState) => ({
      ...currentFormState,
      [field]: value,
    }));
    setSaveState({
      loading: false,
      error: "",
      success: "",
    });
  }

  function handleElementChange(rowKey, field, value) {
    setFormState((currentFormState) => ({
      ...currentFormState,
      elements: currentFormState.elements.map((element) =>
        element.__key === rowKey
          ? {
              ...element,
              [field]: value,
            }
          : element
      ),
    }));
    setSaveState({
      loading: false,
      error: "",
      success: "",
    });
  }

  function handleAddElement() {
    setFormState((currentFormState) => ({
      ...currentFormState,
      elements: [
        ...currentFormState.elements,
        createElementRow(
          ELEMENT_FIELDS.reduce((accumulator, { key }) => {
            accumulator[key] = "";
            return accumulator;
          }, {})
        ),
      ],
    }));
  }

  function handleDeleteElement(rowKey) {
    setFormState((currentFormState) => ({
      ...currentFormState,
      elements: currentFormState.elements.filter(
        (element) => element.__key !== rowKey
      ),
    }));
    setSaveState({
      loading: false,
      error: "",
      success: "",
    });
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!formState._id || saveState.loading) {
      return;
    }

    setSaveState({
      loading: true,
      error: "",
      success: "",
    });

    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/admin/model-details/${formState._id}`,
        mapFormToPayload(formState),
        getAuthConfig(authToken)
      );

      const nextFormState = mapDocumentToForm(response.data);
      setFormState(nextFormState);
      setSelection({
        model: nextFormState.model,
        variant: nextFormState.model_variant,
      });
      setSaveState({
        loading: false,
        error: "",
        success: "Rekord zostal zaktualizowany.",
      });
      await onCatalogRefresh();
    } catch (error) {
      console.log(error);
      setSaveState({
        loading: false,
        error: error.response?.data?.message ?? "Nie udalo sie zapisac zmian.",
        success: "",
      });
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page__card">
        <div className="admin-page__header">
          <div>
            <h1>Panel administratora</h1>
            <p>Wybierz model i wariant, pobierz rekord, a potem zaktualizuj jego dane.</p>
          </div>
        </div>

        <div className="admin-page__selection">
          <SearchSelect
            id="admin-model"
            label="Model"
            onChange={(value) => handleSelectionChange("model", value)}
            options={modelOptions}
            placeholder="Wybierz model"
            value={selection.model}
          />
          <SearchSelect
            id="admin-variant"
            label="Wariant"
            onChange={(value) => handleSelectionChange("variant", value)}
            options={variantOptions}
            placeholder="Wybierz wariant"
            value={selection.variant}
          />
          <button
            className="admin-page__action"
            onClick={handleLoadRecord}
            type="button"
          >
            {loadState.loading ? "Pobieranie..." : "Pobierz rekord"}
          </button>
        </div>

        {loadState.error && (
          <p className="admin-page__message admin-page__message--error">
            {loadState.error}
          </p>
        )}

        {formState._id && (
          <form className="admin-page__form" onSubmit={handleSave}>
            <div className="admin-page__grid">
              <label className="admin-page__field">
                <span>Model</span>
                <input
                  onChange={(event) => handleFormFieldChange("model", event.target.value)}
                  type="text"
                  value={formState.model}
                />
              </label>

              <label className="admin-page__field">
                <span>Model variant</span>
                <input
                  onChange={(event) =>
                    handleFormFieldChange("model_variant", event.target.value)
                  }
                  type="text"
                  value={formState.model_variant}
                />
              </label>

              <label className="admin-page__field">
                <span>dev_name</span>
                <input
                  onChange={(event) => handleFormFieldChange("dev_name", event.target.value)}
                  type="text"
                  value={formState.dev_name}
                />
              </label>

              <label className="admin-page__field">
                <span>dev_name_model_variant</span>
                <input
                  onChange={(event) =>
                    handleFormFieldChange(
                      "dev_name_model_variant",
                      event.target.value
                    )
                  }
                  type="text"
                  value={formState.dev_name_model_variant}
                />
              </label>
            </div>

            <div className="admin-page__elements-header">
              <h2>Elementy</h2>
              <button
                className="admin-page__secondary-action"
                onClick={handleAddElement}
                type="button"
              >
                Dodaj element
              </button>
            </div>

            <div className="admin-page__table-wrapper">
              <table className="admin-page__table">
                <thead>
                  <tr>
                    {ELEMENT_FIELDS.map(({ key, label }) => (
                      <th key={key}>{label}</th>
                    ))}
                    <th>Akcja</th>
                  </tr>
                </thead>
                <tbody>
                  {formState.elements.map((element) => (
                    <tr key={element.__key}>
                      {ELEMENT_FIELDS.map(({ key }) => (
                        <td key={`${element.__key}-${key}`}>
                          <input
                            className="admin-page__table-input"
                            onChange={(event) =>
                              handleElementChange(
                                element.__key,
                                key,
                                event.target.value
                              )
                            }
                            type="text"
                            value={element[key] ?? ""}
                          />
                        </td>
                      ))}
                      <td>
                        <button
                          className="admin-page__danger-action"
                          onClick={() => handleDeleteElement(element.__key)}
                          type="button"
                        >
                          Usun
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {saveState.error && (
              <p className="admin-page__message admin-page__message--error">
                {saveState.error}
              </p>
            )}

            {saveState.success && (
              <p className="admin-page__message admin-page__message--success">
                {saveState.success}
              </p>
            )}

            <div className="admin-page__footer">
              <span>ID rekordu: {formState._id}</span>
              <button className="admin-page__action" type="submit">
                {saveState.loading ? "Zapisywanie..." : "Zapisz zmiany"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
