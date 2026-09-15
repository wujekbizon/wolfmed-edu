import { CurriculumBlock, PathData } from '@/types/careerPathsTypes'
import { OPIEKUN_MEDYCZNY_STORY } from '@/constants/careerStory'
import { OPIEKUN_MEDYCZNY_PATH } from '@/constants/careerPath'
import { PIELEGNIARSTWO_STORY } from '@/constants/pielegniarstwoStory'
import { ENGLISH_MEDICAL_STORY } from '@/constants/englishMedicalStory'

export const careerPaths = [
  {
    slug: 'opiekun-medyczny',
    title: 'Opiekun Medyczny',
    teaser:
      'Zdobądź kompleksową wiedzę i przygotuj się do egzaminu na Opiekuna Medycznego – sprawdź naszą ofertę.',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5RgLCs7moJ4bO3G5lMSTzfQXhE0VIeNdPaZLn',
    cta: 'Sprawdź szczegóły'
  },
  {
    slug: 'pielegniarstwo',
    title: 'Pielęgniarstwo',
    teaser:
      'Kompletna ścieżka edukacyjna dla kierunku Pielęgniarstwo – ponad 2000 pytań egzaminacyjnych z 1. semestru.',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5ZbFLvNrONPcnEXeA3kx1jV6t9rCB2UlzoaSM',
    cta: 'Sprawdź szczegóły'
  },
  {
    slug: 'angielski-medyczny',
    title: 'Angielski Medyczny',
    teaser:
      'Poznaj angielskie terminy i wyrażenia potrzebne w pracy medycznej oraz przygotuj się do egzaminów z języka angielskiego na pielęgniarstwie i kierunku opiekuna medycznego.',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k52osKX2SEBiUD8sVXHObYqkj3TNfo4PKMGg6J',
    cta: 'Sprawdź szczegóły'
  },
  {
    slug: 'jezyk-migowy',
    title: 'Polski Język Migowy (PJM)',
    teaser:
      'Poznaj podstawy Polskiego Języka Migowego i lepiej przygotuj się do kontaktu z pacjentem Głuchym.',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5mMYlJUZ7X6gGeKqRUixZb41zLrcWStM5HDAk',
    cta: 'Sprawdź szczegóły'
  }
]

