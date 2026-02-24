import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
};

export function Card({ title, subtitle, children }: CardProps): React.JSX.Element {
  return (
    <article className="rounded-2xl border border-gold-300/40 bg-paper-glow p-5 shadow-card sm:p-6">
      {title ? <h3 className="font-display text-2xl text-ink">{title}</h3> : null}
      {subtitle ? <p className="mt-2 text-sm text-ink/70">{subtitle}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}
