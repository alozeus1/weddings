export type MappedImage = {
  src: string;
  alt: string;
};

export type MediaObjectPositionVariant = "hero" | "mosaic" | "gallery" | "timeline";

const LOCAL_FALLBACK_IMAGE = "/images/menu/featured-1.jpg";

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
    welcome: "/images/gallery/optimized/super-12.webp"
  },
  eventCenter: {
    gallery: [
      "/images/event-center/optimized/eventcenter.jpeg",
      "/images/event-center/optimized/hall-pic1.jpeg",
      "/images/event-center/optimized/hall-pic2.jpeg",
      "/images/event-center/optimized/hall-pic3.jpeg"
    ]
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
    pci23: "/images/gallery/pci23.png",
    pic2: "/images/gallery/optimized/pic2.webp",
    pic5: "/images/gallery/optimized/pic5.webp",
    pic8: "/images/gallery/optimized/pic8.webp",
    pic10: "/images/gallery/optimized/pic10.webp",
    pic16: "/images/gallery/optimized/pic16.webp",
    pic21: "/images/gallery/optimized/pic21.webp",
    pic30: "/images/gallery/optimized/pic30.webp",
    superSeries: [
      "/images/gallery/optimized/super-1.webp",
      "/images/gallery/optimized/super-2.webp",
      "/images/gallery/optimized/super-3.webp",
      "/images/gallery/optimized/super-4.webp",
      "/images/gallery/optimized/super-5.webp",
      "/images/gallery/optimized/super-6.webp",
      "/images/gallery/optimized/super-7.webp",
      "/images/gallery/optimized/super-8.webp",
      "/images/gallery/optimized/super-9.webp",
      "/images/gallery/optimized/super-10.webp",
      "/images/gallery/optimized/super-11.webp",
      "/images/gallery/optimized/super-12.webp",
      "/images/gallery/optimized/super-13.webp",
      "/images/gallery/optimized/super-14.webp",
      "/images/gallery/optimized/super-15.webp",
      "/images/gallery/optimized/super-16.webp",
      "/images/gallery/optimized/super-17.webp"
    ]
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
  [imageAssets.gallery.pic2]: {
    hero: "50% 18%"
  },
  [imageAssets.gallery.pic5]: {
    hero: "50% 18%"
  },
  [imageAssets.gallery.pic8]: {
    hero: "50% 18%"
  },
  [imageAssets.gallery.pic10]: {
    hero: "50% 18%"
  },
  [imageAssets.gallery.pic16]: {
    hero: "50% 18%"
  },
  [imageAssets.gallery.pic21]: {
    hero: "50% 18%"
  },
  [imageAssets.gallery.pic30]: {
    hero: "50% 28%",
    gallery: "50% 18%"
  },
  [imageAssets.gallery.pci23]: {
    hero: "50% 16%"
  },
  [imageAssets.eventCenter.gallery[0]]: {
    mosaic: "44% 50%",
    gallery: "44% 50%"
  },
  [imageAssets.eventCenter.gallery[1]]: {
    mosaic: "50% 34%",
    gallery: "50% 36%"
  },
  [imageAssets.eventCenter.gallery[2]]: {
    mosaic: "58% 46%",
    gallery: "58% 46%"
  },
  [imageAssets.eventCenter.gallery[3]]: {
    mosaic: "50% 42%",
    gallery: "50% 42%"
  }
};