export const curriculum: CurriculumBlock[] = [
  {
    id: '1',
    year: 1,
    module: 'Moduł A - Nauki podstawowe',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k55TMQo0nBKUAhkYmyprxV4JznuWGliEwXqgb2',
    subjects: [
      {
        name: 'Anatomia',
        hours: 90,
        ects: 4,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k52G1vt6SEBiUD8sVXHObYqkj3TNfo4PKMGg6J'
      },
      {
        name: 'Fizjologia',
        hours: 75,
        ects: 3,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UN2L0ZIxs2k5EyuGdN4SRigYP6qreJDvtVZl'
      },
      {
        name: 'Patologia / Patomorfologia / Patofizjologia',
        hours: 80,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5kfYUFUA5zS3pZrqLGeEj7tHO6cdWvCYm4N2R'
      },
      {
        name: 'Genetyka',
        hours: 45,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5D2kdG57Z2fx3PC4csA61VRoig5ELrXbvQz8K'
      },
      {
        name: 'Biochemia z biofizyką',
        hours: 50,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5bHmZPN10lAXCNeHTtQdjmyVvPInzGfZrLsw9'
      },
      {
        name: 'Mikrobiologia z parazytologią',
        hours: 50,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5QNXUuJYf6PZ5eKuhFM9REHkAy4n7s3aNYmWi'
      },
      {
        name: 'Farmakologia',
        hours: 85,
        ects: 4,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5pu33VvXHWiBDmgJ5wlKFsnLYVX34eQIkxfvb'
      },
      {
        name: 'Radiologia',
        hours: 25,
        ects: 1,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k572wvLXLMpcn5R2Y4TWoEbjyPSwZtlvLxBXzi'
      }
    ]
  },
  {
    id: '2',
    year: 1,
    module: 'Moduł B - Nauki społeczne i humanistyczne',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k52npmcHSEBiUD8sVXHObYqkj3TNfo4PKMGg6J',
    subjects: [
      {
        name: 'Psychologia',
        hours: 55,
        ects: 3,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5kbdfnVA5zS3pZrqLGeEj7tHO6cdWvCYm4N2R'
      },
      {
        name: 'Socjologia',
        hours: 40,
        ects: 1,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5nt6oObL9GQYxNri4Uw0MejlVEP63mgKp18FO'
      },
      {
        name: 'Pedagogika',
        hours: 50,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5bp3ERm10lAXCNeHTtQdjmyVvPInzGfZrLsw9'
      },
      {
        name: 'Prawo medyczne',
        hours: 55,
        ects: 2,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5JajIrkmQWsLSvF0ZVh7qXdCNxbjatwczey8g'
      },
      {
        name: 'Zdrowie publiczne',
        hours: 45,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k54pC04HH9lLqODmv7er0SPRQB8C9VnfbTHisc'
      }
    ]
  },
  {
    id: '3',
    year: 1,
    module: 'Moduł C - Nauki w zakresie podstaw opieki pielęgniarskiej',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5vbKwqk8g1osWNRSp0OXdUmcQAhVqCtZH5D7Y',
    subjects: [
      {
        name: 'Podstawy pielęgniarstwa',
        hours: 205,
        ects: 8,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5gOhTeFK1JZolbvwfgWCAFPh8xz9BIKNsVjGk'
      },
      {
        name: 'Etyka zawodu pielęgniarki',
        hours: 45,
        ects: 1,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5KqquTG6br79T0mSRj6eAJqPf4kEid2ncgM5N'
      },
      {
        name: 'Promocja zdrowia',
        hours: 55,
        ects: 1,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k52bP49YSEBiUD8sVXHObYqkj3TNfo4PKMGg6J'
      },
      {
        name: 'Podstawowa opieka zdrowotna',
        hours: 55,
        ects: 3,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5MuPZEoNpIgLRq2SWA1u9QmzbxiHJl47OaTGX'
      },
      {
        name: 'Dietetyka',
        hours: 40,
        ects: 1,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5JrZfRllmQWsLSvF0ZVh7qXdCNxbjatwczey8'
      },
      {
        name: 'Badanie fizykalne',
        hours: 60,
        ects: 3,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5TrNkKU6spcKHld4CGX8o0kyJTPUwfnQEMegN'
      },
      {
        name: 'Zakażenia szpitalne',
        hours: 45,
        ects: 1,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5s4bwXrWj5zfQ3u7I8bUgG0ydxCaMOwLKeVP6'
      },
      {
        name: 'Systemy informacji w ochronie zdrowia',
        hours: 30,
        ects: 1,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5L6WOW0yT6ikNIWjyZsOdaGtHcBb3PAS8E7u5'
      }
    ]
  },
  {
    id: '4',
    year: 2,
    module: 'Moduł B - Nauki społeczne i humanistyczne',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k52npmcHSEBiUD8sVXHObYqkj3TNfo4PKMGg6J',
    subjects: [
      {
        name: 'Zdrowie publiczne',
        hours: 45,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5rKVZXnDJ4x1k8yEQjwiVOufWtG7U0K2FIB5C'
      }
    ]
  },
  {
    id: '5',
    year: 2,
    module: 'Moduł D - Nauki w zakresie opieki specjalistycznej',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5wujuFw4stcXZNvjLlr5ady1QbVDuRB7qTC8f',
    subjects: [
      {
        name: 'Choroby wewnętrzne i pielęgniarstwo internistyczne',
        hours: 100,
        ects: 3,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5EsWLi5icmxY7yfWXOQoKS6ujlVhadLJtzgFp'
      },
      {
        name: 'Pediatra i pelęgniarstwo pediatryczne',
        hours: 100,
        ects: 3,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UEui6vIxs2k5EyuGdN4SRigYP6qreJDvtVZl'
      },
      {
        name: 'Chirurgia i pelęgniarstwo chirurgiczne',
        hours: 100,
        ects: 3,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5G5GvuJptmTzWn2MCIiBjAQoFa6kbwYUZJScD'
      },
      {
        name: 'Położnictwo i ginekologia i pielęgniarstwo położniczo-ginekologiczne',
        hours: 55,
        ects: 1,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5BiLJRlEFD1UJjByX9nEY7CcT26HaQ4iwRItP'
      },
      {
        name: 'Neurologia i pielęgniarstwo neurologiczne',
        hours: 60,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5arfwh6ktQrdmqhSKIRj5fanksB630Te2FpiO'
      }
    ]
  },
  {
    id: '6',
    year: 3,
    module: 'Moduł C - Nauki w zakresie podstaw opieki pielęgniarskiej',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5vbKwqk8g1osWNRSp0OXdUmcQAhVqCtZH5D7Y',
    subjects: [
      {
        name: 'Organizacja pracy pielęgniarki',
        hours: 45,
        ects: 2,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5rMpctujDJ4x1k8yEQjwiVOufWtG7U0K2FIB5'
      }
    ]
  },
  {
    id: '7',
    year: 3,
    module: 'Moduł D - Nauki w zakresie opieki specjalistycznej',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5wujuFw4stcXZNvjLlr5ady1QbVDuRB7qTC8f',
    subjects: [
      {
        name: 'Psychiatria i pielęgniarstwo psychiatryczne',
        hours: 50,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5Esgan2xcmxY7yfWXOQoKS6ujlVhadLJtzgFp'
      },
      {
        name: 'Anestezjologia i pielęgniarstwo w zagrożeniu życia',
        hours: 65,
        ects: 3,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5AyzkbsTmtJLFcNxMQbgSqKBWs3zA7RoEVreO'
      },
      {
        name: 'Pielęgniarstwo opieki długoterminowej',
        hours: 55,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k553dSzbnBKUAhkYmyprxV4JznuWGliEwXqgb2'
      },
      {
        name: 'Geriatria i pielęgniarstwo geriatryczne',
        hours: 60,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5GMV4f0ptmTzWn2MCIiBjAQoFa6kbwYUZJScD'
      },
      {
        name: 'Opieka paliatywna',
        hours: 55,
        ects: 1,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5buIgEa10lAXCNeHTtQdjmyVvPInzGfZrLsw9'
      },
      {
        name: 'Podstawy rehabilitacji',
        hours: 45,
        ects: 1,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5GP9lE8ptmTzWn2MCIiBjAQoFa6kbwYUZJScD'
      },
      {
        name: 'Podstawy ratownictwa medycznego',
        hours: 50,
        ects: 2,
        exam: true,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k58iLAeJ4HBZxypP1UFjuAhJ4WoOXgcGSRqzCi'
      },
      {
        name: 'Badania naukowe w pielęgniarstwie',
        hours: 45,
        ects: 2,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5J4d8yhmQWsLSvF0ZVh7qXdCNxbjatwczey8g'
      },
      {
        name: 'Seminarium dyplomowe',
        hours: 50,
        ects: 2,
        exam: false,
        img: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5wuHh2dFstcXZNvjLlr5ady1QbVDuRB7qTC8f'
      }
    ]
  }
]

