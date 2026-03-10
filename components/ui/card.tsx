import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
};

export function Card({ title, subtitle, children }: CardProps): React.JSX.Element {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gold-300/40 bg-paper-glow p-5 shadow-soft transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-card sm:p-6">
      {title ? <h3 className="font-display text-2xl text-ink transition-colors duration-300 group-hover:text-gold-600">{title}</h3> : null}
      {subtitle ? <p className="mt-2 text-sm text-ink/70">{subtitle}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}
