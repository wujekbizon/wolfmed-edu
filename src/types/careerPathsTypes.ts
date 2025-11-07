import { CardProps } from "@/constants/educationalPathCards";
import { StaticImageData } from "next/image";

type TemplateType = "simple" | "rich" | "advanced";

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