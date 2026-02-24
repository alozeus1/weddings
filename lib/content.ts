import couple from "@/content/couple.json";
import story from "@/content/story.json";
import events from "@/content/events.json";
import travel from "@/content/travel.json";
import menu from "@/content/menu.json";
import registry from "@/content/registry.json";
import faq from "@/content/faq.json";
import weddingParty from "@/content/wedding_party.json";
import families from "@/content/families.json";
import type { Couple, EventItem, FAQItem, FamilyCard, PersonCard, StoryItem } from "@/types/content";

export const coupleContent = couple as Couple;

export const storyContent = story as {
  intro: string;
  timeline: StoryItem[];
};

export const eventsContent = events as EventItem[];

export const travelContent = travel as {
  airports: { name: string; code: string; distance: string }[];
  hotels: { name: string; description: string; bookingCode: string }[];
  transport: string[];
};

export const menuContent = menu as {
  courses: { category: string; items: string[] }[];
};

export const registryContent = registry as {
  registryUrl: string;
  featured: { title: string; price: string; image: string }[];
};

export const faqContent = faq as FAQItem[];

export const partyContent = weddingParty as PersonCard[];

export const familiesContent = families as FamilyCard[];

export const primaryRoutes = [
  { href: "/", label: "Home" },
  { href: "/our-story", label: "Our Story" },
  { href: "/weekend", label: "Weekend" },
  { href: "/travel", label: "Travel" },
  { href: "/rsvp", label: "RSVP" },
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
  { href: "/live-gallery", label: "Live Gallery" }
];
