import { CurriculumBlock, PathData } from "@/types/careerPathsTypes";
import exams from "@/images/exams.jpg"
import procedures from "@/images/procedures.jpg"
import quizes from "@/images/quizes.jpg"
import modules from "@/images/modules.jpg"
import basic from "@/images/nauki_podstawowe.jpg"
import social from "@/images/nauki_spoleczne.jpg"
import nursing from "@/images/nauki_pielegniarstwo.jpg"
import specializedCare from "@/images/nauki_opieka_specjalistyczna.jpg"
import anatomy from "@/images/anatomia.jpg"
import physiology from "@/images/fizjologia.jpg"
import pathology from "@/images/patologia.jpg"
import genetics from "@/images/genetyka.jpg"
import biochemistry from "@/images/biochemia.jpg"
import microbiology from "@/images/mikrobiologia.jpg"
import pharmacology from "@/images/farmakologia.jpg"
import radiology from "@/images/radiologia.jpg"
import psychology from "@/images/psychologia.jpg"
import sociology from "@/images/socjologia.jpg"
import pedagogy from "@/images/pedagogika.jpg"
import law from "@/images/prawo_medyczne.jpg"
import publicHealth from "@/images/zdrowie.jpg"
import nursingBasic from "@/images/podstawy_pielegniarstwa.jpg"
import nursingEthics from "@/images/etyka_zawodowa.jpg"
import healthPromotion from "@/images/promocja_zdrowia.jpg"
import basicCare from "@/images/podstawowa_opieka.jpg"
import dietetics from "@/images/dietetyka.jpg"
import examination from "@/images/badania.jpg"
import infection from "@/images/zakazenia.jpg"
import information from "@/images/systemy.jpg"
import healthPublic from "@/images/zdrowie_publiczne.jpg"
import internalMedicine from "@/images/choroby_wewnetrzne.jpg"
import pediatrics from "@/images/pediatria.jpg"
import surgery from "@/images/chirurgia.jpg"
import gynecology from "@/images/poloznictwo.jpg"
import neurology from "@/images/neurologia.jpg"
import psychiatry from "@/images/psychiatria.jpg"
import anesthesiology from "@/images/anestezjologia.jpg"
import longTermCare from "@/images/pielegniarstwo_dlugoterminowe.jpg"
import geriatrics from "@/images/geriatria.jpg"
import organization from "@/images/organizacja.jpg"
import palliativeCare from "@/images/opieka_paliatywna.jpg"
import rehabilitation from "@/images/rehabilitacja.jpg"
import resuscitation from "@/images/ratownictwo.jpg"
import research from "@/images/badania.jpg"
import seminar from "@/images/seminarium.jpg"


