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
