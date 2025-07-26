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
  standard: string;
  premium?: string;
};

export type PathData = {
  title: string;
  description: string;
  templateType: TemplateType;
  modules?: string[];
  curriculum?: CurriculumBlock[];
  pricing?: PricingTable;
  testimonials?: string[];
  features?: CardProps[];
};