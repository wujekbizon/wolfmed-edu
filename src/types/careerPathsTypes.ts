import { CardProps } from "@/constants/educationalPathCards";
import { StaticImageData } from "next/image";
import type { CareerPath, PathQuestions, PathStory } from "@/types/pathStoryTypes";
import type {
  LifetimeUpgradeOfferKey,
  PaymentOffer,
  PaymentOfferKey,
  PricingOfferStatusMap,
  SubscriptionPlanChange,
} from "@/types/paymentTypes";

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
  offerKey: PaymentOfferKey;
  accessTier: PaymentOffer['accessTier'];
  badge?: string;
};

type PricingTable = {
  courseSlug: PaymentOffer['courseSlug'];
  basic: PricingTier;
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
  story?: PathStory;
  careerPath?: CareerPath;
  questions?: PathQuestions;
};
export type PathLayoutProps = PathData & {
  pricingOfferStatuses: PricingOfferStatusMap;
  subjectTitles: string[];
  eligibleLifetimeUpgradeOfferKey: LifetimeUpgradeOfferKey | null;
  subscriptionPlanChange: SubscriptionPlanChange | null;
}
