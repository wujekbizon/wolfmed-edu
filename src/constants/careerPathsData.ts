import { CurriculumBlock, PathData } from "@/types/careerPathsTypes";

export const curriculum: CurriculumBlock[] = [
  {
    id: "1",
    year: 1,  
    module: "Moduł A - Nauki podstawowe",
    image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k55TMQo0nBKUAhkYmyprxV4JznuWGliEwXqgb2',
    subjects: [
      { name: "Anatomia", hours: 90, ects: 4, exam: true, img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k52G1vt6SEBiUD8sVXHObYqkj3TNfo4PKMGg6J' },
      { name: "Fizjologia", hours: 75, ects: 3, exam: true, img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UN2L0ZIxs2k5EyuGdN4SRigYP6qreJDvtVZl' },
      {
        name: "Patologia / Patomorfologia / Patofizjologia",
        hours: 80,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5kfYUFUA5zS3pZrqLGeEj7tHO6cdWvCYm4N2R',
      },
      { name: "Genetyka", hours: 45, ects: 2, exam: true, img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5D2kdG57Z2fx3PC4csA61VRoig5ELrXbvQz8K' },
      { name: "Biochemia z biofizyką", hours: 50, ects: 2, exam: true, img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5bHmZPN10lAXCNeHTtQdjmyVvPInzGfZrLsw9' },
      { name: "Mikrobiologia z parazytologią", hours: 50, ects: 2, exam: true, img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5QNXUuJYf6PZ5eKuhFM9REHkAy4n7s3aNYmWi' },
      { name: "Farmakologia", hours: 85, ects: 4, exam: true, img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5pu33VvXHWiBDmgJ5wlKFsnLYVX34eQIkxfvb' },
      { name: "Radiologia", hours: 25, ects: 1, exam: false, img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k572wvLXLMpcn5R2Y4TWoEbjyPSwZtlvLxBXzi' },
    ],
  },
  {
    id: "2",
    year: 1,
    module: "Moduł B - Nauki społeczne i humanistyczne",
    image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k52npmcHSEBiUD8sVXHObYqkj3TNfo4PKMGg6J',
    subjects: [
      { name: "Psychologia", hours: 55, ects: 3, exam: true, img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5kbdfnVA5zS3pZrqLGeEj7tHO6cdWvCYm4N2R' },
      { name: "Socjologia", hours: 40, ects: 1, exam: false, img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5nt6oObL9GQYxNri4Uw0MejlVEP63mgKp18FO' },
      { name: "Pedagogika", hours: 50, ects: 2, exam: true , img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5bp3ERm10lAXCNeHTtQdjmyVvPInzGfZrLsw9' },
      { name: "Prawo medyczne", hours: 55, ects: 2, exam: false , img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5JajIrkmQWsLSvF0ZVh7qXdCNxbjatwczey8g' },
      { name: "Zdrowie publiczne", hours: 45, ects: 2, exam: true , img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k54pC04HH9lLqODmv7er0SPRQB8C9VnfbTHisc' },
    ],
  },
  {
    id: "3",
    year: 1,
    module: "Moduł C - Nauki w zakresie podstaw opieki pielęgniarskiej",
    image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5vbKwqk8g1osWNRSp0OXdUmcQAhVqCtZH5D7Y',
    subjects: [
      { name: "Podstawy pielęgniarstwa", hours: 205, ects: 8, exam: true , img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5gOhTeFK1JZolbvwfgWCAFPh8xz9BIKNsVjGk' },
      { name: "Etyka zawodu pielęgniarki", hours: 45, ects: 1, exam: false , img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5KqquTG6br79T0mSRj6eAJqPf4kEid2ncgM5N' },
      { name: "Promocja zdrowia", hours: 55, ects: 1, exam: false , img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k52bP49YSEBiUD8sVXHObYqkj3TNfo4PKMGg6J' },
      { name: "Podstawowa opieka zdrowotna", hours: 55, ects: 3, exam: true , img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5MuPZEoNpIgLRq2SWA1u9QmzbxiHJl47OaTGX' },
      { name: "Dietetyka", hours: 40, ects: 1, exam: false , img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5JrZfRllmQWsLSvF0ZVh7qXdCNxbjatwczey8' },
      { name: "Badanie fizykalne", hours: 60, ects: 3, exam: true , img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5TrNkKU6spcKHld4CGX8o0kyJTPUwfnQEMegN' },
      { name: "Zakażenia szpitalne", hours: 45, ects: 1, exam: false , img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5s4bwXrWj5zfQ3u7I8bUgG0ydxCaMOwLKeVP6' },
      {
        name: "Systemy informacji w ochronie zdrowia",
        hours: 30,
        ects: 1,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5L6WOW0yT6ikNIWjyZsOdaGtHcBb3PAS8E7u5',
      },
    ],
  },
  {
    id: "4",
    year: 2,
    module: "Moduł B - Nauki społeczne i humanistyczne",
    image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k52npmcHSEBiUD8sVXHObYqkj3TNfo4PKMGg6J',
    subjects: [{ name: "Zdrowie publiczne", hours: 45, ects: 2, exam: true , img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5rKVZXnDJ4x1k8yEQjwiVOufWtG7U0K2FIB5C' }],
  },
  {
    id: "5",
    year: 2,
    module: "Moduł D - Nauki w zakresie opieki specjalistycznej",
    image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5wujuFw4stcXZNvjLlr5ady1QbVDuRB7qTC8f',
    subjects: [
      {
        name: "Choroby wewnętrzne i pielęgniarstwo internistyczne",
        hours: 100,
        ects: 3,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5EsWLi5icmxY7yfWXOQoKS6ujlVhadLJtzgFp',
      },
      {
        name: "Pediatra i pelęgniarstwo pediatryczne",
        hours: 100,
        ects: 3,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UEui6vIxs2k5EyuGdN4SRigYP6qreJDvtVZl',
      },
      {
        name: "Chirurgia i pelęgniarstwo chirurgiczne",
        hours: 100,
        ects: 3,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5G5GvuJptmTzWn2MCIiBjAQoFa6kbwYUZJScD',
      },
      {
        name: "Położnictwo i ginekologia i pielęgniarstwo położniczo-ginekologiczne",
        hours: 55,
        ects: 1,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5BiLJRlEFD1UJjByX9nEY7CcT26HaQ4iwRItP',
      },
      {
        name: "Neurologia i pielęgniarstwo neurologiczne",
        hours: 60,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5arfwh6ktQrdmqhSKIRj5fanksB630Te2FpiO',
      },
    ],
  },
  {
    id: "6",
    year: 3,
    module: "Moduł C - Nauki w zakresie podstaw opieki pielęgniarskiej",
    image:  'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5vbKwqk8g1osWNRSp0OXdUmcQAhVqCtZH5D7Y',
    subjects: [
      {
        name: "Organizacja pracy pielęgniarki",
        hours: 45,
        ects: 2,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5rMpctujDJ4x1k8yEQjwiVOufWtG7U0K2FIB5',
      },
    ],
  },
  {
    id: "7",
    year: 3,
    module: "Moduł D - Nauki w zakresie opieki specjalistycznej",
    image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5wujuFw4stcXZNvjLlr5ady1QbVDuRB7qTC8f',
    subjects: [
      {
        name: "Psychiatria i pielęgniarstwo psychiatryczne",
        hours: 50,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5Esgan2xcmxY7yfWXOQoKS6ujlVhadLJtzgFp',
      },
      {
        name: "Anestezjologia i pielęgniarstwo w zagrożeniu życia",
        hours: 65,
        ects: 3,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5AyzkbsTmtJLFcNxMQbgSqKBWs3zA7RoEVreO',
      },
      {
        name: "Pielęgniarstwo opieki długoterminowej",
        hours: 55,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k553dSzbnBKUAhkYmyprxV4JznuWGliEwXqgb2',
      },
      {
        name: "Geriatria i pielęgniarstwo geriatryczne",
        hours: 60,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5GMV4f0ptmTzWn2MCIiBjAQoFa6kbwYUZJScD',
      },
      { name: "Opieka paliatywna", hours: 55, ects: 1, exam: true, img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5buIgEa10lAXCNeHTtQdjmyVvPInzGfZrLsw9' },
      { name: "Podstawy rehabilitacji", hours: 45, ects: 1, exam: false, img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5GP9lE8ptmTzWn2MCIiBjAQoFa6kbwYUZJScD' },
      {
        name: "Podstawy ratownictwa medycznego",
        hours: 50,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k58iLAeJ4HBZxypP1UFjuAhJ4WoOXgcGSRqzCi',
      },
      {
        name: "Badania naukowe w pielęgniarstwie",
        hours: 45,
        ects: 2,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5J4d8yhmQWsLSvF0ZVh7qXdCNxbjatwczey8g',
      },
      { name: "Seminarium dyplomowe", hours: 50, ects: 2, exam: false, img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5wuHh2dFstcXZNvjLlr5ady1QbVDuRB7qTC8f' },
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
        imgSrc: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k57DgZT4Mpcn5R2Y4TWoEbjyPSwZtlvLxBXziD',
        url: "/sign-up",
        icon: "tests",
      },
      {
        title: "Procedury Opiekuna Medycznego",
        titleBtn: "Procedury",
        description:
          "Lista procedur i algorytmów dla opiekunów medycznych. Ponad 31 dostępnych algorytmów, które każdy przyszły opiekun medyczny powinien znać.",
        text: "Wybierz kierunek OM",
        imgSrc: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5Rgqyd4roJ4bO3G5lMSTzfQXhE0VIeNdPaZLn',
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
        imgSrc: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5Nyh9LK2M1UuCEmiKr7chszHj6GeZpqAJ4w2g',
        url: "/sign-up",
        icon: "game",
      },
      {
        
        title: "Moduł do nauki",
        titleBtn: "Ucz się w swoim tempie!",
        description:
          "Każdy zarejestrowany użytkownik otrzymuje darmowy dostęp do wszystkich pytań i odpowiedzi. Wkrótce także materiały i książki dydaktyczne w formie cyfrowej.",
        text: "Wybierz kierunek OM",
        imgSrc: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5mMYlJUZ7X6gGeKqRUixZb41zLrcWStM5HDAk',
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
        imgSrc: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k57DgZT4Mpcn5R2Y4TWoEbjyPSwZtlvLxBXziD',
        url: "/sign-up",
        icon: "tests",
      },
      {
        title: "Moduł do nauki",
        titleBtn: "Ucz się w swoim tempie!",
        description:
          "Każdy zarejestrowany użytkownik otrzymuje darmowy dostęp do wszystkich pytań i odpowiedzi. Wkrótce także materiały i książki dydaktyczne w formie cyfrowej.",
        text: "Wybierz kierunek Pielęgniarstwo",
        imgSrc: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5mMYlJUZ7X6gGeKqRUixZb41zLrcWStM5HDAk',
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
    }
  },
};
