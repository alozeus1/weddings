export type Couple = {
  names: string;
  date: string;
  city: string;
  ceremonyVenue: string;
  receptionVenue: string;
  welcomePartyVenue: string;
  rsvpDeadline: string;
  tagline: string;
  heroSubtitle: string;
};

export type StoryItem = {
  title: string;
  date: string;
  body: string;
  image: string;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  dressCode: string;
};

export type EventsContent = {
  colorsOfDay: string;
  colorPalette: string[];
  items: EventItem[];
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type PersonCard = {
  name: string;
  role: string;
  bio: string;
  image: string;
};

export type FamilyCard = {
  family: string;
  note: string;
  image: string;
};

export type UploadRecord = {
  id: string;
  url: string;
  uploadedByName: string | null;
  createdAt: string;
  status: "pending" | "approved";
};

export type RSVPRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  attending: boolean;
  plusOneName: string;
  mealCategory: string;
  protein: string;
  soup: string;
  dietary: string;
  message: string;
  createdAt: string;
};

export type GuestStatus = "pending" | "yes" | "no";

export type GuestRecord = {
  id: string;
  fullName: string;
  normalized: string;
  email: string | null;
  phoneLast4: string | null;
  status: GuestStatus;
  plusOneName: string | null;
  mealCategory: string | null;
  protein: string | null;
  soup: string | null;
  dietary: string | null;
  message: string | null;
  updatedAt: string;
  createdAt: string;
};

export type InviteRequestStatus = "pending" | "approved" | "rejected";

export type InviteRequestRecord = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: InviteRequestStatus;
  createdAt: string;
};
