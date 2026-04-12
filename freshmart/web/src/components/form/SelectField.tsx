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
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <select
        {...registration}
        {...props}
        className={
          className ??
          'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        }
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}