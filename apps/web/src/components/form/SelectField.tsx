import type { SelectHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  options: Option[];
  placeholder?: string;
  error?: string;
  registration: UseFormRegisterReturn;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name'>;

export function SelectField({
  label,
  options,
  placeholder,
  error,
  registration,
  className,
  ...props
}: Props) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <select
        {...registration}
        {...props}
        className={
          className ??
          'w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400'
        }
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
