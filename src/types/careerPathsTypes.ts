import { CardProps } from "@/constants/educationalPathCards";
import { StaticImageData } from "next/image";

type TemplateType = "simple" | "rich";

export type CurriculumBlock = {
  id: string,
  year: number;
  module: string;
  image: StaticImageData | string;
  subjects: {
    name: string;
    hours: number;
    ects?: number;
    form?: string;
    exam?: boolean;
    img?: StaticImageData | string;
  }[];
};

type PricingTier = {
  price: string;
  features: string[];
  priceId: string;
  accessTier: string;
};

type PricingTable = {
  courseSlug: string;
  standard: PricingTier;
  premium?: PricingTier;
  pro?: PricingTier;
};

export type Testimonial = {
  id:string,
  userId: string,
  content: string,
  rating: number,
  visible: boolean,
  createdAt: Date,
  updatedAt:Date,
  username: string | null
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