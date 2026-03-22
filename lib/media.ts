export type MappedImage = {
  src: string;
  alt: string;
};

export type MediaObjectPositionVariant = "hero" | "mosaic" | "gallery" | "timeline";

const LOCAL_FALLBACK_IMAGE = "/images/placeholders/gallery-1.jpg";

export const imageAssets = {
  videos: {
    ourStory: "/images/videos/our-story-header.mp4"
  },
  couple: {
    bothPrimary: "/images/couple/optimized/couple-primary.webp",
    bothSecondary: "/images/couple/optimized/couple-secondary.webp",
    bothWide: "/images/couple/optimized/couple-wide.webp",
    coupleChair: "/images/couple/optimized/rsvp-feature.webp",
    weddingBands: "/images/couple/story-proposal.png",
    bridePrimary: "/images/couple/optimized/bride-primary.webp",
    brideSecondary: "/images/couple/optimized/bride-secondary.webp",
    storyHowWeMet: "/images/couple/optimized/story-how-we-met.webp",
    storyProposal: "/images/couple/optimized/story-proposal.webp",
    storyNote: "/images/couple/optimized/story-note.webp"
  },
  menu: {
    jollofRice: "/images/menu/jollof-rice.jpg",
    friedRice: "/images/menu/fried-rice.webp",
    amalaSet: "/images/menu/Ewedu-Gregiri-Amala.jpg",
    okraSoup: "/images/menu/okra-soup.jpg",
    pepperSoup: "/images/menu/pepper-soup.jpg",
    smallChops: "/images/menu/small-chops.jpg",
    moiMoi: "/images/menu/moi-moi.webp",
    plantain: "/images/menu/fried-plantain.jpg",
    riceStewDodo: "/images/menu/Rice-Stew-Dodo.jpg",
    fallback: "/images/menu/featured-1.jpg"
  },
  church: {
    gallery: ["/images/church/church.jpg", "/images/church/church1.webp", "/images/church/church2.jpg"],
    // TODO: Replace with the actual parish priest portrait in cassock when the final file is added.
    priest: "/images/church/parish-priest-placeholder.jpg"
  },
  city: {
    gallery: [
      "/images/city/Elpaso1.png",
      "/images/city/elpaso2.jpg",
      "/images/city/elpaso5.png",
      "/images/city/elpaso6.webp",
      "/images/city/elpaso7.jpg"
    ]
  },
  airport: {
    gallery: ["/images/city/airport1.jpg", "/images/airport/airport2.jpg"]
  },
  gallery: {
    pic30: "/images/gallery/optimized/pic30.webp"
  }
} as const;

const imageObjectPositions: Partial<Record<string, Partial<Record<MediaObjectPositionVariant, string>>>> = {
  [imageAssets.couple.bothPrimary]: {
    hero: "50% 12%",
    mosaic: "50% 14%",
    gallery: "50% 16%",
    timeline: "50% 16%"
  },
  [imageAssets.couple.bothSecondary]: {
    hero: "50% 8%",
    mosaic: "50% 8%",
    gallery: "50% 12%",
    timeline: "50% 10%"
  },
  [imageAssets.couple.bothWide]: {
    hero: "50% 10%",
    mosaic: "50% 12%",
    gallery: "50% 16%",
    timeline: "50% 20%"
  },
  [imageAssets.couple.bridePrimary]: {
    hero: "50% 10%",
    mosaic: "50% 10%",
    gallery: "50% 12%"
  },
  [imageAssets.couple.brideSecondary]: {
    hero: "50% 8%",
    mosaic: "50% 10%",
    gallery: "50% 12%"
  },
  [imageAssets.couple.coupleChair]: {
    hero: "50% 8%",
    mosaic: "50% 10%",
    gallery: "50% 12%"
  },
  [imageAssets.couple.storyHowWeMet]: {
    timeline: "50% 12%"
  },
  [imageAssets.couple.storyProposal]: {
    timeline: "50% 16%"
  },
  [imageAssets.couple.storyNote]: {
    timeline: "50% 14%"
  },
  [imageAssets.gallery.pic30]: {
    hero: "50% 18%",
    gallery: "50% 18%"
  }
};