export const curriculum: CurriculumBlock[] = [
  {
    id: "1",
    year: 1,  
    module: "Moduł A - Nauki podstawowe",
    image: basic,
    subjects: [
      { name: "Anatomia", hours: 90, ects: 4, exam: true, img: anatomy },
      { name: "Fizjologia", hours: 75, ects: 3, exam: true, img: physiology },
      {
        name: "Patologia / Patomorfologia / Patofizjologia",
        hours: 80,
        ects: 2,
        exam: true,
        img: pathology,
      },
      { name: "Genetyka", hours: 45, ects: 2, exam: true, img: genetics },
      { name: "Biochemia z biofizyką", hours: 50, ects: 2, exam: true, img: biochemistry },
      { name: "Mikrobiologia z parazytologią", hours: 50, ects: 2, exam: true, img: microbiology },
      { name: "Farmakologia", hours: 85, ects: 4, exam: true, img: pharmacology },
      { name: "Radiologia", hours: 25, ects: 1, exam: false, img: radiology },
    ],
  },
  {
    id: "2",
    year: 1,
    module: "Moduł B - Nauki społeczne i humanistyczne",
    image: social,
    subjects: [
      { name: "Psychologia", hours: 55, ects: 3, exam: true, img: psychology },
      { name: "Socjologia", hours: 40, ects: 1, exam: false, img: sociology },
      { name: "Pedagogika", hours: 50, ects: 2, exam: true , img: pedagogy },
      { name: "Prawo medyczne", hours: 55, ects: 2, exam: false , img: law },
      { name: "Zdrowie publiczne", hours: 45, ects: 2, exam: true , img: publicHealth },
    ],
  },
  {
    id: "3",
    year: 1,
    module: "Moduł C - Nauki w zakresie podstaw opieki pielęgniarskiej",
    image: nursing,
    subjects: [
      { name: "Podstawy pielęgniarstwa", hours: 205, ects: 8, exam: true , img: nursingBasic },
      { name: "Etyka zawodu pielęgniarki", hours: 45, ects: 1, exam: false , img: nursingEthics },
      { name: "Promocja zdrowia", hours: 55, ects: 1, exam: false , img: healthPromotion },
      { name: "Podstawowa opieka zdrowotna", hours: 55, ects: 3, exam: true , img: basicCare },
      { name: "Dietetyka", hours: 40, ects: 1, exam: false , img: dietetics },
      { name: "Badanie fizykalne", hours: 60, ects: 3, exam: true , img: examination },
      { name: "Zakażenia szpitalne", hours: 45, ects: 1, exam: false , img: infection },
      {
        name: "Systemy informacji w ochronie zdrowia",
        hours: 30,
        ects: 1,
        exam: false,
        img: information,
      },
    ],
  },
  {
    id: "4",
    year: 2,
    module: "Moduł B - Nauki społeczne i humanistyczne",
    image: social,
    subjects: [{ name: "Zdrowie publiczne", hours: 45, ects: 2, exam: true , img: healthPublic }],
  },
  {
    id: "5",
    year: 2,
    module: "Moduł D - Nauki w zakresie opieki specjalistycznej",
    image: specializedCare,
    subjects: [
      {
        name: "Choroby wewnętrzne i pielęgniarstwo internistyczne",
        hours: 100,
        ects: 3,
        exam: true,
        img: internalMedicine,
      },
      {
        name: "Pediatra i pelęgniarstwo pediatryczne",
        hours: 100,
        ects: 3,
        exam: true,
        img: pediatrics,
      },
      {
        name: "Chirurgia i pelęgniarstwo chirurgiczne",
        hours: 100,
        ects: 3,
        exam: true,
        img: surgery,
      },
      {
        name: "Położnictwo i ginekologia i pielęgniarstwo położniczo-ginekologiczne",
        hours: 55,
        ects: 1,
        exam: true,
        img: gynecology,
      },
      {
        name: "Neurologia i pielęgniarstwo neurologiczne",
        hours: 60,
        ects: 2,
        exam: true,
        img: neurology,
      },
    ],
  },
  {
    id: "6",
    year: 3,
    module: "Moduł C - Nauki w zakresie podstaw opieki pielęgniarskiej",
    image:  nursing,
    subjects: [
      {
        name: "Organizacja pracy pielęgniarki",
        hours: 45,
        ects: 2,
        exam: false,
        img: organization,
      },
    ],
  },
  {
    id: "7",
    year: 3,
    module: "Moduł D - Nauki w zakresie opieki specjalistycznej",
    image: specializedCare,
    subjects: [
      {
        name: "Psychiatria i pielęgniarstwo psychiatryczne",
        hours: 50,
        ects: 2,
        exam: true,
        img: psychiatry,
      },
      {
        name: "Anestezjologia i pielęgniarstwo w zagrożeniu życia",
        hours: 65,
        ects: 3,
        exam: true,
        img: anesthesiology,
      },
      {
        name: "Pielęgniarstwo opieki długoterminowej",
        hours: 55,
        ects: 2,
        exam: true,
        img: longTermCare,
      },
      {
        name: "Geriatria i pielęgniarstwo geriatryczne",
        hours: 60,
        ects: 2,
        exam: true,
        img: geriatrics,
      },
      { name: "Opieka paliatywna", hours: 55, ects: 1, exam: true, img: palliativeCare },
      { name: "Podstawy rehabilitacji", hours: 45, ects: 1, exam: false, img: rehabilitation },
      {
        name: "Podstawy ratownictwa medycznego",
        hours: 50,
        ects: 2,
        exam: true,
        img: resuscitation,
      },
      {
        name: "Badania naukowe w pielęgniarstwie",
        hours: 45,
        ects: 2,
        exam: false,
        img: research,
      },
      { name: "Seminarium dyplomowe", hours: 50, ects: 2, exam: false, img: seminar },
    ],
  },
];

