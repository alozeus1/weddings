import { PageHero } from "@/components/sections/page-hero";
import { Section } from "@/components/sections/section";
import { Card } from "@/components/ui/card";
import { menuContent } from "@/lib/content";

export default function MenuPage(): React.JSX.Element {
  return (
    <>
      <PageHero kicker="Wedding Menu" title="Dinner & Delights" subtitle="A curated menu inspired by our favorite meals and family traditions." />
      <Section title="Menu Highlights" kicker="Editorial">
        <div className="grid gap-4 sm:grid-cols-2">
          {menuContent.courses.map((course) => (
            <Card key={course.category} title={course.category}>
              <ul className="space-y-2 text-sm text-ink/75">
                {course.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
