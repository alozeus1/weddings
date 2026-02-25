import Image from "next/image";
import type { StoryItem } from "@/types/content";

function getStoryImageAlt(item: StoryItem): string {
  if (item.title === "The Proposal") {
    return "Wedding bands";
  }

  if (item.title === "A Quote We Love") {
    return "Jessica and Chibuike photo";
  }

  if (item.title === "A Note to Our Guests") {
    return "Jessica and Chibuike collage";
  }

  return item.title;
}

function getStoryImageStyle(item: StoryItem): React.CSSProperties | undefined {
  if (item.title === "What We're Most Excited About") {
    return { objectPosition: "50% 25%" };
  }

  return undefined;
}

export function Timeline({ items }: { items: StoryItem[] }): React.JSX.Element {
  return (
    <div className="space-y-10">
      {items.map((item, index) => (
        <article
          key={item.title}
          className="grid gap-5 rounded-2xl border border-gold-300/40 bg-white/60 p-4 shadow-soft sm:p-6 lg:grid-cols-2 lg:items-center"
        >
          <div className={index % 2 === 0 ? "order-1" : "order-1 lg:order-2"}>
            <p className="section-kicker">{item.date}</p>
            <h3 className="mt-3 font-display text-3xl text-ink">{item.title}</h3>
            <p className="mt-3 text-base leading-8 text-ink/75">{item.body}</p>
          </div>
          <div className={index % 2 === 0 ? "order-2" : "order-2 lg:order-1"}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl2 border border-gold-300/50">
              <Image src={item.image} alt={getStoryImageAlt(item)} fill className="object-cover" style={getStoryImageStyle(item)} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
