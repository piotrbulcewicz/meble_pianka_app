import { useEffect, useState } from "react";
import EmployeeAssignmentCheckbox from "./EmployeeAssignmentCheckbox";
import "../styles/ResultsPage.css";

const EMPLOYEES = [
  "Pracownik_1",
  "Pracownik_2",
  "Pracownik_3",
  "Pracownik_4"
];

function getAssignmentKey(record, elementIndex) {
  return `${record._id ?? `${record.model}-${record.variant}`}-${elementIndex}`;
}

export default function ResultsPage({ results, onBack }) {
  const records = results?.records ?? [];
  const [ employeeAssignments, setEmployeeAssignments ] = useState({});
  const [ printEmployeeFilter, setPrintEmployeeFilter ] = useState(null);

  useEffect(() => {
    if (!printEmployeeFilter) {
      return undefined;
    }

    const printTimer = window.setTimeout(() => {
      window.print();
    }, 0);

    return () => {
      window.clearTimeout(printTimer);
    };
  }, [printEmployeeFilter]);

  useEffect(() => {
    function handleAfterPrint() {
      setPrintEmployeeFilter(null);
    }

    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  function handlePrint() {
    setPrintEmployeeFilter(null);
    window.setTimeout(() => {
      window.print();
    }, 0);
  }

  function handleEmployeePrint(employeeKey) {
    setPrintEmployeeFilter(null);
    window.setTimeout(() => {
      setPrintEmployeeFilter(employeeKey);
    }, 0);
  }

  function handleAssignmentToggle(record, elementIndex, employeeKey) {
    const assignmentKey = getAssignmentKey(record, elementIndex);

    setEmployeeAssignments((currentAssignments) => ({
      ...currentAssignments,
      [assignmentKey]: {
        ...currentAssignments[assignmentKey],
        [employeeKey]: !currentAssignments[assignmentKey]?.[employeeKey]
      }
    }));
  }

  if (!records.length) {
    return (
      <section className="results-page results-page--empty">
        <div className="results-page__toolbar no-print">
          <button
            className="results-page__secondary-button"
            type="button"
            onClick={onBack}
          >
            Wróć do wyszukiwarki
          </button>
        </div>

        <div className="results-page__empty-state">
          <h1>Brak danych do wyświetlenia</h1>
          <p>Wyślij rekordy z formularza, aby zobaczyć tutaj odpowiedź z serwera.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="results-page">
      <div className="results-page__toolbar no-print">
        <div className="results-page__toolbar-group">
          <button
            className="results-page__secondary-button"
            type="button"
            onClick={onBack}
          >
            Wróć do wyszukiwarki
          </button>
        </div>

        <div className="results-page__toolbar-group results-page__toolbar-group--print">
          <button
            className="results-page__primary-button"
            type="button"
            onClick={handlePrint}
          >
            Drukuj / PDF
          </button>
          {EMPLOYEES.map((employee) => (
            <button
              className="results-page__secondary-button"
              key={`print-${employee}`}
              type="button"
              onClick={() => handleEmployeePrint(employee)}
            >
              Drukuj: {employee}
            </button>
          ))}
        </div>
      </div>

      <div className="results-page__document">
        <header className="results-page__header">
          <h1>Zestawienie rekordów</h1>
          <p>Znalezione rekordy: {results.foundCount} z {results.totalRequested}</p>
        </header>

        <div className="results-page__records">
          {records.map((record, index) => {
            const visibleElements = (record.elements ?? []).reduce((elementsForView, element, elementIndex) => {
              if (!printEmployeeFilter) {
                elementsForView.push({ element, elementIndex });
                return elementsForView;
              }

              const assignmentKey = getAssignmentKey(record, elementIndex);
              if (employeeAssignments[assignmentKey]?.[printEmployeeFilter]) {
                elementsForView.push({ element, elementIndex });
              }

              return elementsForView;
            }, []);

            if (printEmployeeFilter && record.found && !visibleElements.length) {
              return null;
            }

            return (
              <article
                className="results-page__record"
                key={record._id ?? `${record.model}-${record.variant}-${index}`}
              >
                <div className="results-page__record-header">
                  <div>
                    <h2>{index + 1}. {record.model} / {record.variant}</h2>
                    <p>Ilość zestawów: {record.requestedQuantity}</p>
                  </div>
                  {!record.found && (
                    <span className="results-page__badge results-page__badge--error">
                      Nie znaleziono w bazie
                    </span>
                  )}
                </div>

                {record.found && (
                  <>
                    <div className="results-page__meta">
                      <span>dev_name: {record.devName}</span>
                      <span>dev_name_model_variant: {record.devNameModelVariant}</span>
                    </div>

                    <div className="results-page__table-wrapper">
                      <table className="results-page__table">
                        <thead>
                          <tr>
                            <th>Element</th>
                            <th>Długość</th>
                            <th>Szerokość</th>
                            <th>Grubość</th>
                            <th>Kształt</th>
                            <th>Materiał</th>
                            <th>Ilość bazowa</th>
                            <th>Ilość końcowa</th>
                            {EMPLOYEES.map((employee) => (
                              (!printEmployeeFilter || printEmployeeFilter === employee) && (
                                <th
                                  className="results-page__worker-column"
                                  key={employee}
                                >
                                  {employee}
                                </th>
                              )
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {visibleElements.map(({ element, elementIndex }) => {
                            const assignmentKey = getAssignmentKey(record, elementIndex);

                            return (
                              <tr key={`${record._id}-${element.element}-${elementIndex}`}>
                                <td>{element.element}</td>
                                <td>{element.length}</td>
                                <td>{element.width}</td>
                                <td>{element.thickness}</td>
                                <td>{element.shape ?? "-"}</td>
                                <td>{element.material}</td>
                                <td>{element.baseQuantity}</td>
                                <td>{element.totalQuantity}</td>
                                {EMPLOYEES.map((employee) => (
                                  (!printEmployeeFilter || printEmployeeFilter === employee) && (
                                    <td
                                      className="results-page__worker-cell"
                                      key={`${assignmentKey}-${employee}`}
                                    >
                                      <EmployeeAssignmentCheckbox
                                        id={`${assignmentKey}-${employee}`}
                                        label={`${employee} dla ${element.element}`}
                                        checked={Boolean(employeeAssignments[assignmentKey]?.[employee])}
                                        onChange={() => handleAssignmentToggle(record, elementIndex, employee)}
                                      />
                                    </td>
                                  )
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
