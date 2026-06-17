interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export default function Select({ 
  label, 
  value, 
  onChange, 
  options, 
  required = false,
  placeholder = 'Select...',
  className = '' 
}: SelectProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-navy font-semibold mb-2 font-body">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="input-field"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}