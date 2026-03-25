import couple from "@/content/couple.json";
import story from "@/content/story.json";
import events from "@/content/events.json";
import travel from "@/content/travel.json";
import menu from "@/content/menu.json";
import registry from "@/content/registry.json";
import faq from "@/content/faq.json";
import thingsToDo from "@/content/thingsToDo.json";
import chatbotKbOptimized from "@/content/chatbot_kb_optimized.json";
import chatbotKbSource from "@/content/chatbot_kb_source.json";
import { registryFeaturedImages, storyTimelineImages } from "@/lib/media";
import type { Couple, EventItem, EventsContent, FAQItem, StoryItem, ThingToDoItem } from "@/types/content";
import type { ChatbotOptimizedKB, ChatbotSourceContent } from "@/types/chatbot";

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

export const chatbotKbContent = chatbotKbOptimized as ChatbotOptimizedKB;
export const chatbotSourceContent = chatbotKbSource as ChatbotSourceContent;

export const travelGuideContent = {
  airport: chatbotSourceContent.travel.airport,
  transportation: chatbotSourceContent.travel.transportation,
  parking: chatbotSourceContent.travel.parking,
  hotels: chatbotSourceContent.travel.hotels
};

export const uploadGuideContent = {
  uploadPage: chatbotSourceContent.uploads.uploadPage,
  qrPage: chatbotSourceContent.uploads.qrPage,
  instructions: chatbotSourceContent.uploads.instructions
};

export const guestPoliciesContent = {
  adultsOnly: chatbotSourceContent.policies.adultsOnly,
  plusOne: chatbotSourceContent.policies.plusOne,
  rsvpChangePolicy: chatbotSourceContent.policies.rsvpChangePolicy,
  arrivalRecommendation: chatbotSourceContent.ceremony.arrivalRecommendation,
  unpluggedPolicy: chatbotSourceContent.ceremony.unpluggedPolicy,
  openBar: chatbotSourceContent.reception.openBar,
  culturalElements: chatbotSourceContent.reception.culturalElements,
  dinnerStyle: chatbotSourceContent.reception.dinnerStyle
};

const rawTravel = travel as {
  airports: { name: string; code: string; distance: string }[];
  hotels: { name: string; description: string; bookingCode: string }[];
  transport: string[];
};

export const travelContent = {
  ...rawTravel,
  airports: rawTravel.airports.map((airport, index) => ({
    ...airport,
    name: index === 0 ? chatbotSourceContent.travel.airport : airport.name
  })),
  hotels: rawTravel.hotels.map((hotel) => ({
    ...hotel,
    description: chatbotSourceContent.travel.hotels || hotel.description,
    bookingCode: hotel.bookingCode === "NA" ? "TBD" : hotel.bookingCode
  })),
  transport: [
    chatbotSourceContent.travel.transportation,
    chatbotSourceContent.travel.parking,
    "Google Maps links are available for both venues on the Travel and Weekend pages.",
    "Hotel recommendations will be shared with guests."
  ],
  notes: [
    chatbotSourceContent.ceremony.arrivalRecommendation,
    chatbotSourceContent.ceremony.unpluggedPolicy,
    chatbotSourceContent.reception.culturalElements
  ]
};

export const thingsToDoContent = thingsToDo as ThingToDoItem[];

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

const baseFaq = faq as FAQItem[];
const intakeFaq: FAQItem[] = [
  ...chatbotSourceContent.faq.map((item) => ({
    question: item.question,
    answer: item.answer
  })),
  { question: "Are phones okay during the ceremony?", answer: chatbotSourceContent.ceremony.unpluggedPolicy },
  { question: "What if my plans change after I RSVP?", answer: chatbotSourceContent.policies.rsvpChangePolicy },
  { question: "How do I upload photos?", answer: chatbotSourceContent.uploads.instructions },
  { question: "What airport should I fly into?", answer: chatbotSourceContent.travel.airport },
  {
    question: "What should I know about parking and transportation?",
    answer: `${chatbotSourceContent.travel.transportation} ${chatbotSourceContent.travel.parking}`
  }
];

export const faqContent = [...intakeFaq, ...baseFaq].filter(
  (item, index, items) => items.findIndex((candidate) => candidate.question.toLowerCase() === item.question.toLowerCase()) === index
);

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
  { href: "/wedding-party", label: "Vacation Library" },
  { href: "/upload", label: "Upload" },
  { href: "/qr", label: "QR" },
  { href: "/live-gallery", label: "Live Gallery" },
  { href: "/our-story/video", label: "Our Story Video" }
];
