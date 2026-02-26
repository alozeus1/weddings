export type MappedImage = {
  src: string;
  alt: string;
};

const LOCAL_FALLBACK_IMAGE = "/images/placeholders/gallery-1.jpg";

export const imageAssets = {
  videos: {
    ourStory: "/images/videos/our-story-header.mp4"
  },
  couple: {
    bothPrimary: "/images/couple/couplepic3.jpeg",
    bothSecondary: "/images/couple/couplepic2.png",
    bothWide: "/images/couple/couplepic1.png",
    coupleChair: "/images/couple/couple-chair.png",
    weddingBands: "/images/couple/wedding-bands.png",
    bridePrimary: "/images/couple/bride-profile2.jpg",
    brideSecondary: "/images/couple/bride-profile1.jpg"
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
  }
} as const;

export const heroImages = {
  home: imageAssets.couple.bothPrimary,
  story: imageAssets.couple.bothSecondary,
  weekend: imageAssets.church.gallery[0],
  travel: imageAssets.city.gallery[0],
  rsvp: imageAssets.couple.bridePrimary,
  menu: imageAssets.menu.jollofRice,
  registry: imageAssets.couple.bothSecondary,
  gallery: imageAssets.couple.bothPrimary,
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
  imageAssets.couple.bothPrimary,
  imageAssets.couple.bothSecondary,
  imageAssets.couple.bothWide,
  imageAssets.couple.bridePrimary,
  imageAssets.church.gallery[0],
  imageAssets.city.gallery[0]
];

export const storyTimelineImages = [
  "/images/couple/How-we-met.png",
  imageAssets.couple.bothPrimary,
  imageAssets.couple.weddingBands,
  imageAssets.couple.bothWide,
  "/images/couple/fixed.png",
  imageAssets.church.gallery[2],
  "/images/couple/quote-we-love.png"
];

export const registryFeaturedImages = [
  "/images/placeholders/registry-amazon-placeholder.jpg",
  "/images/placeholders/registry-walmart-placeholder.png",
  "/images/placeholders/registry-target-placeholder.png"
];

export const partyImages = [
  "/images/wedding-party/amara.jpg",
  "/images/wedding-party/chinelo.jpg",
  "/images/wedding-party/david.jpg",
  "/images/wedding-party/kemi.jpg"
];

export const familyImages = ["/images/families/nwosu.jpg", "/images/families/okoro.jpg"];

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
