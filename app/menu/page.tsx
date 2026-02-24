import { PageHero } from "@/components/sections/page-hero";
import { PhotoMosaic } from "@/components/sections/photo-mosaic";
import { Section } from "@/components/sections/section";
import { Card } from "@/components/ui/card";
import { menuContent } from "@/lib/content";
import { getMenuMosaicForItems, heroImages } from "@/lib/media";

export default function MenuPage(): React.JSX.Element {
  const allMenuItems = menuContent.courses.flatMap((course) => course.items);
  const menuVisuals = getMenuMosaicForItems(allMenuItems, 3);

  return (
    <>
      <PageHero
        kicker="Wedding Menu"
        title="Dinner & Delights"
        subtitle="A curated menu inspired by our favorite meals and family traditions."
        heroImage={heroImages.menu}
      />
      <Section title="Menu Highlights" kicker="Editorial">
        <PhotoMosaic images={menuVisuals.map((visual) => visual.src)} altTexts={menuVisuals.map((visual) => visual.alt)} testId="menu-photo-mosaic" />
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
