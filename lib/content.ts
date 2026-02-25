import couple from "@/content/couple.json";
import story from "@/content/story.json";
import events from "@/content/events.json";
import travel from "@/content/travel.json";
import menu from "@/content/menu.json";
import registry from "@/content/registry.json";
import faq from "@/content/faq.json";
import weddingParty from "@/content/wedding_party.json";
import families from "@/content/families.json";
import { familyImages, partyImages, registryFeaturedImages, storyTimelineImages } from "@/lib/media";
import type { Couple, EventItem, EventsContent, FAQItem, FamilyCard, PersonCard, StoryItem } from "@/types/content";

export const coupleContent = couple as Couple;

const rawStory = story as { intro: string; timeline: StoryItem[] };

export const storyContent = {
  ...rawStory,
  timeline: rawStory.timeline.map((item, index) => ({
    ...item,
    image: storyTimelineImages[index] ?? item.image
  }))
};

const rawEvents = events as EventsContent;
export const eventsContent = rawEvents.items as EventItem[];
export const eventsDetails = {
  colorsOfDay: rawEvents.colorsOfDay,
  colorPalette: rawEvents.colorPalette
};

export const travelContent = travel as {
  airports: { name: string; code: string; distance: string }[];
  hotels: { name: string; description: string; bookingCode: string }[];
  transport: string[];
};

export const menuContent = menu as {
  courses: { category: string; items: string[] }[];
};

const rawRegistry = registry as {
  registryUrl: string;
  featured: { title: string; price: string; image: string; url: string }[];
};

export const registryContent = {
  ...rawRegistry,
  featured: rawRegistry.featured.map((item, index) => ({
    ...item,
    image: registryFeaturedImages[index] ?? item.image
  }))
};

export const faqContent = faq as FAQItem[];

const rawParty = weddingParty as PersonCard[];
export const partyContent = rawParty.map((person, index) => ({
  ...person,
  image: partyImages[index] ?? person.image
}));

const rawFamilies = families as FamilyCard[];
export const familiesContent = rawFamilies.map((family, index) => ({
  ...family,
  image: familyImages[index] ?? family.image
}));

export const primaryRoutes = [
  { href: "/", label: "Home" },
  { href: "/our-story", label: "Our Story" },
  { href: "/weekend", label: "Weekend" },
  { href: "/church", label: "Church" },
  { href: "/travel", label: "Travel" },
  { href: "/registry", label: "Registry" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" }
];

export const allRoutes = [
  ...primaryRoutes,
  { href: "/menu", label: "Menu" },
  { href: "/registry", label: "Registry" },
  { href: "/wedding-party", label: "Wedding Party" },
  { href: "/families", label: "Families" },
  { href: "/upload", label: "Upload" },
  { href: "/qr", label: "QR" },
  { href: "/live-gallery", label: "Live Gallery" },
  { href: "/our-story/video", label: "Our Story Video" }
];
