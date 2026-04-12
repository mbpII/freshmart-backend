

type Option<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  legend: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export function RadioGroupField<T extends string>({ legend, value, options, onChange, className }: Props<T>) {
  return (
    <fieldset className={className}>
      <legend className="mb-1 block text-sm font-medium">{legend}</legend>
      <div className="flex h-9 items-center gap-4 rounded-md border border-input px-3">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={legend}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="size-4 accent-primary"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}