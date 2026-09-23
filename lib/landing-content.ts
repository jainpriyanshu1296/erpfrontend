export type LandingContent = {
  brand: string;
  headline: string;
  introduction: string;
  features: string[];
  workflow: string[];
  benefits: string[];
  cta: string;
  contact_email: string;
  footer: string;
};
export type LandingDocument = { content: LandingContent; revision: number; published_at: string | null };
