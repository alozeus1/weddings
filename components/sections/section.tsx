import type { ReactNode } from "react";

type SectionProps = {
  title: string;
  kicker?: string;
  children: ReactNode;
};

export function Section({ title, kicker, children }: SectionProps): React.JSX.Element {
  return (
    <section className="py-14 sm:py-16 lg:py-20">
      <div className="container-shell space-y-7">
        {kicker ? <p className="section-kicker">{kicker}</p> : null}
        <h2 className="font-display text-3xl text-ink sm:text-4xl">{title}</h2>
        {children}
      </div>
    </section>
  );
}