export const careerPathsData: Record<string, PathData> = {
  'opiekun-medyczny': {
    story: OPIEKUN_MEDYCZNY_STORY,
    careerPath: OPIEKUN_MEDYCZNY_PATH,
    title: 'Opiekun Medyczny',
    description:
      'Nasz program edukacyjny wspiera zarówno osoby przygotowujące się do egzaminu, jak i tych, którzy już pracują w branży i chcą utrwalać wiedzę oraz rozwijać kompetencje przed kolejnym zawodowym wyzwaniem.',
    templateType: 'simple',
    features: [
      {
        title: 'Testy egzaminacyjne',
        titleBtn: 'Duża baza testów!',
        description:
          'Baza testów oparta na skrypcie i egzaminach Opiekuna Medycznego. Losowe pytania z całej dostępnej puli.',
        text: 'Testy praktyczne i Egzaminy',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k57DgZT4Mpcn5R2Y4TWoEbjyPSwZtlvLxBXziD',
        url: '/panel/testy',
        icon: 'tests'
      },
      {
        title: 'Procedury Opiekuna Medycznego',
        titleBtn: 'Procedury',
        description:
          'Lista procedur i algorytmów dla opiekunów medycznych. Ponad 31 dostępnych algorytmów, które każdy przyszły opiekun medyczny powinien znać.',
        text: 'Procedury medyczne',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5Rgqyd4roJ4bO3G5lMSTzfQXhE0VIeNdPaZLn',
        url: '/panel/procedury',
        icon: 'procedure'
      },
      {
        title: 'Szczegółowe wyniki testów',
        titleBtn: 'Twój wynik!',
        description:
          'Dostęp do szczegółowych wyników ukonczonych testów. Ocena i data wykonania. Możliwość sprawdzenia szczegółów odpowiedzi.',
        text: 'Szczegółowe wyniki',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k510BmDcqGqbaom6K7MQNgznelwU0cYLvsXOjS',
        url: '/panel/wyniki',
        icon: 'score'
      },
      {
        title: 'Wyzwania Procedur - Quizy',
        titleBtn: 'Gry i quizy',
        description:
          '5 quizów i wyzwań dla każdej procedury. Ukończ wszystkie i zdobądż odznakę.',
        text: 'Quizy i wyzwania',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5Nyh9LK2M1UuCEmiKr7chszHj6GeZpqAJ4w2g',
        url: '/panel/procedury',
        icon: 'game'
      },
      {
        title: 'Moduł do nauki',
        titleBtn: 'Ucz się w swoim tempie!',
        description:
          'Każdy zarejestrowany użytkownik otrzymuje dostęp do wybranych pytań i odpowiedzi. Pełna baza pytań, materiały oraz książki dydaktyczne w formie cyfrowej dostępne są w ramach subskrypcji.',
        text: 'Centrum Nauki',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5mMYlJUZ7X6gGeKqRUixZb41zLrcWStM5HDAk',
        url: '/panel/nauka',
        icon: 'learn'
      },
      {
        title: 'Asystent AI',
        titleBtn: 'Ucz się z pomocą AI!',
        description:
          'Zadawaj pytania, sprawdzaj wiedzę i otrzymuj natychmiastowe wyjaśnienia. Asystent AI dostępny w ramach subskrypcji.',
        text: 'AI Asystent',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5H6zCTyRXZAfUgQh6yMWki0EFjo5rbcJDS2mP',
        url: '/panel/ai',
        icon: 'ai'
      }
    ],
    pricing: {
      courseSlug: 'opiekun-medyczny',
      basic: {
        price: '159,99 zł',
        offerKey: 'opiekun_basic_lifetime',
        accessTier: 'basic',
        badge: 'Oferta na start',
        features: [
          'Ponad 900 pytań z egzaminów i kursu na Opiekuna Medycznego',
          'Testy praktyczne i Egzamin Próbny',
          'Procedury Opiekuna Medycznego',
          'Fiszki, notatki i plan nauki z analizą postępów',
          'Wyzwania i quizy procedur — zdobywaj odznaki',
          'Forum i Blog Medyczny'
        ]
      },
      premium: {
        price: '449,99 zł',
        offerKey: 'opiekun_premium_lifetime',
        accessTier: 'premium',
        badge: 'Oferta na start',
        features: [
          'Wszystko z planu Standard',
          'Angielski medyczny Basic gratis',
          'Każda nowa treść dodawana automatycznie – bez dodatkowych opłat',
          'Asystent AI, który zna cały materiał egzaminacyjny',
          'Automatyczne notatki, streszczenia i wykłady audio',
          'Własne testy i quizy generowane przez AI',
          'Edytowalne diagramy i interaktywna tablica'
        ]
      }
    }
  },
  pielegniarstwo: {
    story: PIELEGNIARSTWO_STORY,
    title: 'Pielęgniarstwo',
    description:
      'Nowa kompletna ścieżka edukacyjna dla kierunku pielęgniarstwo - rozpocznij naukę już dziś !',
    templateType: 'rich',
    curriculum,
    features: [
      {
        title: 'Testy egzaminacyjne',
        titleBtn: 'Duża baza testów!',
        description:
          'Stworzona na bazie programu studiów pielęgniarstwa, sprawdź swoją wiedzę. Ponad 2000 pytań z pierwszego semestru.',
        text: 'Testy praktyczne i Egzaminy',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k57DgZT4Mpcn5R2Y4TWoEbjyPSwZtlvLxBXziD',
        url: '/panel/testy',
        icon: 'tests'
      },
      {
        title: 'Szczegółowe wyniki testów',
        titleBtn: 'Twój wynik!',
        description:
          'Dostęp do szczegółowych wyników ukończonych testów. Ocena i data wykonania. Możliwość sprawdzenia szczegółów odpowiedzi.',
        text: 'Szczegółowe wyniki',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k510BmDcqGqbaom6K7MQNgznelwU0cYLvsXOjS',
        url: '/panel/wyniki',
        icon: 'score'
      },
      {
        title: 'Moduł do nauki',
        titleBtn: 'Ucz się w swoim tempie!',
        description:
          'Każdy zarejestrowany użytkownik otrzymuje dostęp do wybranych pytań i odpowiedzi. Pełna baza pytań oraz materiały dydaktyczne dostępne są w ramach subskrypcji.',
        text: 'Centrum Nauki',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5mMYlJUZ7X6gGeKqRUixZb41zLrcWStM5HDAk',
        url: '/panel/nauka',
        icon: 'learn'
      },
      {
        title: 'Mapa programu nauczania',
        titleBtn: 'Program studiów',
        description:
          'Przeglądaj pełny program studiów pielęgniarskich – wszystkie moduły, przedmioty, godziny i punkty ECTS według roku nauki.',
        text: 'Zobacz program nauczania',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5vbKwqk8g1osWNRSp0OXdUmcQAhVqCtZH5D7Y',
        url: '/kierunki/pielegniarstwo/#mapa',
        icon: 'curriculum'
      },
      {
        title: 'Asystent AI',
        titleBtn: 'Ucz się z pomocą AI!',
        description:
          'Zadawaj pytania, sprawdzaj wiedzę i otrzymuj natychmiastowe wyjaśnienia dopasowane do programu pielęgniarstwa. Asystent AI dostępny w ramach subskrypcji.',
        text: 'AI Asystent',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5H6zCTyRXZAfUgQh6yMWki0EFjo5rbcJDS2mP',
        url: '/panel/nauka',
        icon: 'ai'
      }
    ],
    pricing: {
      courseSlug: 'pielegniarstwo',
      basic: {
        price: '279,99 zł',
        offerKey: 'pielegniarstwo_basic_lifetime',
        accessTier: 'basic',
        badge: 'Oferta na start',
        features: [
          'Ponad 22 700 pytań egzaminacyjnych z 22 kategorii',
          'Przedmioty podstawowe, kierunkowe i specjalizacje kliniczne',
          'Testy praktyczne i egzaminy próbne',
          'Fiszki, notatki i plan nauki z analizą postępów',
          'Wyzwania i quizy — zdobywaj odznaki',
          'Forum i Blog Medyczny'
        ]
      },
      premium: {
        price: '599,99 zł',
        offerKey: 'pielegniarstwo_premium_lifetime',
        accessTier: 'premium',
        badge: 'Oferta na start',
        features: [
          'Wszystko z planu Standard',
          'Angielski medyczny Basic gratis',
          'Pełne 3 lata nauki – nowe semestry dodawane automatycznie',
          'Diagnozy i Interwencje – pełny proces pielęgnowania',
          'Asystent AI, który zna cały materiał pielęgniarski',
          'Automatyczne notatki, streszczenia i wykłady audio',
          'Własne testy AI, edytowalne diagramy i tablica'
        ]
      }
    }
  },
  'angielski-medyczny': {
    story: ENGLISH_MEDICAL_STORY,
    title: 'Angielski Medyczny',
    description:
      'Praktyczny kurs języka angielskiego medycznego na poziomie A2. Naucz się terminów, wyrażeń i poprawnych zdań potrzebnych w pracy z pacjentem oraz przygotuj się do egzaminów na pielęgniarstwie i kierunku opiekuna medycznego.',
    templateType: 'simple',
    features: [
      {
        title: 'Słownictwo medyczne A2',
        titleBtn: 'Najważniejsze terminy',
        description:
          'Poznaj angielskie nazwy części ciała, objawów, parametrów życiowych, personelu, sprzętu i podstawowego leczenia.',
        text: 'Słownictwo medyczne',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5A7rR6OTmtJLFcNxMQbgSqKBWs3zA7RoEVreO',
        url: '/panel/testy',
        icon: 'tests'
      },
      {
        title: 'Komunikacja z pacjentem',
        titleBtn: 'Rozmawiaj pewniej',
        description:
          'Ćwicz proste pytania, uprzejme zwroty i instrukcje używane podczas przyjęcia, badania i codziennej opieki.',
        text: 'Pacjent i personel',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5QgTyo0Yf6PZ5eKuhFM9REHkAy4n7s3aNYmWi',
        url: '/panel/testy',
        icon: 'learn'
      },
    ],
    pricing: {
      courseSlug: 'angielski-medyczny',
      basic: {
        price: '29,99 zł',
        offerKey: 'angielski_medyczny_basic_lifetime',
        accessTier: 'basic',
        badge: 'Oferta na start',
        features: [
          '5 kategorii angielskiego medycznego na poziomie A2',
          'Terminy i wyrażenia potrzebne w pracy z pacjentem',
          'Poprawne zdania medyczne i podstawowa gramatyka',
          'Przygotowanie do egzaminów na pielęgniarstwie i kierunku opiekuna medycznego',
          'Fiszki, notatki i plan nauki z analizą postępów',
          'Forum i Blog Medyczny'
        ]
      },
      premium: {
        price: '49,99 zł',
        offerKey: 'angielski_medyczny_premium_lifetime',
        accessTier: 'premium',
        badge: 'Wkrótce dostępny',
        features: [
          'Wszystko z planu Basic',
          'Rozszerzone materiały i nowe kategorie',
          'Asystent AI do nauki angielskiego medycznego',
          'Automatyczne notatki, streszczenia i wykłady audio',
          'Testy i quizy generowane przez AI'
        ]
      }
    }
  },
  'jezyk-migowy': {
    title: 'Polski Język Migowy (PJM)',
    description:
      'Praktyczne podstawy Polskiego Języka Migowego oraz zasady pierwszego kontaktu z pacjentem Głuchym.',
    templateType: 'simple',
    features: [
      {
        title: 'Podstawy PJM',
        titleBtn: 'Poznaj podstawy',
        description:
          'Ucz się przez pytania o komunikację, alfabet, znaki, kulturę Głuchych i sytuacje z pacjentem.',
        text: 'Kategorie PJM',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5mMYlJUZ7X6gGeKqRUixZb41zLrcWStM5HDAk',
        url: '/panel/testy',
        icon: 'tests'
      },
      {
        title: 'Komunikacja z pacjentem',
        titleBtn: 'Ćwicz sytuacje',
        description:
          'Rozpoznawaj właściwe reakcje i zasady kontaktu w podstawowych sytuacjach medycznych.',
        text: 'Pacjent i personel',
        imgSrc:
          'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5QgTyo0Yf6PZ5eKuhFM9REHkAy4n7s3aNYmWi',
        url: '/panel/testy',
        icon: 'learn'
      }
    ],
    pricing: {
      courseSlug: 'jezyk-migowy',
      basic: {
        price: 'Cena wkrótce',
        offerKey: 'jezyk_migowy_basic_lifetime',
        accessTier: 'basic',
        badge: 'Wkrótce dostępny',
        features: [
          'Podstawy PJM, alfabet i liczebniki',
          'Pierwszy kontakt z pacjentem Głuchym',
          'Podstawowe zasady komunikacji i kultury Głuchych',
          'Testy, wyniki, notatki i plan nauki'
        ]
      },
      premium: {
        price: 'Cena wkrótce',
        offerKey: 'jezyk_migowy_premium_lifetime',
        accessTier: 'premium',
        badge: 'Wkrótce dostępny',
        features: [
          'Wszystko z planu Basic',
          'Rozszerzone sytuacje z pacjentem',
          'Gramatyka PJM i praktyka SignWriting',
          'Narzędzia AI Wolfmed zgodnie z dostępem Premium'
        ]
      }
    }
  }
}