export const careerPathsData: Record<string, PathData> = {
  "opiekun-medyczny": {
    title: "Opiekun Medyczny",
    description: "Nasz program edukacyjny został zaprojektowany zarówno dla osób rozpoczynających swoją drogę zawodową i przygotowujących się do egzaminu, jak i dla tych, którzy już pracują w branży i chcą rozwijać swoje kompetencje, utrwalać wiedzę lub przypomnieć sobie kluczowe zagadnienia przed kolejnym zawodowym wyzwaniem.",
    templateType: "simple",
    features: [
      {
        title: "Testy egzaminacyjne",
        titleBtn: "Duża baza testów!",
        description:
          "Darmowa baza testów oparta na egzaminach z ostatnich 2 lat i kursie na opiekuna medycznego. Trzy poziomy trudności – losowe pytania z całej dostępnej puli.",
        text: "Wybierz kierunek OM",
        imgSrc: exams,
        url: "/sign-up",
        icon: "tests",
      },
      {
        title: "Procedury Opiekuna Medycznego",
        titleBtn: "Procedury",
        description:
          "Lista procedur i algorytmów dla opiekunów medycznych. Ponad 31 dostępnych algorytmów, które każdy przyszły opiekun medyczny powinien znać.",
        text: "Wybierz kierunek OM",
        imgSrc: procedures,
        url: "/sign-up",
        icon: "procedure",
      },
      // {
        
      //   title: "Szczegółowe wyniki testów",
      //   titleBtn: "Twój wynik!",
      //   description:
      //     "Dostęp do szczegółowych wyników ukonczonych testów. Ocena i data wykonania. Możliwość sprawdzenia szczegółów i w przypadku błednych odpowiedzi podana jest też odpowiedz prawidłowa.",
      //   text: "Wybierz kierunek OM",
      //   imgSrc: img1,
      //   url: "/sign-up",
      //   icon: "score",
      // },
      {
        
        title: "Wyzwanie Procedury - Quiz",
        titleBtn: "Gry i quizy",
        description:
          "Zweryfikuj swoją znajomość procedur obowiązujących opiekuna medycznego. Wylosuj jedną z nich i sprawdź, czy pamiętasz, jak należy ją prawidłowo wykonać.",
        text: "Wybierz kierunek OM",
        imgSrc: quizes,
        url: "/sign-up",
        icon: "game",
      },
      {
        
        title: "Moduł do nauki",
        titleBtn: "Ucz się w swoim tempie!",
        description:
          "Każdy zarejestrowany użytkownik otrzymuje darmowy dostęp do wszystkich pytań i odpowiedzi. Wkrótce także materiały i książki dydaktyczne w formie cyfrowej.",
        text: "Wybierz kierunek OM",
        imgSrc: modules,
        url: "/sign-up",
        icon: "learn",
      }
    ],
    pricing: {
      standard: {
        price: "Dostęp darmowy: 0 zł/mies.",
        features: [
          "Dostęp do wszystkich pytań egzaminacyjnych",
          "Podstawowe materiały szkoleniowe",
          "Testy z ostatnich 2 lat"
        ]
      },
      premium: {
        price: "49,99 zł/mies.",
        features: [
          "Wszystko z planu darmowego",
          "Ponad 31 algorytmów i procedur",
          "Materiały i książki dydaktyczne (cyfrowe)",
          "Dostęp do modułu praktycznego",
          "Wyzwania i quizy procedur"
        ]
      }
    },
  },

  pielegniarstwo: {
    title: "Pielęgniarstwo",
    description:
      "Nowa kompletna ścieżka edukacyjna dla kierunku pielęgniarstwo - rozpocznij naukę już dziś !",
    templateType: "rich",
    curriculum,
    features: [
      {
        title: "Testy egzaminacyjne",
        titleBtn: "Duża baza testów!",
        description:
          "Stworzona na bazie programu studiów pielęgniarstwa, sprawdź swoją wiedzę na poziomie podstawowym, średnim i zaawansowanym.",
        text: "Wybierz kierunek Pielęgniarstwo",
        imgSrc: exams,
        url: "/sign-up",
        icon: "tests",
      },
      {
        title: "Moduł do nauki",
        titleBtn: "Ucz się w swoim tempie!",
        description:
          "Każdy zarejestrowany użytkownik otrzymuje darmowy dostęp do wszystkich pytań i odpowiedzi. Wkrótce także materiały i książki dydaktyczne w formie cyfrowej.",
        text: "Wybierz kierunek Pielęgniarstwo",
        imgSrc: modules,
        url: "/sign-up",
        icon: "learn",
      }
    ],
    pricing: {
      standard: {
        price: "Dostęp podstawowy: 39 zł/mies.",
        features: [
          "Dostęp do wszystkich pytań egzaminacyjnych",
          "Podstawowe materiały szkoleniowe",
          "Testy z ostatnich 2 lat"
        ]
      },
      premium: {
        price: "Dostęp rozszerzony: 59 zł/mies.",
        features: [
          "Wszystko z planu darmowego",
          "Ponad 31 algorytmów i procedur",
          "Materiały i książki dydaktyczne (cyfrowe)",
          "Dostęp do modułu praktycznego",
          "Wyzwania i quizy procedur"
        ]
      }
    },
    testimonials: [
      {
        quote:
          "Świetna platforma edukacyjna! Materiały są konkretne, a mapa programu pomaga zrozumieć cały tok nauczania.",
        author: "Anna, studentka pielęgniarstwa",
        role: "II rok",
      },
      {
        quote:
          "Przejrzyste moduły, testy i procedury – wszystko w jednym miejscu. Idealne wsparcie przed kolokwiami i praktykami.",
        author: "Michał, student pielęgniarstwa",
        role: "III rok",
      },
      {
        quote:
          "Najbardziej cenię możliwość szybkiego powtórzenia materiału i sprawdzenia się na quizach. Polecam!",
        author: "Katarzyna, absolwentka",
      },
    ],
  },
};
