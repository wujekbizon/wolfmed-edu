import { CurriculumBlock, PathData } from "@/types/careerPathsTypes";
import exams from "@/images/exams.jpg"
import procedures from "@/images/procedures.jpg"
import quizes from "@/images/quizes.jpg"
import modules from "@/images/modules.jpg"

export const curriculum: CurriculumBlock[] = [
  {
    id: "1",
    year: 1,
    module: "Moduł A - Nauki podstawowe",
    image: modules,
    subjects: [
      { name: "Anatomia", hours: 90, ects: 4, exam: true },
      { name: "Fizjologia", hours: 75, ects: 3, exam: true },
      {
        name: "Patologia / Patomorfologia / Patofizjologia",
        hours: 80,
        ects: 2,
        exam: true,
      },
      { name: "Genetyka", hours: 45, ects: 2, exam: true },
      { name: "Biochemia z biofizyką", hours: 50, ects: 2, exam: true },
      { name: "Mikrobiologia z parazytologią", hours: 50, ects: 2, exam: true },
      { name: "Farmakologia", hours: 85, ects: 4, exam: true },
      { name: "Radiologia", hours: 25, ects: 1, exam: false },
    ],
  },
  {
    id: "2",
    year: 1,
    module: "Moduł B - Nauki społeczne i humanistyczne",
    image: "",
    subjects: [
      { name: "Psychologia", hours: 55, ects: 3, exam: true },
      { name: "Socjologia", hours: 40, ects: 1, exam: false },
      { name: "Pedagogika", hours: 50, ects: 2, exam: true },
      { name: "Prawo medyczne", hours: 55, ects: 2, exam: false },
      { name: "Zdrowie publiczne", hours: 45, ects: 2, exam: true },
    ],
  },
  {
    id: "3",
    year: 1,
    module: "Moduł C - Nauki w zakresie podstaw opieki pielęgniarskiej",
    image: "",
    subjects: [
      { name: "Podstawy pielęgniarstwa", hours: 205, ects: 8, exam: true },
      { name: "Etyka zawodu pielęgniarki", hours: 45, ects: 1, exam: false },
      { name: "Promocja zdrowia", hours: 55, ects: 1, exam: false },
      { name: "Podstawowa opieka zdrowotna", hours: 55, ects: 3, exam: true },
      { name: "Dietetyka", hours: 40, ects: 1, exam: false },
      { name: "Badanie fizykalne", hours: 60, ects: 3, exam: true },
      { name: "Zakażenia szpitalne", hours: 45, ects: 1, exam: false },
      {
        name: "Systemy informacji w ochronie zdrowia",
        hours: 30,
        ects: 1,
        exam: false,
      },
    ],
  },
  {
    id: "4",
    year: 2,
    module: "Moduł B - Nauki społeczne i humanistyczne",
    image: "",
    subjects: [{ name: "Zdrowie publiczne", hours: 45, ects: 2, exam: true }],
  },
  {
    id: "5",
    year: 2,
    module: "Moduł D - Nauki w zakresie opieki specjalistycznej",
    image: "",
    subjects: [
      {
        name: "Choroby wewnętrzne i pielęgniarstwo internistyczne",
        hours: 100,
        ects: 3,
        exam: true,
      },
      {
        name: "Pediatra i pelęgniarstwo pediatryczne",
        hours: 100,
        ects: 3,
        exam: true,
      },
      {
        name: "Chirurgia i pelęgniarstwo chirurgiczne",
        hours: 100,
        ects: 3,
        exam: true,
      },
      {
        name: "Położnictwo i ginekologia i pielęgniarstwo położniczo-ginekologiczne",
        hours: 55,
        ects: 1,
        exam: true,
      },
      {
        name: "Neurologia i pielęgniarstwo neurologiczne",
        hours: 60,
        ects: 2,
        exam: true,
      },
    ],
  },
  {
    id: "6",
    year: 3,
    module: "Moduł C - Nauki w zakresie podstaw opieki pielęgniarskiej",
    image: "",
    subjects: [
      {
        name: "Organizacja pracy pielęgniarki",
        hours: 45,
        ects: 2,
        exam: false,
      },
    ],
  },
  {
    id: "7",
    year: 3,
    module: "Moduł D - Nauki w zakresie opieki specjalistycznej",
    image: "",
    subjects: [
      {
        name: "Psychiatria i pielęgniarstwo psychiatryczne",
        hours: 50,
        ects: 2,
        exam: true,
      },
      {
        name: "Anestezjologia i pielęgniarstwo w zagrożeniu życia",
        hours: 65,
        ects: 3,
        exam: true,
      },
      {
        name: "Pielęgniarstwo opieki długoterminowej",
        hours: 55,
        ects: 2,
        exam: true,
      },
      {
        name: "Geriatria i pielęgniarstwo geriatryczne",
        hours: 60,
        ects: 2,
        exam: true,
      },
      { name: "Opieka paliatywna", hours: 55, ects: 1, exam: true },
      { name: "Podstawy rehabilitacji", hours: 45, ects: 1, exam: false },
      {
        name: "Podstawy ratownictwa medycznego",
        hours: 50,
        ects: 2,
        exam: true,
      },
      {
        name: "Badania naukowe w pielęgniarstwie",
        hours: 45,
        ects: 2,
        exam: false,
      },
      { name: "Seminarium dyplomowe", hours: 50, ects: 2, exam: false },
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
