export type PresentationType =
  | "BESS"
  | "Leasing"
  | "PPA"
  | "PTO"
  | "Institucional"
  | "Propuesta comercial"
  | "Capacitación";

export type Signer = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type KamAssets = {
  logoWhite?: string;
  logoBlack?: string;
  isotype?: string;
  heroImages?: string[];
};

export type DeckSlide = {
  eyebrow: string;
  title: string;
  headline?: string;
  bullets?: string[];
  body?: string;
};

export type DeckContent = {
  title: string;
  subtitle: string;
  presentationType: PresentationType | string;
  audience: string;
  slides: DeckSlide[];
  closingLine: string;
};

export type DeckRequest = {
  title: string;
  context: string;
  presentationType: PresentationType | string;
  keyInformation?: string;
  topicDetail?: string;
  signer: Signer;
  assets?: KamAssets;
  deckContent?: DeckContent;
};