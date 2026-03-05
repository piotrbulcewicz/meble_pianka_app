import "../styles/EmployeeAssignmentCheckbox.css";

export default function EmployeeAssignmentCheckbox({
  id,
  checked,
  onChange,
  label
}) {
  return (
    <label className="employee-assignment-checkbox" htmlFor={id}>
      <input
        className="employee-assignment-checkbox__input"
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
      <span
        aria-hidden="true"
        className={`employee-assignment-checkbox__box ${checked ? "employee-assignment-checkbox__box--checked" : ""}`}
      >
        {checked ? "X" : ""}
      </span>
    </label>
  );
}
