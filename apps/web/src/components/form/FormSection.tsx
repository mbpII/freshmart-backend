import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
};

export function FormSection({ title, children }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="card-body space-y-4">{children}</div>
    </div>
  );
}