export function getImageObjectPosition(src: string, variant: MediaObjectPositionVariant): string | undefined {
  return imageObjectPositions[src]?.[variant];
}

export const heroImages = {
  home: imageAssets.gallery.pic30,
  story: imageAssets.couple.bothSecondary,
  weekend: imageAssets.church.gallery[0],
  travel: imageAssets.city.gallery[0],
  rsvp: imageAssets.couple.bridePrimary,
  menu: imageAssets.menu.jollofRice,
  registry: imageAssets.couple.bothSecondary,
  gallery: imageAssets.gallery.pic30,
  faq: imageAssets.couple.brideSecondary,
  contact: imageAssets.couple.bothWide,
  weddingParty: imageAssets.couple.bothSecondary,
  families: imageAssets.couple.bothPrimary,
  upload: imageAssets.couple.bothWide,
  liveGallery: imageAssets.couple.bothSecondary,
  church: imageAssets.church.gallery[0]
} as const;

export const pageMosaics = {
  home: [imageAssets.couple.bothWide, imageAssets.couple.bothSecondary, imageAssets.couple.bridePrimary],
  weekend: [
    imageAssets.church.gallery[0],
    imageAssets.church.gallery[1],
    "/images/event-center/eventcenter.webp"
  ],
  travel: [imageAssets.city.gallery[0], imageAssets.city.gallery[1], imageAssets.airport.gallery[0]],
  menu: [imageAssets.menu.jollofRice, imageAssets.menu.friedRice, imageAssets.menu.smallChops],
  faq: [
    "/images/placeholders/faq-1-placeholder.jpg",
    "/images/placeholders/faq-2-placeholder.jpg",
    "/images/placeholders/faq-3-placeholder.jpeg"
  ],
  contact: [imageAssets.couple.bothPrimary, imageAssets.couple.bridePrimary, imageAssets.couple.brideSecondary],
  rsvp: [imageAssets.couple.bridePrimary, imageAssets.couple.coupleChair, imageAssets.couple.bothSecondary],
  upload: [imageAssets.couple.bothWide, imageAssets.couple.bothSecondary, imageAssets.couple.bothPrimary]
} as const;

export const galleryImages = [
  "/images/gallery/optimized/pci23.webp",
  "/images/gallery/optimized/pic2.webp",
  "/images/gallery/optimized/pic5.webp",
  imageAssets.couple.bothPrimary,
  imageAssets.couple.bothSecondary,
  "/images/gallery/optimized/pic8.webp",
  imageAssets.couple.bothWide,
  "/images/gallery/optimized/pic10.webp",
  imageAssets.couple.bridePrimary,
  "/images/gallery/optimized/pic16.webp",
  imageAssets.couple.brideSecondary,
  "/images/gallery/optimized/pic21.webp",
  imageAssets.gallery.pic30
];

export const storyTimelineImages = [
  imageAssets.couple.storyHowWeMet,
  imageAssets.couple.bothPrimary,
  imageAssets.couple.storyProposal,
  imageAssets.couple.bothWide,
  imageAssets.couple.storyNote,
  imageAssets.church.gallery[2],
  "/images/couple/story-quote.png"
];

export const registryFeaturedImages = [
  "/images/placeholders/registry-amazon-placeholder.jpg",
  "/images/placeholders/registry-walmart-placeholder.png",
  "/images/placeholders/registry-target-placeholder.png"
];

export const partyImages = [imageAssets.couple.bridePrimary, imageAssets.couple.brideSecondary, imageAssets.couple.bothPrimary, imageAssets.couple.coupleChair];

export const familyImages = [imageAssets.couple.bothWide, imageAssets.couple.bothPrimary];

export const churchGalleryImages = imageAssets.church.gallery;
export const churchPriestImage = imageAssets.church.priest;
export const cityGalleryImages = imageAssets.city.gallery;
export const airportGalleryImages = imageAssets.airport.gallery;

