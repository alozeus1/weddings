import { PageHero } from "@/components/sections/page-hero";
import { PhotoMosaic } from "@/components/sections/photo-mosaic";
import { Section } from "@/components/sections/section";
import { Card } from "@/components/ui/card";
import { menuContent } from "@/lib/content";
import { heroImages, pageMosaics } from "@/lib/media";

export default function MenuPage(): React.JSX.Element {
  return (
    <>
      <PageHero
        kicker="Wedding Menu"
        title="Dinner & Delights"
        subtitle="A curated menu inspired by our favorite meals and family traditions."
        heroImage={heroImages.menu}
      />
      <Section title="Menu Highlights" kicker="Editorial">
        <PhotoMosaic images={[...pageMosaics.menu]} />
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
