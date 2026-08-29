interface FilterSelectProps {
  value: string;
  options: string[];
  onChange?: (value: string) => void;
}

export function FilterSelect({ value, options, onChange }: FilterSelectProps) {
  return (
    <label className="filter-select">
      <select value={value} onChange={(event) => onChange?.(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
