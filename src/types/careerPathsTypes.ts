import { CardProps } from "@/constants/educationalPathCards";

type TemplateType = "simple" | "rich" | "advanced";

export type CurriculumBlock = {
  id: string,
  year: number;
  module: string;
  subjects: {
    name: string;
    hours: number;
    ects?: number;
    form?: string;
    exam?: boolean;
  }[];
};

type PricingTable = {
  standard: {
    price: string;
    features: string[];
  };
  premium?: {
    price: string;
    features: string[];
  };
};

export type Testimonial = {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
};

export type PathData = {
  title: string;
  description: string;
  templateType: TemplateType;
  modules?: string[];
  curriculum?: CurriculumBlock[];
  pricing?: PricingTable;
  testimonials?: Testimonial[];
  features?: CardProps[];
};