const menuImageRules: Array<{ pattern: RegExp; image: MappedImage }> = [
  { pattern: /jollof/, image: { src: imageAssets.menu.jollofRice, alt: "Jollof rice served with protein" } },
  { pattern: /fried-rice|fried rice/, image: { src: imageAssets.menu.friedRice, alt: "Fried rice served with protein" } },
  { pattern: /pepper-soup|pepper soup/, image: { src: imageAssets.menu.pepperSoup, alt: "Pepper soup bowl" } },
  { pattern: /small-chops|small chops|meat-pies|meat pies|puff/, image: { src: imageAssets.menu.smallChops, alt: "Small chops platter" } },
  { pattern: /moi-moi|moi moi/, image: { src: imageAssets.menu.moiMoi, alt: "Moi-Moi slices" } },
  { pattern: /ripe-plantain|plantain/, image: { src: imageAssets.menu.plantain, alt: "Ripe fried plantain" } },
  {
    pattern: /white-rice.*tomatoe.*stew|tomatoe.*stew|rice.*stew.*dodo/,
    image: { src: imageAssets.menu.riceStewDodo, alt: "White rice with tomato stew and dodo" }
  },
  {
    pattern: /ogbono|okra/,
    image: { src: imageAssets.menu.okraSoup, alt: "Okra and assorted meats soup" }
  },
  {
    pattern: /fufu|amala|pounded-yam|pounded yam|egusi|vegetable/,
    image: { src: imageAssets.menu.amalaSet, alt: "Amala and assorted soup set" }
  },
  {
    pattern: /ewa-goin|ewa goin|ewa-goyin|ewa goyin/,
    image: { src: imageAssets.menu.moiMoi, alt: "Beans-based side dish" }
  }
];

const warnedMenuItems = new Set<string>();

function normalizeMenuItem(item: string): string {
  return item
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[\/,.:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getMenuImageForItem(item: string): MappedImage {
  const normalized = normalizeMenuItem(item);
  const match = menuImageRules.find((rule) => rule.pattern.test(normalized));

  if (match) {
    return match.image;
  }

  if (!warnedMenuItems.has(item)) {
    warnedMenuItems.add(item);
    console.warn(`[menu-image] No exact local image match for "${item}". Falling back to default menu image.`);
  }

  return {
    src: imageAssets.menu.fallback,
    alt: "Wedding menu featured dish"
  };
}

export function getMenuMosaicForItems(items: string[], maxImages = 3): MappedImage[] {
  const selected: MappedImage[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const mapped = getMenuImageForItem(item);
    if (seen.has(mapped.src)) {
      continue;
    }

    seen.add(mapped.src);
    selected.push({ src: mapped.src, alt: mapped.alt });

    if (selected.length >= maxImages) {
      break;
    }
  }

  if (selected.length >= maxImages) {
    return selected;
  }

  const defaults = [imageAssets.menu.jollofRice, imageAssets.menu.friedRice, imageAssets.menu.pepperSoup];

  for (const src of defaults) {
    if (selected.length >= maxImages) {
      break;
    }

    if (seen.has(src)) {
      continue;
    }

    selected.push({ src, alt: "Wedding menu highlight" });
    seen.add(src);
  }

  while (selected.length < maxImages) {
    selected.push({ src: LOCAL_FALLBACK_IMAGE, alt: "Wedding menu highlight" });
  }

  return selected;
}

export const venueInfo = {
  church: {
    name: "St. Patrick's Cathedral",
    address: "1118 N Mesa St, El Paso, TX 79902",
    date: "June 12, 2026",
    time: "Mass 3:00 PM (MT)",
    description:
      "St. Patrick Cathedral is the seat of the Roman Catholic Diocese of El Paso, Texas. The cathedral is located at 1118 N. Mesa Street, north of the downtown area. It is the mother church for 668,000 Catholics in the diocese"
  },
  eventCenter: {
    name: "Tuscany Event Center",
    address: "8600 Gateway Blvd, El Paso, TX 79907"
  }
} as const;

function buildGoogleMapsLink(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const venueMapLinks = {
  church: buildGoogleMapsLink(`${venueInfo.church.name}, ${venueInfo.church.address}`),
  eventCenter: buildGoogleMapsLink(`${venueInfo.eventCenter.name}, ${venueInfo.eventCenter.address}`),
  airport: buildGoogleMapsLink("El Paso International Airport, El Paso, TX")
} as const;
