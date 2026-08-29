import { Search } from 'lucide-react';

interface SearchInputProps {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function SearchInput({ placeholder, value, onChange }: SearchInputProps) {
  return (
    <label className="search-input">
      <Search size={14} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}
