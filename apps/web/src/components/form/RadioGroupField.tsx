type Option<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  legend: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

export function RadioGroupField<T extends string>({
  legend,
  value,
  options,
  onChange,
}: Props<T>) {
  return (
    <fieldset>
      <legend className="mb-1 block text-sm font-medium text-gray-700">{legend}</legend>
      <div className="flex h-[42px] items-center gap-4 rounded border border-gray-300 px-3">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name={legend}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 border-gray-300 text-gray-800 focus:ring-gray-400"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
