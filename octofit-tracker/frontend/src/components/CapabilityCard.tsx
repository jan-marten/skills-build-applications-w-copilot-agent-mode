import type { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyMessage: string;
  children: ReactNode;
};

export function CapabilityCard({ title, description, loading, error, isEmpty, emptyMessage, children }: Props) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {loading ? <p role="status">Loading {title.toLowerCase()}...</p> : null}
        {!loading && error ? <p role="alert">Unable to load {title.toLowerCase()}: {error}</p> : null}
        {!loading && !error && isEmpty ? <p>{emptyMessage}</p> : null}
        {!loading && !error && !isEmpty ? children : null}
      </div>
    </section>
  );
}