const superGalleryObjectPositions: Array<Partial<Record<MediaObjectPositionVariant, string>>> = [
  { mosaic: "50% 14%", gallery: "50% 16%", timeline: "50% 12%" },
  { mosaic: "50% 14%", gallery: "50% 16%", timeline: "50% 14%" },
  { mosaic: "50% 14%", gallery: "50% 16%", timeline: "50% 14%" },
  { mosaic: "50% 14%", gallery: "50% 16%", timeline: "50% 14%" },
  { mosaic: "50% 12%", gallery: "50% 14%", timeline: "50% 12%" },
  { mosaic: "50% 12%", gallery: "50% 14%", timeline: "50% 12%" },
  { mosaic: "50% 18%", gallery: "50% 20%", timeline: "50% 16%" },
  { mosaic: "50% 12%", gallery: "50% 14%", timeline: "50% 12%" },
  { mosaic: "50% 12%", gallery: "50% 14%", timeline: "50% 12%" },
  { mosaic: "50% 18%", gallery: "50% 18%", timeline: "50% 14%" },
  { mosaic: "50% 12%", gallery: "50% 14%", timeline: "50% 12%" },
  { mosaic: "50% 10%", gallery: "50% 12%", timeline: "50% 10%" },
  { mosaic: "50% 10%", gallery: "50% 12%", timeline: "50% 10%" },
  { mosaic: "50% 12%", gallery: "50% 14%", timeline: "50% 12%" },
  { mosaic: "50% 10%", gallery: "50% 12%", timeline: "50% 10%" },
  { mosaic: "50% 10%", gallery: "50% 12%", timeline: "50% 10%" },
  { mosaic: "50% 10%", gallery: "50% 12%", timeline: "50% 10%" }
];

imageAssets.gallery.superSeries.forEach((src, index) => {
  imageObjectPositions[src] = superGalleryObjectPositions[index];
});

export function getImageObjectPosition(src: string, variant: MediaObjectPositionVariant): string | undefined {
  return imageObjectPositions[src]?.[variant];
}

const superGallerySeries = imageAssets.gallery.superSeries;

export const heroImages = {
  home: imageAssets.gallery.pic30,
  story: imageAssets.gallery.pic21,
  weekend: imageAssets.gallery.pci23,
  travel: imageAssets.city.gallery[0],
  rsvp: imageAssets.gallery.pic5,
  menu: imageAssets.menu.jollofRice,
  registry: imageAssets.gallery.pic2,
  gallery: imageAssets.gallery.pic30,
  faq: imageAssets.gallery.pic10,
  contact: imageAssets.gallery.pic16,
  weddingParty: imageAssets.gallery.pic8,
  families: imageAssets.gallery.pic10,
  upload: imageAssets.gallery.pic16,
  liveGallery: imageAssets.gallery.pic21,
  church: imageAssets.church.gallery[0]
} as const;

export const pageMosaics = {
  home: [superGallerySeries[0], superGallerySeries[7], superGallerySeries[14]],
  weekend: [
    imageAssets.church.gallery[0],
    imageAssets.church.gallery[1],
    ...imageAssets.eventCenter.gallery
  ],
  travel: [imageAssets.city.gallery[0], imageAssets.city.gallery[1], imageAssets.airport.gallery[0]],
  menu: [imageAssets.menu.jollofRice, imageAssets.menu.friedRice, imageAssets.menu.smallChops],
  faq: [superGallerySeries[9], superGallerySeries[12], superGallerySeries[16]],
  contact: [superGallerySeries[1], superGallerySeries[10], superGallerySeries[15]],
  rsvp: [superGallerySeries[4], superGallerySeries[8], superGallerySeries[13]],
  upload: [superGallerySeries[2], superGallerySeries[5], superGallerySeries[14]]
} as const;

export const galleryImages = [...superGallerySeries];

export const storyTimelineImages = [
  superGallerySeries[1],
  superGallerySeries[4],
  superGallerySeries[13],
  superGallerySeries[9],
  superGallerySeries[7],
  superGallerySeries[11],
  superGallerySeries[16]
];

export const registryFeaturedImages = [
  superGallerySeries[11],
  superGallerySeries[12],
  superGallerySeries[14]
];

export const partyImages = [superGallerySeries[0], superGallerySeries[9], superGallerySeries[13], superGallerySeries[16]];

export const familyImages = [superGallerySeries[11], superGallerySeries[14]];

export const churchGalleryImages = imageAssets.church.gallery;
export const eventCenterGalleryImages = imageAssets.eventCenter.gallery;
export const churchWelcomeImage = imageAssets.church.welcome;
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
