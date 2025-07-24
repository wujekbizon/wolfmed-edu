import { StaticImageData } from "next/image";
import img1 from "@/images/caregiver.jpg";
import img2 from "@/images/nurse.jpg";
import img3 from "@/images/students.jpg";
import React from "react";
import LearnIcon from "@/components/icons/LearnIcon";
import ProgressIcon from "@/components/icons/ProgressIcon";
import BlogIcon from "@/components/icons/BlogIcon";

export interface CardProps {
  description: string;
  customDescriptions?: { title: string; description: string , id:number, icon?:React.JSX.Element}[];
  title: string;
  titleBtn: string;
  imgSrc: string | StaticImageData;
  text: string;
  url: string;
  className?: string;
  icon: string;
  vertical?: boolean;
}

const CAREGIVER: CardProps = {
  title: "Opiekun Medyczny",
  titleBtn: "Design without limits",
  description:
    "Zdobądź kompleksową wiedzę i praktyczne umiejętności potrzebne do pracy jako opiekun medyczny. Korzystaj z setek testów, procedur krok po kroku oraz wsparcia aktywnej społeczności. Nasza ścieżka edukacyjna została stworzona z myślą zarówno o osobach, które dopiero rozpoczynają swoją karierę i przygotowują się do egzaminu zawodowego, jak i o tych, którzy już pracują w zawodzie i chcą pogłębić swoją wiedzę, utrwalić procedury lub odświeżyć materiał przed kolejnym etapem kariery.",
  imgSrc: img1,
  text: "Sprawdź kierunek opiekun medyczny",
  url: "/",
  icon: "caregiver",
};

const NURSE: CardProps = {
  title: "Pielęgniarstwo",
  titleBtn: "Design without limits",
  description:
    "Nowa ścieżka edukacyjna dla przyszłych pielęgniarek i pielęgniarzy. Program opracowany z myślą o wymaganiach nowoczesnej opieki zdrowotnej – oferuje zaawansowane materiały dydaktyczne, przygotowanie do egzaminów zawodowych oraz praktyczne wsparcie w zakresie codziennej pracy klinicznej. Idealny dla osób rozpoczynających naukę w kierunku pielęgniarstwa, jak i tych, którzy chcą ugruntować swoją wiedzę i dobrze przygotować się do wyzwań pracy w placówkach medycznych.",
  imgSrc: img2,
  text: "Sprawdź kierunek pielęgniarstwo",
  url: "/",
  icon: "nurse",
};

const INFO: CardProps = {
  title: "Dołącz do naszej społeczności",
  titleBtn: "See what’s inside our studio",
  description: "Stawiamy na rozwój, nowoczesność i technologie.",
  customDescriptions: [
    {
      id:1,
      title: "Sprawdzona Wiedza",
      description: "Z naszą platformą uczysz się skutecznie, rozwijasz kompetencje i budujesz swoją karierę. Zyskaj dostęp do bazy pytań testowych, procedur oraz materiałów edukacyjnych.",
      icon: <LearnIcon color="white" width={56} height={56}/>
    },
    {
      id:2,
      title: "Artykuły i Porady",
      description: "Czytaj praktyczne artykuły tworzone przez doświadczonych specjalistów. Poznaj realia pracy w służbie zdrowia i rozwijaj się razem z nami.",
      icon: <BlogIcon color="white" width={56} height={56}/>
    },
    {
      id:3,
      title: "Rozwój i Analiza",
      description: "Śledź swoje postępy, analizuj wyniki testów i doskonal umiejętności – we własnym tempie i z pełnym wsparciem narzędzi platformy.",
      icon: <ProgressIcon color="white" width={56} height={56}/>
    },
  ],
  imgSrc: img3,
  text: "Dołącz już dziś",
  url: "/sign-up",
  icon: "info",
};

export { CAREGIVER, NURSE, INFO };
