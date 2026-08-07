import { CategoryMetadata } from '@/types/categoryType'

export const DEFAULT_CATEGORY_METADATA: CategoryMetadata = {
  category: '',
  course: '',
  requiredTier: 'free',
  image:
    'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5KkQtwIbr79T0mSRj6eAJqPf4kEid2ncgM5Nu',
  description: 'Twoja własna kategoria testów',
  duration: [25, 40, 60],
  popularity: 'Kategoria niestandardowa',
  status: true,
  numberOfQuestions: [10, 40]
}

export const CATEGORY_METADATA: Record<string, CategoryMetadata> = {
  'opiekun-medyczny': {
    category: 'opiekun-medyczny',
    course: 'opiekun-medyczny',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5g1iJE1dK1JZolbvwfgWCAFPh8xz9BIKNsVjG',
    description:
      'Przygotuj się do egzaminu Opiekuna Medycznego z naszymi kompleksowymi testami i pytaniami. Bogata baza pytań, która pomoże Ci w 100% przygotować sie do egzaminu państwowego i zdać za pierwszym razem!',
    duration: [25, 40, 60],
    popularity: 'Bardzo popularny',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Egzamin - Opiekun Medyczny',
    keywords: [
      'opiekun',
      'med-14',
      'egzamin',
      'testy',
      'pytania',
      'zagadnienia',
      'medyczno-pielęgnacyjnych',
      'opiekuńczych',
      'baza'
    ],
    details: {
      ects: 0,
      semester: 'Egzamin Państwowy na Opiekuna Medycznego',
      objectives:
        'Kompleksowe przygotowanie do egzaminu państwowego potwierdzającego kwalifikację MED.14 – Świadczenie usług medyczno-pielęgnacyjnych i opiekuńczych osobie chorej i niesamodzielnej. Systematyczna weryfikacja wiedzy i umiejętności z anatomii, fizjologii, farmakologii, procedur pielęgnacyjnych i opieki nad pacjentem.',
      prerequisites:
        'Ukończenie kursu kwalifikacyjnego na Opiekuna Medycznego lub odpowiedniego kształcenia zawodowego. Podstawowa wiedza z zakresu nauk o zdrowiu człowieka.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'MED14.W.1',
            desc: 'Zna budowę i funkcjonowanie układów i narządów człowieka w zakresie niezbędnym do sprawowania opieki nad osobą chorą i niesamodzielną.'
          },
          {
            code: 'MED14.W.2',
            desc: 'Zna objawy i powikłania chorób wymagających opieki medyczno-pielęgnacyjnej oraz zasady postępowania z pacjentem.'
          },
          {
            code: 'MED14.W.3',
            desc: 'Zna zasady farmakoterapii, przechowywania i podawania leków w zakresie uprawnień opiekuna medycznego.'
          },
          {
            code: 'MED14.W.4',
            desc: 'Zna zasady higieny, dezynfekcji, sterylizacji i profilaktyki zakażeń w placówkach ochrony zdrowia.'
          },
          {
            code: 'MED14.W.5',
            desc: 'Zna metody i techniki pomiaru podstawowych parametrów życiowych: tętna, ciśnienia, temperatury, oddechu, saturacji.'
          },
          {
            code: 'MED14.W.6',
            desc: 'Zna zasady żywienia, diety lecznicze oraz techniki podawania posiłków osobom z różnymi schorzeniami.'
          },
          {
            code: 'MED14.W.7',
            desc: 'Zna zasady rehabilitacji, aktywizacji ruchowej i profilaktyki powikłań wynikających z unieruchomienia pacjenta.'
          },
          {
            code: 'MED14.W.8',
            desc: 'Zna podstawy prawne i etyczne wykonywania zawodu opiekuna medycznego, prawa pacjenta oraz zasady dokumentowania opieki.'
          }
        ],
        skills: [
          {
            code: 'MED14.U.1',
            desc: 'Wykonuje podstawowe procedury pielęgnacyjne: toaletę ciała, zmianę bielizny, pielęgnację skóry i błon śluzowych.'
          },
          {
            code: 'MED14.U.2',
            desc: 'Mierzy i rejestruje podstawowe parametry życiowe, rozpoznaje nieprawidłowości i informuje personel medyczny.'
          },
          {
            code: 'MED14.U.3',
            desc: 'Asystuje przy czynnościach higienicznych, karmieniu, pozycjonowaniu i przemieszczaniu pacjenta z zachowaniem zasad BHP.'
          },
          {
            code: 'MED14.U.4',
            desc: 'Rozpoznaje zagrożenia zdrowia i życia pacjenta, podejmuje działania w stanach nagłych i udziela pierwszej pomocy.'
          },
          {
            code: 'MED14.U.5',
            desc: 'Komunikuje się z pacjentem, jego rodziną i zespołem terapeutycznym z zachowaniem zasad etyki i poufności.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Anatomia i fizjologia człowieka – układy i narządy istotne w opiece medycznej',
          'Choroby i zaburzenia wymagające opieki – objawy, powikłania, postępowanie',
          'Farmakologia dla opiekuna medycznego – rodzaje leków, zasady przechowywania i podawania',
          'Procedury pielęgnacyjne i medyczne – techniki i standardy wykonania',
          'Pomiar i monitorowanie parametrów życiowych – ciśnienie, tętno, temperatura, oddech, saturacja',
          'Higiena, dezynfekcja i profilaktyka zakażeń szpitalnych',
          'Żywienie i dietetyka w chorobie – diety lecznicze, techniki karmienia',
          'Rehabilitacja i aktywizacja pacjenta – profilaktyka odleżyn i przykurczów',
          'Komunikacja z pacjentem i zespołem terapeutycznym',
          'Etyka zawodu opiekuna medycznego i prawa pacjenta',
          'Podstawy prawne wykonywania zawodu – kwalifikacja MED.14',
          'Postępowanie w stanach nagłych – pierwsza pomoc, resuscytacja, algorytmy BLS'
        ],
        seminars: [],
        selfStudy: [
          'Samodzielne rozwiązywanie testów próbnych z bazy ponad 900 pytań egzaminacyjnych',
          'Analiza pytań z egzaminów państwowych z ostatnich 2 lat',
          'Utrwalanie 31 procedur i algorytmów opiekuna medycznego',
          'Przeglądanie szczegółowych wyników testów i identyfikacja obszarów do poprawy',
          'Rozwiązywanie wyzwań i quizów procedur'
        ]
      }
    }
  },
  anatomia: {
    category: 'anatomia',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k52G1vt6SEBiUD8sVXHObYqkj3TNfo4PKMGg6J',
    description:
      'Kompleksowe testy z anatomii dla studentów pielęgniarstwa. Poznaj budowę ciała ludzkiego, układy narządowe, struktury anatomiczne i ich funkcje. Idealne przygotowanie do egzaminów i praktyki zawodowej.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Anatomia',
    keywords: [
      'anatomia',
      'pielęgniarstwo',
      'budowa ciała',
      'układy narządowe',
      'struktura anatomiczna',
      'kości',
      'mięśnie',
      'narządy',
      'egzamin pielęgniarski',
      'testy wiedzy',
      'pytania egzaminacyjne'
    ],
    details: {
      ects: 4,
      semester: 'Rok I, Semestr I',
      objectives:
        'Głównym celem kursu anatomii jest zapoznanie studentów z budową ciała ludzkiego oraz wzajemnymi relacjami poszczególnych jego części z nawiązaniem do aspektów klinicznych.',
      prerequisites:
        'Podstawowe wiadomości z zakresu biologii, obejmujące podstawy nauki o człowieku.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'AN.W.1',
            desc: 'Omawia budowę ciała ludzkiego w podejściu topograficznym (kończyny górna i dolna, klatka piersiowa, brzuch, miednica, grzbiet, szyja, głowa) i czynnościowym (układ kostno-stawowy, układ mięśniowy, układ krążenia, układ oddechowy, układ pokarmowy, układ moczowy, układy płciowe, układ nerwowy, narządy zmysłów, powłoka wspólna).'
          }
        ],
        skills: [
          {
            code: 'AN.U.1',
            desc: 'Posługuje się w praktyce mianownictwem anatomicznym oraz wykorzystuje znajomość topografii narządów ciała ludzkiego.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Narządy i układy, części ciała i okolice, jamy ciała',
          'Budowa narządu ruchu (kości, mięśnie, stawy)',
          'Układ krążenia: budowa serca, podział i budowa naczyń krwionośnych, krążenie małe i duże, budowa śledziony',
          'Układ chłonny: naczynia chłonne, węzły chłonne, chłonka i jej krążenie',
          'Układ oddechowy: budowa nosa, krtani, tchawicy i oskrzeli, płuc i opłucnej',
          'Układ trawienny: budowa jamy ustnej, gardzieli i gardła, przełyku, żołądka, jelita cienkiego, jelita grubego, wątroby, trzustki',
          'Układ moczowo-płciowy: budowa nerek, moczowodów, pęcherza moczowego, cewki moczowej, budowa narządów płciowych męskich i żeńskich',
          'Gruczoły dokrewne: budowa gruczołu tarczowego, gruczołów przytarczycznych, części wewnątrzwydzielniczej trzustki, grasicy',
          'Układ nerwowy: budowa układu ośrodkowego, obwodowego i autonomicznego',
          'Receptory i narządy zmysłów',
          'Powłoka wspólna'
        ],
        seminars: [
          'Kości szkieletu osiowego i kończyn. Czaszka. Ogólna budowa mięśni i ich narządów pomocniczych. Układ mięśniowy',
          'Podział układu nerwowego. Morfologia centralnego układu nerwowego. Ośrodki i drogi nerwowe',
          'Narządy zmysłów. Układ wewnątrzwydzielniczy',
          'Układ autonomiczny. Nerwy rdzeniowe',
          'Nerwy czaszkowe',
          'Jama nosowa, gardło i krtań. Układ oddechowy',
          'Jama ustna, ślinianki i przełyk. Układ trawienny. Otrzewna',
          'Nerka. Układ moczowy. Układ płciowy męski',
          'Układ płciowy żeński. Dno miednicy',
          'Budowa ogólna i podział układu krążenia. Serce. Krążenie małe. Tętnice krążenia dużego. Żyły. Krążenie płodowe. Układ chłonny',
          'Anatomia topograficzna'
        ],
        selfStudy: [
          'Zaburzenia rozwojowe układów i narządów',
          'Zmiany w strukturach anatomicznych poszczególnych układów i narządów występujące w wieku podeszłym (układ kostny, układ oddechowy, układ krążenia, układ nerwowy, układ moczowy, narządy zmysłów)',
          'Zmiany w strukturach anatomicznych układów i narządów w przebiegu wybranych procesów patologicznych (np. cukrzycy, miażdżycy, choroby alkoholowej)',
          'Biomechanika stawów kręgosłupa, głowy, kończyn',
          'Wady wrodzone układu nerwowego',
          'Anomalie układu naczyń, malformacje tętniczo-żylne, tętniaki, naczyniaki',
          'Choroby związane z zaburzeniami czynności układu wewnątrzwydzielniczego (tarczycy, przytarczyc, przysadki mózgowej, nadnerczy, części wewnątrzwydzielniczej trzustki)',
          'Anatomia radiologiczna układów i narządów, metody obrazowania (rtg, tomografia komputerowa, rezonans magnetyczny, ultrasonografia, angiografia)'
        ]
      }
    }
  },
  fizjologia: {
    category: 'fizjologia',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UN2L0ZIxs2k5EyuGdN4SRigYP6qreJDvtVZl',
    description:
      'Kompleksowe testy z fizjologii dla studentów pielęgniarstwa, obejmujące wszystkie istotne zagadnienia wymagane na egzaminach i w codziennej praktyce zawodowej. Sprawdź swoją wiedzę z układów organizmu, procesów fizjologicznych i funkcji życiowych.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Fizjologia',
    keywords: [
      'fizjologia',
      'pielęgniarstwo',
      'układ krążenia',
      'układ oddechowy',
      'zdrowie',
      'opieka',
      'egzamin pielęgniarski',
      'testy wiedzy',
      'pytania egzaminacyjne'
    ],
    details: {
      ects: 3,
      semester: 'Rok I, Semestr I',
      objectives:
        'Wyposażenie studentów w wiedzę o funkcjonowaniu poszczególnych układów fizjologicznych: nerwowego, hormonalnego, krwionośnego, mięśniowego, oddechowego, trawiennego i moczowego organizmu człowieka. Zdobyte na zajęciach z fizjologii wiadomości i praktyczne umiejętności, stanowiące podstawę dla patofizjologii, winny pozwolić studentom samodzielnie wykonywać podstawowe pomiary parametrów fizjologicznych.',
      prerequisites:
        'Podstawy anatomii człowieka. Znajomość podstawowych procesów biochemicznych oraz związków chemicznych (węglowodany, białka, tłuszcze). Wiedza z biologii i chemii realizowana w zakresie szkoły średniej.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'A.W.2',
            desc: 'Zna neurohormonalną regulację procesów fizjologicznych i elektrofizjologicznych zachodzących w organizmie.'
          },
          {
            code: 'A.W.3',
            desc: 'Zna udział układów i narządów organizmu w utrzymaniu jego homeostazy.'
          },
          {
            code: 'A.W.4',
            desc: 'Zna fizjologię poszczególnych układów i narządów organizmu.'
          },
          {
            code: 'A.W.5',
            desc: 'Zna podstawy działania układów regulacji (homeostaza) oraz rolę sprzężenia zwrotnego dodatniego i ujemnego.'
          }
        ],
        skills: []
      },
      programContent: {
        lectures: [
          'Neurofizjologia: Centralny system nerwowy',
          'Autonomiczny układ nerwowy i jego funkcja. Obwodowy układ nerwowy',
          'Fizjologia mięśni: typy tkanek mięśniowych, budowa mięśnia szkieletowego i mechanizm skurczu mięśnia, energetyka pracy mięśniowej',
          'Fizjologia krwi: Funkcje krwi. Skład krwi (skład osocza i podział elementów morfotycznych)'
        ],
        seminars: [
          'Badanie odruchów człowieka',
          'Zmęczenie mięśni (przyczyny, objawy)',
          'Rodzaje skurczów mięśniowych',
          'Określanie grup krwi',
          'Zmiany liczby hematokrytowej (odwodnienie, anemia)',
          'Badanie parametrów układu krążenia (tętno, objętość wyrzutowa serca, pojemność minutowa serca). Pomiar ciśnienia krwi, EKG',
          'Zmiany parametrów układu krążenia w czasie wysiłku. Próby czynnościowe układu krążenia (próby ortostatyczne)',
          'Próby czynnościowe układu oddechowego - spirometria'
        ],
        selfStudy: [
          'Regulacja napięcia mięśniowego. Zaburzenia napięcia mięśniowego',
          'Podstawy immunologii. Rola chłonki',
          'Erytropoeza, erytropoetyna',
          'Regulacja równowagi kwasowo-zasadowej i wodno-elektrolitowej',
          'Narządy zmysłów i ich fizjologia',
          'Różnice w poziomie wskaźników fizjologicznych pomiędzy dorosłymi a dziećmi'
        ]
      }
    }
  },
  'biochemia-biofizyka': {
    category: 'biochemia-biofizyka',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5bHmZPN10lAXCNeHTtQdjmyVvPInzGfZrLsw9',
    description:
      'Testy z biochemii i biofizyki dla studentów pielęgniarstwa. Opanuj procesy biochemiczne w organizmie, metabolizm, białka, węglowodany, lipidy oraz podstawy biofizyki. Przygotuj się kompleksowo do egzaminu.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Biochemia z Biofizyką',
    keywords: [
      'biochemia',
      'biofizyka',
      'pielęgniarstwo',
      'metabolizm',
      'białka',
      'enzymy',
      'homeostaza',
      'procesy biochemiczne',
      'egzamin pielęgniarski',
      'testy wiedzy',
      'pytania egzaminacyjne'
    ],
    details: {
      ects: 2,
      semester: 'Rok I, Semestr I',
      objectives:
        'W sposób zwięzły zapoznać studentów z podstawowymi procesami biochemicznymi związanymi z życiem komórki oraz przedstawić interpretację wybranych zjawisk życiowych w oparciu o metodologię nauk fizycznych. Dostarczyć podstaw do studiowania innych zagadnień związanych z medycyną i pielęgniarstwem takich jak: genetyka, fizjologia, patofizjologia, farmakologia.',
      prerequisites:
        'Chemia, biologia, fizyka i matematyka w zakresie szkoły średniej.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'A.W.13',
            desc: 'Biofizyka: podstawy fizykochemiczne działania zmysłów wykorzystujących fizyczne nośniki informacji (fale dźwiękowe i elektromagnetyczne).'
          },
          {
            code: 'A.W.14',
            desc: 'Biochemia: witaminy, aminokwasy, nukleozydy, monosacharydy, kwasy karboksylowe i ich pochodne, wchodzące w skład makrocząsteczek obecnych w komórkach, macierzy zewnątrzkomórkowej i płynach ustrojowych.'
          },
          {
            code: 'A.W.15',
            desc: 'Biofizyka: mechanizmy regulacji i biofizyczne podstawy funkcjonowania metabolizmu w organizmie.'
          },
          {
            code: 'A.W.16',
            desc: 'Biofizyka: wpływ na organizm czynników zewnętrznych, takich jak temperatura, grawitacja, ciśnienie, pole elektromagnetyczne oraz promieniowanie jonizujące.'
          }
        ],
        skills: [
          {
            code: 'A.U.5',
            desc: 'Potrafi współuczestniczyć w doborze metod diagnostycznych w poszczególnych stanach klinicznych z wykorzystaniem wiedzy z zakresu biochemii i biofizyki.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Rola witamin i minerałów w organizmie. Różnicowanie. Choroby wynikające z niedoboru',
          'Budowa i znaczenie biomedyczne aminokwasów, nukleozydów, monosacharydów i kwasów karboksylowych. Ich udział w budowie makrocząsteczek oraz procesach metabolicznych',
          'Podstawy fizykochemiczne funkcjonowania narządów zmysłów oraz fizyczne nośniki informacji (węch, smak i dotyk)',
          'Podstawy fizykochemiczne funkcjonowania narządów zmysłów oraz fizyczne nośniki informacji (wzrok i słuch)'
        ],
        seminars: [
          'Czynniki fizyczne wpływające na organizm człowieka, mechanizm działania, wykorzystanie w diagnostyce i terapii (temperatura, grawitacja, ciśnienie, pole elektromagnetyczne oraz promieniowanie jonizujące)',
          'Biofizyczne ujęcie metod obrazowania tkanek i narządów'
        ],
        selfStudy: [
          'Studiowanie literatury przedmiotu',
          'Bloki metaboliczne w przemianach aminokwasów. Choroby związane z tym zaburzeniem',
          'Biochemia gospodarki węglowodanowej i lipidowej. Zaburzenia. Choroby',
          'Biochemia mięśni',
          'Prawa rządzące przepływem cieczy w naczyniach w ujęciu biofizyki. Ciśnienie tętnicze i żylne w naczyniach krwionośnych człowieka',
          'Prąd elektryczny i jego charakterystyka, zastosowanie w medycynie'
        ]
      }
    }
  },
  socjologia: {
    category: 'socjologia',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5nt6oObL9GQYxNri4Uw0MejlVEP63mgKp18FO',
    description:
      'Testy z socjologii dla studentów pielęgniarstwa. Poznaj struktury społeczne, role zawodowe w ochronie zdrowia, komunikację interpersonalną oraz socjologiczne aspekty pracy z pacjentem. Przygotuj się do egzaminu z nauk społecznych.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Socjologia',
    keywords: [
      'socjologia',
      'pielęgniarstwo',
      'struktury społeczne',
      'komunikacja',
      'relacje interpersonalne',
      'pacjent',
      'opieka zdrowotna',
      'role społeczne',
      'egzamin pielęgniarski',
      'testy wiedzy',
      'pytania egzaminacyjne'
    ],
    details: {
      ects: 1,
      semester: 'Rok I, Semestr I',
      objectives:
        'Celem zajęć jest przekazanie studentowi elementarnej wiedzy na temat struktury i funkcjonowania społeczeństwa. Treści przekazane na zajęciach umożliwią studentowi zrozumienie zjawisk i procesów zachodzących w życiu społecznym w powiązaniu z problematyką zdrowia, choroby. Ważnym zamierzeniem jest wykształcenie w studentach wrażliwości na życie społeczne.',
      prerequisites: 'Brak',
      learningOutcomes: {
        knowledge: [
          {
            code: 'B.W.7',
            desc: 'Pojęcia oraz zasady funkcjonowania grupy, organizacji, instytucji, populacji, społeczności i ekosystemu.'
          },
          {
            code: 'B.W.8',
            desc: 'Wybrane obszary odrębności kulturowych i religijnych.'
          },
          {
            code: 'B.W.9',
            desc: 'Zakres interakcji społecznej i proces socjalizacji oraz działanie lokalnych społeczności i ekosystemu.'
          },
          {
            code: 'B.W.10',
            desc: 'Pojęcia dewiacji i zaburzenia, ze szczególnym uwzględnieniem patologii dziecięcej.'
          },
          {
            code: 'B.W.11',
            desc: 'Zjawisko dyskryminacji społecznej, kulturowej, etnicznej oraz ze względu na płeć.'
          },
          {
            code: 'B.W.12',
            desc: 'Podstawowe pojęcia i zagadnienia z zakresu pedagogiki jako nauki stosowanej i procesu wychowania w aspekcie zjawiska społecznego (chorowania, zdrowienia, hospitalizacji, umierania).'
          }
        ],
        skills: [
          {
            code: 'B.U.9',
            desc: 'Proponować działania zapobiegające dyskryminacji i rasizmowi oraz dewiacjom i patologiom wśród dzieci i młodzieży.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Podstawowe teorie socjologiczne wykorzystywane do wyjaśnienia wpływu uwarunkowań społecznych na stan zdrowia i relacje z pacjentem.',
          'Kulturowe podstawy życia społecznego. Socjo-kulturowe uwarunkowania zachowań, stylu życia a stan zdrowia.',
          'Pojęcie grupy społecznej, klasyfikacja grup, grupy odniesienia. Interakcje społeczne, proces socjalizacji a kształtowanie osobowości.',
          'Pojęcie zdrowia i choroby w wymiarze psycho-społecznym. Problematyka dewiacji w socjologii. Przyczyna i typologia dewiacji.',
          'Stratyfikacja społeczna. Zróżnicowanie i nierówności społeczne a stan zdrowia.',
          'Wsparcie społeczne. Rodzaje i systemy wsparcia na różnych poziomach życia społecznego. Stres społeczny a zmiany w stanie zdrowia.',
          'Psychospołeczne konsekwencje choroby i niepełnosprawności. Teoria naznaczenia społecznego a sytuacja osób chorych, niepełnosprawnych, starszych wiekiem.',
          'Rodzina jako grupa i instytucja społeczna. Strukturalne, funkcjonalne oraz rozwojowe ujęcie rodziny. Wpływ rodziny na stan zdrowia. Występowanie choroby przewlekłej, niepełnosprawności a funkcjonowanie rodziny.',
          'Społeczno-kulturowe wyznaczniki roli zawodowej pielęgniarki. Proces socjalizacji do roli zawodowej a społeczna definicja roli. Przystosowanie zawodowe, mechanizmy społeczne warunkujące satysfakcje z roli zawodowej, stres zawodowy, wypalenie zawodowe.',
          'Pojęcie instytucji. Szpital jako instytucja i jako organizacja formalna mającą wpływ na psychospołeczne funkcjonowanie pacjenta, pracownika.'
        ],
        seminars: [],
        selfStudy: ['Analiza literatury na zadany przez prowadzącego temat.']
      }
    }
  },
  'mikrobiologia-parazytologia': {
    category: 'mikrobiologia-parazytologia',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5QNXUuJYf6PZ5eKuhFM9REHkAy4n7s3aNYmWi',
    description:
      'Zaawansowane testy z mikrobiologii i parazytologii dla studentów pielęgniarstwa. Poznaj bakterie, wirusy, grzyby, pasożyty oraz mechanizmy zakażeń. Niezbędna wiedza do pracy w ochronie zdrowia.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Mikrobiologia z Parazytologią',
    keywords: [
      'mikrobiologia',
      'parazytologia',
      'bakterie',
      'wirusy',
      'grzyby',
      'pasożyty',
      'zakażenia',
      'patogeny',
      'egzamin pielęgniarski',
      'testy premium'
    ],
    details: {
      ects: 2,
      semester: 'Rok I, Semestr I',
      objectives:
        '1. Wprowadzenie w tematykę obejmującą podstawy mikrobiologii ogólnej oraz podstawy parazytologii.\n2. Przedstawienie klasyfikacji drobnoustrojów z uwzględnieniem podziału na drobnoustroje chorobotwórcze i występujące we florze fizjologicznej.\n3. Zwrócenie uwagi na problematykę związaną z zakażeniami szpitalnymi, ze sterylizacją, dezynfekcją, antyseptyką.\n4. Zapoznanie z budową i cyklami rozwojowymi pasożytów najczęściej spotykanych u człowieka oraz odpowiadających im objawów parazytoz.',
      prerequisites: 'Biologia',
      learningOutcomes: {
        knowledge: [
          {
            code: 'A.W.17',
            desc: 'Klasyfikacja drobnoustrojów z uwzględnieniem mikroorganizmów chorobotwórczych i obecnych w mikrobiocie fizjologicznej człowieka.'
          },
          {
            code: 'A.W.18',
            desc: 'Podstawowe pojęcia z zakresu mikrobiologii i parazytologii oraz metody stosowane w diagnostyce mikrobiologicznej.'
          }
        ],
        skills: [
          {
            code: 'A.U.6',
            desc: 'Rozpoznawać najczęściej spotykane pasożyty człowieka na podstawie ich budowy, cykli życiowych oraz wywoływanych przez nie objawów chorobowych.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Podstawy klasyfikacji, morfologii, fizjologii oraz genetyki drobnoustrojów (bakterii, wirusów, grzybów, pierwotniaków).',
          'Przegląd drobnoustrojów chorobotwórczych dla człowieka, epidemiologia zakażeń, zakażenia szpitalne.',
          'Flora fizjologiczna i zakażenia oportunistyczne.',
          'Podstawowe pojęcia z ekologii i parazytologii.',
          'Pasożyty najczęściej występujące u człowieka, ich morfologia i cykle rozwojowe.',
          'Parazytozy – profilaktyka, diagnostyka i leczenie.',
          'Przegląd mikrobiologii lekarskiej – ziarniaki Gram(+), ziarniaki Gram(-), pałeczki Gram(-), prątki, laseczki, maczugowce, wirusy, grzyby i promieniowce.',
          'Chorobotwórczość, drogi szerzenia się zarazków w ustroju, zagrożenia chorobami zakaźnymi w Polsce i na świecie, profilaktyka chorób zakaźnych.'
        ],
        seminars: [
          'Postępowanie aseptyczne i antyseptyczne w pracy pielęgnacyjno-leczniczej, pobieranie i przesyłanie materiałów do badań mikrobiologicznych.',
          'Ogólne zasady pracy z drobnoustrojami, metody posiewu i hodowli drobnoustrojów, oznaczanie wrażliwości bakterii na antybiotyki i chemioterapeutyki.',
          'Biologiczne czynniki chorobotwórcze.',
          'Mikroorganizmy wywołujące zomr - neisseria meningitidis.',
          'Drobnoustroje chorobotwórcze wywołujące zakażenia przewodu pokarmowego, bioterroryzm, czynniki chorobotwórcze wykorzystywane jako broń biologiczna.',
          'Pasożyty najczęściej występujące u człowieka, nomenklatura, rozpoznawanie.',
          'Epidemiologia parazytoz kosmopolitycznych i tropikalnych. Metody diagnostyczne.'
        ],
        selfStudy: [
          'Choroby prionowe.',
          'Sepsa, posocznica.',
          'Zasady racjonalnej antybiotykoterapii w szpitalu.',
          'Zewnątrzkomórkowe struktury bakteryjne: otoczki, fimbrie, rzęski, przetrwalniki.',
          'Czynniki chorobotwórczości mikroorganizmów.',
          'Profilaktyka i epidemiologia parazytoz.',
          'Profilaktyka chorób zakaźnych.',
          'Drobnoustroje wykorzystywane w medycynie (inżynieria genetyczna).'
        ]
      }
    }
  },
  psychologia: {
    category: 'psychologia',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5kbdfnVA5zS3pZrqLGeEj7tHO6cdWvCYm4N2R',
    description:
      'Testy z psychologii dla przyszłych pielęgniarek. Opanuj psychologię kliniczną, komunikację z pacjentem, wsparcie emocjonalne, mechanizmy obronne oraz psychologiczne aspekty choroby i leczenia.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Psychologia',
    keywords: [
      'psychologia',
      'pielęgniarstwo',
      'psychologia kliniczna',
      'komunikacja z pacjentem',
      'wsparcie emocjonalne',
      'choroba',
      'pacjent',
      'testy premium'
    ],
    details: {
      ects: 3,
      semester: 'Rok I, Semestr I',
      objectives:
        'Zapoznanie studentów z pojęciami, podstawowymi mechanizmami zachowań człowieka i uwarunkowaniami jego prawidłowego i zaburzonego funkcjonowania. Zaprezentowanie studentom podstawowej wiedzy z zakresu procesów komunikacyjnych, rozpoznawanie i rozwiązywanie konfliktów. Zdobycie umiejętności współpracy w zespole terapeutycznym i leczącym, umiejętności korzystania z diagnozy psychologicznej. Uwrażliwienie studentów na potrzeby drugiej osoby, ze szczególnym uwzględnieniem osoby chorej i niepełnosprawnej. Zapoznanie z podstawowymi technikami obniżania napięcia emocjonalnego, radzenie sobie z wypaleniem zawodowym.',
      prerequisites:
        'Podstawowa wiedza z zakresu budowy i funkcjonowania układu nerwowego człowieka.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'B.W.1',
            desc: 'Psychologiczne podstawy rozwoju człowieka, jego zachowania prawidłowe i zaburzone.'
          },
          {
            code: 'B.W.2',
            desc: 'Problematykę relacji człowiek – środowisko społeczne i mechanizmy funkcjonowania człowieka w sytuacjach trudnych.'
          },
          {
            code: 'B.W.3',
            desc: 'Etapy rozwoju psychicznego człowieka i występujące na tych etapach prawidłowości.'
          },
          {
            code: 'B.W.4',
            desc: 'Pojęcie emocji i motywacji oraz zaburzenia osobowościowe.'
          },
          {
            code: 'B.W.5',
            desc: 'Istotę, strukturę i zjawiska zachodzące w procesie przekazywania i wymiany informacji oraz modele i style komunikacji interpersonalnej.'
          },
          {
            code: 'B.W.6',
            desc: 'Techniki redukowania lęku, metody relaksacji oraz mechanizmy powstawania i zapobiegania zespołowi wypalenia zawodowego.'
          }
        ],
        skills: [
          {
            code: 'B.U.1',
            desc: 'Rozpoznawać zachowania prawidłowe, zaburzone i patologiczne.'
          },
          {
            code: 'B.U.2',
            desc: 'Oceniać wpływ choroby i hospitalizacji na stan fizyczny i psychiczny człowieka.'
          },
          {
            code: 'B.U.3',
            desc: 'Oceniać funkcjonowanie człowieka w sytuacjach trudnych (stres, frustracja, konflikt, trauma, żałoba) oraz przedstawiać elementarne formy pomocy psychologicznej.'
          },
          {
            code: 'B.U.4',
            desc: 'Identyfikować błędy i bariery w procesie komunikowania się.'
          },
          {
            code: 'B.U.5',
            desc: 'Wykorzystywać techniki komunikacji werbalnej i pozawerbalnej w opiece pielęgniarskiej.'
          },
          {
            code: 'B.U.6',
            desc: 'Tworzyć warunki do prawidłowej komunikacji z pacjentem i członkami zespołu opieki.'
          },
          {
            code: 'B.U.7',
            desc: 'Wskazywać i stosować właściwe techniki redukowania lęku i metody relaksacyjne.'
          },
          {
            code: 'B.U.8',
            desc: 'Stosować mechanizmy zapobiegania zespołowi wypalenia zawodowego.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Psychologia jako nauka o człowieku.',
          'Zachowanie człowieka i jego determinanty.',
          'Biologiczne mechanizmy zachowań.',
          'Mózgowe mechanizmy zachowań.',
          'Rozwój psychiki jednostki.',
          'Osobowość jako system regulacji i samoregulacji człowieka.',
          'Pojecie zdrowia psychicznego, zaburzenia w zachowaniu a zdrowie psychiczne.',
          'Zachowanie człowieka w sytuacjach trudnych i konfliktowych, mechanizmy obronne stosowane przez człowieka.',
          'Choroba, niepełnosprawność, odmienna orientacja seksualna jako sytuacje trudne.',
          'Pomoc psychologiczna w chorobie.',
          'Komunikacja międzyludzka.'
        ],
        seminars: [
          'Emocje i motywacja jako procesy wpływające na zachowanie się człowieka.',
          'Wpływ stresu na zachowanie człowieka.',
          'Osobowość jako system regulacji zachowania, rozwój osobowości i kontaktów społecznych.',
          'Rozwój psychoruchowy człowieka/modele, zaburzenia.',
          'Zaburzenia rozwoju emocjonalnego/etiologia, metody terapii.',
          'Specyfika rozwoju psychicznego osób niepełnosprawnych.',
          'Funkcjonowanie człowieka jako istoty społecznej, kształtowanie się postaw i norm moralnych.',
          'Podstawy teorii konfliktu i metod jego rozwiązywania, rozwijanie umiejętności aktywnego słuchania.'
        ],
        selfStudy: [
          'Charakterystyka wybranych jednostek chorobowych.',
          'Konsekwencje psychologiczne i społeczne dla jednostki.'
        ]
      }
    }
  },
  pedagogika: {
    category: 'pedagogika',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5bp3ERm10lAXCNeHTtQdjmyVvPInzGfZrLsw9',
    description:
      'Testy z pedagogiki dla studentów pielęgniarstwa. Edukacja zdrowotna pacjentów, metody nauczania, promocja samoopieki oraz pedagogiczne aspekty pracy z różnymi grupami wiekowymi.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Pedagogika',
    keywords: [
      'pedagogika',
      'pielęgniarstwo',
      'edukacja zdrowotna',
      'nauczanie pacjentów',
      'promocja zdrowia',
      'metody dydaktyczne',
      'testy premium'
    ],
    details: {
      ects: 2,
      semester: 'Rok I, Semestr I',
      objectives:
        'Uzyskanie wiedzy pedagogicznej przydatnej w codziennej pracy z pacjentem, umożliwiającej skuteczną pracę wspierającą jego rozwój. Zrozumienie istoty spotkania wychowawczego – niepowtarzalnego wydarzenia.',
      prerequisites: 'Brak',
      learningOutcomes: {
        knowledge: [
          {
            code: 'B.W.13',
            desc: 'Problematykę procesu kształcenia w ujęciu edukacji zdrowotnej.'
          },
          {
            code: 'B.W.14',
            desc: 'Metodykę edukacji zdrowotnej dzieci, młodzieży i dorosłych.'
          }
        ],
        skills: [
          {
            code: 'B.U.10',
            desc: 'Rozpoznawać potrzeby edukacyjne w grupach odbiorców usług pielęgniarskich.'
          },
          {
            code: 'B.U.11',
            desc: 'Analizować programy edukacyjne w zakresie działań prozdrowotnych dla różnych grup odbiorców.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Pedagogika jako dyscyplina nauk o wychowaniu.',
          'Zależność pedagogiki od innych dziedzin wiedzy.',
          'Przedmiot badań pedagogiki, jej źródła i tożsamość.',
          'Działy pedagogiki.',
          'Metodologia badań pedagogicznych.',
          'Teoria kształcenia zawodowego.',
          'Pielęgniarstwo a pedagogika.'
        ],
        seminars: [
          'Relacje pomiędzy pielęgniarstwem, a pedagogiką.',
          'Korzystanie z dorobku naukowego pedagogiki w pielęgniarstwie.',
          'Zadania pedagogiczne w działalności zawodowej pielęgniarki.',
          'Rola i zadania pielęgniarki w edukacji zdrowotnej pacjenta.',
          'Dydaktyka pielęgniarstwa – zadania, formy organizacyjne i metody kształcenia pielęgniarek.'
        ],
        selfStudy: [
          'Systemy (doktryny) pedagogiczne i sposoby ich klasyfikacji.',
          'Szkoła tradycyjna - założenia i jej przedstawiciele.',
          'Szkoła progresywistyczna – założenia i jej przedstawiciele.',
          'Nowe Wychowanie – założenia i jej przedstawiciele.',
          'Pedagogika funkcjonalna.',
          'Pedagogika humanistyczna.',
          'Pedagogika personalistyczna.'
        ]
      }
    }
  },
  'zdrowie-publiczne': {
    category: 'zdrowie-publiczne',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5rKVZXnDJ4x1k8yEQjwiVOufWtG7U0K2FIB5C',
    description:
      'Testy ze zdrowia publicznego dla pielęgniarstwa. Epidemiologia, profilaktyka, polityka zdrowotna, statystyka medyczna oraz organizacja systemu ochrony zdrowia w Polsce.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Zdrowie Publiczne',
    keywords: [
      'zdrowie publiczne',
      'epidemiologia',
      'profilaktyka',
      'polityka zdrowotna',
      'statystyka medyczna',
      'ochrona zdrowia',
      'pielęgniarstwo',
      'testy premium'
    ],
    details: {
      ects: 4,
      semester: 'Rok I-II, Semestr I, III',
      objectives:
        'Poznanie koncepcji i zadań zdrowia publicznego oraz aspektów zdrowia, czynników warunkujących, współczesne zagrożenia wraz z ochroną zdrowia w Polsce. Opanowanie niezbędnej wiedzy z zakresu społecznych uwarunkowań zdrowia i choroby w kontekście interdyscyplinarnym, nabycie umiejętności organizowania działań na rzecz promocji zdrowia w różnych środowiskach i instytucjach, opanowanie umiejętności metodycznych związanych z edukacją zdrowotną, opanowanie umiejętności organizowania działań pomocowych instytucjonalnych i pozainstytucjonalnych w obszarze środowisk lokalnych i na różnych szczeblach zarządzania, poznać współczesne koncepcje zdrowia, opracowywać i realizować projekty badawcze w zakresie pedagogiki progresywno prozdrowotnej.',
      prerequisites: '',
      learningOutcomes: {
        knowledge: [
          {
            code: 'B.W.20',
            desc: 'Zna zadania z zakresu zdrowia publicznego.'
          },
          {
            code: 'B.W.21',
            desc: 'Zna kulturowe, społeczne i ekonomiczne uwarunkowania zdrowia publicznego.'
          },
          {
            code: 'B.W.22',
            desc: 'Zna podstawowe pojęcia dotyczące zdrowia i choroby.'
          },
          {
            code: 'B.W.23',
            desc: 'Rozumie istotę profilaktyki i prewencji chorób.'
          },
          {
            code: 'B.W.24',
            desc: 'Rozumie zasady funkcjonowania rynku usług medycznych w Polsce oraz w wybranych państwach członkowskich Unii Europejskiej.'
          },
          {
            code: 'B.W.25',
            desc: 'Zna swoiste zagrożenia zdrowotne występujące w środowisku zamieszkania, edukacji i pracy.'
          },
          {
            code: 'B.W.26',
            desc: 'Zna międzynarodowe klasyfikacje statystyczne, w tym chorób i problemów zdrowotnych (ICD-10), procedur medycznych (ICD-9) oraz funkcjonowania, niepełnosprawności i zdrowia (ICF).'
          }
        ],
        skills: [
          {
            code: 'B.U.13',
            desc: 'Potrafi oceniać światowe trendy dotyczące ochrony zdrowia w aspekcie najnowszych danych epidemiologicznych i demograficznych.'
          },
          {
            code: 'B.U.14',
            desc: 'Potrafi analizować i oceniać funkcjonowanie różnych systemów opieki medycznej oraz identyfikować źródła ich finansowania.'
          },
          {
            code: 'B.U.15',
            desc: 'Potrafi stosować międzynarodowe klasyfikacje statystyczne, w tym chorób i problemów zdrowotnych (ICD-10), procedur medycznych (ICD-9) oraz funkcjonowania niepełnosprawności i zdrowia (ICF).'
          }
        ]
      },
      programContent: {
        lectures: [
          'Zdrowie publiczne: kulturowe, społeczne i ekonomiczne uwarunkowania zdrowia.',
          'Podstawowe pojęcia dotyczące zdrowia i choroby.',
          'Profilaktyka, prewencja chorób – cele, zadania, formy.',
          'Programowe działania na rzecz wybranych chorób: Narodowy Program Zdrowia, programy promocji zdrowia i ich realizacja w Polsce.',
          'Problemy zdrowotne i społeczne ludzi starych. Opieka paliatywna.',
          'Model medycyny rodzinnej – założenia i zadania.',
          'Podstawowe pojęcia epidemiologiczne: pozytywne i negatywne mierniki stanu zdrowia populacji, podstawowe pojęcia epidemiologii chorób zakaźnych.',
          'Higiena pracy.',
          'Zagrożenie ekologiczne.',
          'Zagrożenia zdrowotne występujące w środowisku zamieszkania i nauki.',
          'Zagrożenia zdrowia występujące w środowisku pracy.',
          'Patologia rodziny, a zdrowie. Krzywdzenie dzieci.',
          'Demograficzne uwarunkowania stanu zdrowia zbiorowości.',
          'Definicja chorób społecznych. Analiza występowania wybranych chorób.',
          'Zaburzenia psychiczne jako choroby społeczne: zaburzenia psychosomatyczne, zaburzenia lękowe, depresje.'
        ],
        seminars: [
          'Opieka medyczna w szkole w ramach zdrowia publicznego.',
          'Profilaktyka zakażeń wirusem HIV.',
          'Wypadki i urazy. Profilaktyka urazów i wypadków.',
          'Choroby zawodowe. Profilaktyka.',
          'Organizacja, finansowanie i kontraktowanie w systemie ochrony zdrowia w Polsce i na świecie.',
          'Zasady w pielęgniarstwie, standard opieki, procedura, algorytm.',
          'Omówienie Międzynarodowej Statystyki Klasyfikacji Chorób i Problemów Zdrowotnych, klasyfikacji ICD-9-CM – i kwalifikowaniu schorzeń i chorób wg ICD-10 oraz niepełnosprawności i zdrowia (ICF).'
        ],
        selfStudy: [
          'Studiowanie literatury w zakresie zagrożeń zdrowotnych współczesnych społeczeństw świata, wybranych zagadnień patologii społecznej i opieki medycznej nad wybranymi grupami ludności, oraz inne tematy.'
        ]
      }
    }
  },
  'prawo-medyczne': {
    category: 'prawo-medyczne',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5JajIrkmQWsLSvF0ZVh7qXdCNxbjatwczey8g',
    description:
      'Testy z prawa medycznego dla pielęgniarek. Prawa pacjenta, odpowiedzialność zawodowa, dokumentacja medyczna, tajemnica zawodowa oraz regulacje prawne w ochronie zdrowia.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Prawo Medyczne',
    keywords: [
      'prawo medyczne',
      'prawa pacjenta',
      'odpowiedzialność zawodowa',
      'dokumentacja medyczna',
      'tajemnica lekarska',
      'regulacje prawne',
      'pielęgniarstwo',
      'testy premium'
    ],
    details: {
      ects: 2,
      semester: 'Rok I, Semestr I',
      objectives:
        '1. Dostarczenie podstawowych informacji z zakresu systemu prawa polskiego wraz z elementami prawa wspólnotowego, ze szczególnym uwzględnieniem prawa pracy, ubezpieczeń społecznych oraz prawnych podstaw wykonywania zawodu pielęgniarki, w tym z przepisami dotyczącymi odpowiedzialności cywilnej, karnej i dyscyplinarnej pielęgniarek.\n2. Wdrożenie umiejętności stosowania przepisów prawa w ramach wykonywania zawodu pielęgniarki.',
      prerequisites:
        'Student zna w podstawowym zakresie system organów ustrojowych Rzeczypospolitej Polskiej oraz źródła prawa powszechnie obowiązującego.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'B.W.15',
            desc: 'Podstawowe pojęcia z zakresu prawa i rolę prawa w życiu społeczeństwa, ze szczególnym uwzględnieniem praw człowieka i prawa pracy.'
          },
          {
            code: 'B.W.16',
            desc: 'Podstawowe regulacje prawne z zakresu ubezpieczeń zdrowotnych obowiązujące w Polsce i w państwach członkowskich Unii Europejskiej oraz wybrane trendy w polityce ochrony zdrowia w Polsce i w państwach członkowskich Unii Europejskiej.'
          },
          {
            code: 'B.W.17',
            desc: 'Podstawy prawne wykonywania zawodu pielęgniarki, w tym prawa i obowiązki pielęgniarki, organizację i zadania samorządu zawodowego pielęgniarek i położnych oraz prawa i obowiązki jego członków.'
          },
          {
            code: 'B.W.18',
            desc: 'Zasady odpowiedzialności karnej, cywilnej, pracowniczej i zawodowej związanej z wykonywaniem zawodu pielęgniarki.'
          },
          {
            code: 'B.W.19',
            desc: 'Prawa człowieka, prawa dziecka i prawa pacjenta.'
          }
        ],
        skills: [
          {
            code: 'B.U.12',
            desc: 'Stosować przepisy prawa dotyczące praktyki zawodowej pielęgniarki.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Podstawy zagadnień prawnych - system prawa, prawa człowieka, podstawowe pojęcia z zakresu prawa cywilnego.',
          'System ubezpieczeń społecznych - ogólne zasady, system występujący w Polsce, przepisy wspólnotowe.',
          'Kodeks pracy - podstawy.',
          'Ustawa o zawodach pielęgniarki i położnej i ustawa o samorządach zawodowych.',
          'Działalność lecznicza i świadczenia zdrowotne.',
          'Prawa pacjenta - ustawa o prawach pacjenta i Rzeczniku Praw Pacjenta, Karta Praw Pacjenta.',
          'Odpowiedzialność prawna związana z wykonywaniem zawodu - karna, cywilna i pracownicza.'
        ],
        seminars: [
          'Odpowiedzialność prawna związana z wykonywaniem zawodu - karna, cywilna i pracownicza - kodeks pracy, ustawy, prawa pacjenta.'
        ],
        selfStudy: [
          'Organy samorządu zawodowego pielęgniarek i położnych – skład i kompetencje.',
          'Studiowanie literatury przedmiotu.'
        ]
      }
    }
  },
  'podstawy-pielegniarstwa': {
    category: 'podstawy-pielegniarstwa',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5gOhTeFK1JZolbvwfgWCAFPh8xz9BIKNsVjGk',
    description:
      'Kompleksowe testy z podstaw pielęgniarstwa. Podstawowe procedury, techniki pielęgnacyjne, higiena, bezpieczeństwo pacjenta, standardy opieki oraz fundamenty zawodu pielęgniarki.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Podstawy Pielęgniarstwa',
    keywords: [
      'podstawy pielęgniarstwa',
      'procedury pielęgnacyjne',
      'techniki',
      'higiena',
      'bezpieczeństwo pacjenta',
      'standardy opieki',
      'zawód pielęgniarki',
      'testy premium'
    ],
    details: {
      ects: 15,
      semester: 'Rok I, Semestr I-II',
      objectives:
        '1. Zapoznanie z teoretycznymi podstawami pielęgniarstwa.\n2. Kształtowanie umiejętności praktycznych w zakresie opieki bezpośredniej nad pacjentem i jego rodziną.\n3. Planowanie i realizowanie zindywidualizowanej, bezpiecznej i etycznej opieki nad pacjentem.',
      prerequisites:
        'Podstawowe wiadomości z anatomii, fizjologii i patologii człowieka.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'C.W.1',
            desc: 'Uwarunkowania rozwoju pielęgniarstwa na tle transformacji opieki pielęgniarskiej i profesjonalizacji współczesnego pielęgniarstwa.'
          },
          {
            code: 'C.W.2',
            desc: 'Pojęcie pielęgnowania, w tym wspierania, pomagania i towarzyszenia.'
          },
          {
            code: 'C.W.3',
            desc: 'Funkcje i zadania zawodowe pielęgniarki oraz rolę pacjenta w procesie realizacji opieki pielęgniarskiej.'
          },
          {
            code: 'C.W.4',
            desc: 'Proces pielęgnowania (istota, etapy, zasady) i primary nursing (istota, odrębności) oraz wpływ pielęgnowania tradycyjnego na funkcjonowanie praktyki pielęgniarskiej.'
          },
          {
            code: 'C.W.5',
            desc: 'Klasyfikacje diagnoz i praktyk pielęgniarskich.'
          },
          {
            code: 'C.W.6',
            desc: 'Istotę opieki pielęgniarskiej opartej o wybrane założenia teoretyczne (Florence Nightingale, Virginia Henderson, Dorothea Orem, Callista Roy, Betty Neuman).'
          },
          {
            code: 'C.W.7',
            desc: 'Istotę, cel, wskazania, przeciwwskazania, powikłania, obowiązujące zasady i technikę wykonywania podstawowych czynności pielęgniarskich, diagnostycznych, leczniczych i rehabilitacyjnych.'
          },
          {
            code: 'C.W.8',
            desc: 'Zadania pielęgniarki w opiece nad pacjentem zdrowym, zagrożonym chorobą, chorym i o niepomyślnym rokowaniu.'
          },
          {
            code: 'C.W.9',
            desc: 'Zakres i charakter opieki pielęgniarskiej w wybranych stanach pacjenta, sytuacjach klinicznych, w deficycie samoopieki, zaburzonym komforcie, zaburzonej sferze psychoruchowej.'
          },
          {
            code: 'C.W.10',
            desc: 'Zakres opieki pielęgniarskiej i interwencji pielęgniarskich w wybranych diagnozach pielęgniarskich.'
          },
          {
            code: 'C.W.11',
            desc: 'Udział pielęgniarki w zespole interdyscyplinarnym w procesie promowania zdrowia, profilaktyki, diagnozowania, leczenia i rehabilitacji.'
          }
        ],
        skills: [
          {
            code: 'C.U.1',
            desc: 'Stosować wybraną metodę pielęgnowania w opiece nad pacjentem.'
          },
          {
            code: 'C.U.2',
            desc: 'Gromadzić informacje metodą wywiadu, obserwacji, pomiarów, badania przedmiotowego, analizy dokumentacji w celu rozpoznawania stanu zdrowia pacjenta i sformułowania diagnozy pielęgniarskiej.'
          },
          {
            code: 'C.U.3',
            desc: 'Ustalać cele i plan opieki pielęgniarskiej oraz realizować ją wspólnie z pacjentem i jego rodziną.'
          },
          {
            code: 'C.U.4',
            desc: 'Monitorować stan zdrowia pacjenta podczas pobytu w szpitalu lub innych jednostkach organizacyjnych systemu ochrony zdrowia.'
          },
          {
            code: 'C.U.5',
            desc: 'Dokonywać bieżącej i końcowej oceny stanu zdrowia pacjenta i podejmowanych działań pielęgniarskich.'
          },
          {
            code: 'C.U.6',
            desc: 'Wykonywać testy diagnostyczne dla oznaczenia ciał ketonowych i glukozy we krwi i w moczu oraz cholesterolu we krwi oraz inne testy paskowe.'
          },
          {
            code: 'C.U.7',
            desc: 'Prowadzić, dokumentować i oceniać bilans płynów pacjenta.'
          },
          {
            code: 'C.U.8',
            desc: 'wykonywać pomiar temperatury ciała, tętna, oddechu, ciśnienia tętniczego krwi, ośrodkowego ciśnienia żylnego, obwodów, saturacji, szczytowego przepływu wydechowego oraz pomiary antropometryczne (pomiar masy ciała, wzrostu, wskaźnika BMI, wskaźników dystrybucji tkanki tłuszczowej: WHR, WHtR, grubości fałdów skórno tłuszczowych).'
          },
          {
            code: 'C.U.9',
            desc: 'Pobierać materiał do badań laboratoryjnych i mikrobiologicznych oraz asystować lekarzowi przy badaniach diagnostycznych.'
          },
          {
            code: 'C.U.10 - MCSM',
            desc: 'Stosować zabiegi przeciwzapalne.'
          },
          {
            code: 'C.U.11',
            desc: 'Przechowywać i przygotowywać leki zgodnie z obowiązującymi standardami.'
          },
          {
            code: 'C.U.12',
            desc: 'Podawać pacjentowi leki różnymi drogami, zgodnie z pisemnym zleceniem lekarza lub zgodnie z posiadanymi kompetencjami oraz obliczać dawki leków.'
          },
          {
            code: 'C.U.13 - MCSM',
            desc: 'Wykonywać szczepienia przeciw grypie, WZW i tężcowi.'
          },
          {
            code: 'C.U.14 - MCSM',
            desc: 'Wykonywać płukanie jamy ustnej, gardła, oka, ucha, żołądka, pęcherza moczowego ,przetoki jelitowej i rany.'
          },
          {
            code: 'C.U.15',
            desc: 'Zakładać i usuwać cewnik z żył obwodowych, wykonywać kroplowe wlewy dożylne oraz monitorować i pielęgnować miejsce wkłucia obwodowego, wkłucia centralnego i portu naczyniowego.'
          },
          {
            code: 'C.U.16',
            desc: 'Wykorzystywać dostępne metody karmienia pacjenta(doustnie, przez zgłębnik, przetoki odżywcze).'
          },
          {
            code: 'C.U.17',
            desc: 'Przemieszczać i pozycjonować pacjenta z wykorzystaniem różnych technik i metod.'
          },
          {
            code: 'C.U.18',
            desc: 'Wykonywać gimnastykę oddechową i drenaż ułożeniowy, odśluzowywanie dróg oddechowych i inhalację.'
          },
          {
            code: 'C.U.19',
            desc: 'Wykonywać nacieranie, oklepywanie, ćwiczenia czynne i bierne.'
          },
          {
            code: 'C.U.20',
            desc: 'Wykonywać zabiegi higieniczne.'
          },
          {
            code: 'C.U.21 - MCSM',
            desc: 'Pielęgnować skórę i jej wytwory oraz błony śluzowe z zastosowaniem środków farmakologicznych i materiałów medycznych, w tym stosować kąpiele lecznicze.'
          },
          {
            code: 'C.U.22 - MCSM',
            desc: 'Oceniać ryzyko rozwoju odleżyn i stosować działania profilaktyczne.'
          },
          {
            code: 'C.U.23 - MCSM',
            desc: 'Wykonywać zabiegi doodbytnicze.'
          },
          {
            code: 'C.U.24 - MCSM',
            desc: 'Zakładać cewnik do pęcherza moczowego, monitorować diurezę i usuwać cewnik.'
          },
          {
            code: 'C.U.25',
            desc: 'Zakładać zgłębnik do żołądka oraz monitorować i usuwać zgłębnik.'
          },
          {
            code: 'C.U.26',
            desc: 'Prowadzić dokumentację medyczną oraz posługiwać się nią.'
          }
        ],
        competencies: [
          {
            code: 'K.S.1',
            desc: 'Kierowania się dobrem pacjenta, poszanowania godności i autonomii osób powierzonych opiece, okazywania zrozumienia dla różnic światopoglądowych i kulturowych oraz empatii w relacji z pacjentem i jego rodziną.'
          },
          {
            code: 'K.S.2',
            desc: 'Przestrzegania praw pacjenta i zachowywania w tajemnicy informacji związanych z pacjentem.'
          },
          {
            code: 'K.S.3',
            desc: 'Samodzielnego i rzetelnego wykonywania zawodu zgodnie z zasadami etyki, w tym przestrzegania wartości i powinności moralnych w opiece nad pacjentem.'
          },
          {
            code: 'K.S.4',
            desc: 'Ponoszenia odpowiedzialności za wykonywane czynności zawodowe.'
          },
          {
            code: 'K.S.5',
            desc: 'Zasięgania opinii ekspertów w przypadku trudności z samodzielnym rozwiązaniem problemu.'
          },
          {
            code: 'K.S.6',
            desc: 'Przewidywania i uwzględniania czynników wpływających na reakcje własne i pacjenta.'
          },
          {
            code: 'K.S.7',
            desc: 'Dostrzegania i rozpoznawania własnych ograniczeń w zakresie wiedzy, umiejętności i kompetencji społecznych oraz dokonywania.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Uwarunkowania rozwoju pielęgniarstwa na tle transformacji opieki pielęgniarskiej i profesjonalizacji współczesnego pielęgniarstwa.',
          'Pielęgniarstwo – zakres współczesnego rozumienia.',
          'Symbole i tradycje w pielęgniarstwie.',
          'Opieka, opiekuńczość w pielęgniarstwie.',
          'Pojęcia: pielęgnowanie, empatia, wsparcie społeczne, pomaganie i towarzyszenie.',
          'Rola, funkcje i zadania zawodowe pielęgniarki.',
          'Rola pacjenta w procesie realizacji opieki pielęgniarskiej, prawa pacjenta.',
          'Modele teoretyczne w pielęgniarstwie - Florence Nightingale i Virgini Henderson.',
          'Istota opieki pielęgniarskiej opartej o wybrane założenia teoretyczne - Dorothea Orem, Callista Roy, Betty Neuman.',
          'Proces pielęgnowania (istota, etapy, zasady) i primary nursing (istota, odrębności).',
          'Pielęgnowanie tradycyjne i nowoczesne modele opieki w funkcjonowaniu praktyki pielęgniarskiej.',
          'Diagnoza pielęgniarska w ocenie stanu pacjenta i interwencjach pielęgniarskich.',
          'Klasyfikacje diagnoz i praktyk pielęgniarskich (NANDA, ICNP).',
          'Warunki pracy pielęgniarki w wybranych zakładach opieki zdrowotnej: szpital, zakład pielęgnacyjno-opiekuńczy, przychodnia, poradnia.',
          'Zadania pielęgniarki/rza w opiece nad pacjentem zdrowym, zagrożonym chorobą, chorym, o niepomyślnym rokowaniu, chorym przewlekle.',
          'Profilaktyka powikłań u pacjentów długotrwale unieruchomionych. Profilaktyka odleżyn oraz metodyleczenia odleżyn.',
          'Zakres i charakter opieki pielęgniarskiej w wybranych stanach i sytuacjach klinicznych.',
          'Udział pielęgniarki/rza w zespole interdyscyplinarnym w procesie promowania zdrowia, profilaktyki, diagnozowania, leczen a i rehabilitacji.'
        ],
        seminars: [],
        selfStudy: [
          'Historyczne i społeczne uwarunkowania rozwoju pielęgniarstwa.',
          'Symbole i tradycje w pielęgniarstwie.',
          'Historia i rozwój pielęgniarstwa w Polsce.',
          'Misja pielęgniarstwa na przestrzeni XX i XXI wieku',
          'Rola i wkład Polskiego Towarzystwa Pielęgniarskiego w rozwój pielęgniarstwa w Polsce.',
          'Teresa Kulczyńska działalność zawodowa i jej zasługi dla rozwoju pielęgniarstwa polskiego.',
          'Życie i działalność Heleny Radlińskiej.',
          'Życie i działalność Racheli Hutner.',
          'Motywy wyboru - kierunku pielęgniarstwo.',
          'Opieka pielęgniarska oparta o założenia teoretyczne Florence Nightingale.',
          'Opieka pielęgniarska oparta o założenia teoretyczne Virginia Henderson.',
          'Opieka pielęgniarska oparta o założenia teoretyczne Dorothey Orem.',
          'Opieka pielęgniarska oparta o założenia teoretyczne Callista Roy.',
          'Opieka pielęgniarska oparta o założenia teoretyczne Betty Neuman.',
          'Opieka pielęgniarska oparta założenia teoretyczne Medeleine Leininger.',
          'Opieka pielęgniarska oparta założenia teoretyczne wg założeń innej teorii.',
          'Życie i działalność Stefani Poznańskiej.'
        ]
      }
    }
  },
  'etyka-zawodowa': {
    category: 'etyka-zawodowa',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5KqquTG6br79T0mSRj6eAJqPf4kEid2ncgM5N',
    description:
      'Testy z etyki zawodu pielęgniarki. Kodeks etyki, dylematy etyczne, godność pacjenta, autonomia, poufność oraz wartości etyczne w codziennej praktyce pielęgniarskiej.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Etyka Zawodu Pielęgniarki',
    keywords: [
      'etyka',
      'kodeks etyki',
      'dylematy etyczne',
      'godność pacjenta',
      'autonomia',
      'wartości etyczne',
      'zawód pielęgniarki',
      'testy premium'
    ],
    details: {
      ects: 1,
      semester: 'Rok I, Semestr I',
      objectives:
        'Zdobycie wiedzy i umiejętności prezentowania postaw i podejmowania decyzji etycznych w pracy pielęgniarki.',
      prerequisites: 'Podstawowa znajomość kodeksu zawodowego.',
      learningOutcomes: {
        knowledge: [
          { code: 'C.W.12', desc: 'Przedmiot etyki ogólnej i zawodowej.' },
          {
            code: 'C.W.13',
            desc: 'Istotę podejmowania decyzji etycznych i rozwiązywania dylematów moralnych w pracy pielęgniarki.'
          },
          {
            code: 'C.W.14',
            desc: 'Problematykę etyki normatywnej, w tym aksjologii wartości, powinności i sprawności moralnych istotnych w pracy pielęgniarki.'
          },
          {
            code: 'C.W.15',
            desc: 'Kodeks etyki zawodowej pielęgniarki i położnej.'
          }
        ],
        skills: [
          {
            code: 'C.U.27',
            desc: 'Rozwiązywać dylematy etyczne i moralne w praktyce pielęgniarskiej.'
          }
        ],
        competencies: [
          {
            code: 'K.S.4',
            desc: 'Ponoszenia odpowiedzialności za wykonywane czynności zawodowe.'
          },
          {
            code: 'K.S.5',
            desc: 'Zasięgania opinii ekspertów w przypadku trudności z samodzielnym rozwiązaniem problemu.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Historia etyki pielęgniarskiej.',
          'Pojęcie, zagadnienia etyki.',
          'Koncepcje etyczne w pielęgniarstwie.',
          'Wartości, zasady etyczne i kodeksy istotne w zawodzie pielęgniarki.',
          'Prawa człowieka, a praktyka pielęgniarska.',
          'Potrzebna czy niepotrzebna – etyka w pielęgniarstwie.'
        ],
        seminars: [
          'Podstawowe koncepcje etyczne w medycynie: analiza przypadków – aplikacja koncepcji do praktyki pielęgniarskiej.',
          'Analiza norm kodeksowych na przykładzie Kodeksu etyki zawodowej pielęgniarki i położnej RP oraz Kodeksu pielęgniarek MRP.',
          'Dylematy w praktyce pielęgniarki. Podejmowanie decyzji etycznych.',
          'Opieka holistyczna w pielęgniarstwie – elementy opieki wielokulturowej i duchowej w pielęgniarstwie.'
        ],
        selfStudy: [
          'Odpowiedzialność zawodowa pielęgniarki.',
          'Prawa pacjenta.',
          'Podejmowanie decyzji etycznych w pracy pielęgniarskiej.',
          'Wzory osobowe w pielęgniarstwie.',
          'Problemy bioetyczne w medycynie.'
        ]
      }
    }
  },
  'promocja-zdrowia': {
    category: 'promocja-zdrowia',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k52bP49YSEBiUD8sVXHObYqkj3TNfo4PKMGg6J',
    description:
      'Testy z promocji zdrowia dla pielęgniarstwa. Style życia, profilaktyka chorób, edukacja zdrowotna, zdrowe nawyki oraz programy promocji zdrowia w różnych grupach społecznych.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Promocja Zdrowia',
    keywords: [
      'promocja zdrowia',
      'profilaktyka',
      'edukacja zdrowotna',
      'zdrowy styl życia',
      'prewencja',
      'nawyki zdrowotne',
      'pielęgniarstwo',
      'testy premium'
    ],
    details: {
      ects: 2,
      semester: 'Rok III, Semestr VI',
      objectives:
        '1. Przygotowanie studenta do włączenia się w realizację programów promocji zdrowia skierowanych do różnych osób i społeczności.\n2. Kształtowanie nawyku doskonalenia zawodowego i przygotowanie do systematycznego samokształcenia w przyszłej pracy zawodowej.',
      prerequisites: 'Psychologia, Podstawy pielęgniarstwa.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'C.W.16',
            desc: 'Zasady promocji zdrowia i profilaktyki zdrowotnej.'
          },
          {
            code: 'C.W.17',
            desc: 'Zasady konstruowania programów promocji zdrowia.'
          },
          {
            code: 'C.W.18',
            desc: 'Strategie promocji zdrowia o zasięgu lokalnym, krajowym i światowym.'
          }
        ],
        skills: [
          {
            code: 'C.U.28',
            desc: 'Oceniać potencjał zdrowotny pacjenta i jego rodziny z wykorzystaniem skal, siatek i pomiarów.'
          },
          {
            code: 'C.U.29',
            desc: 'Rozpoznawać uwarunkowania zachowań zdrowotnych pacjenta i czynniki ryzyka chorób wynikających ze stylu życia.'
          },
          {
            code: 'C.U.30',
            desc: 'Dobierać metody i formy profilaktyki i prewencji chorób oraz kształtować zachowania zdrowotne różnych grup społecznych.'
          },
          {
            code: 'C.U.31',
            desc: 'Uczyć pacjenta samokontroli stanu zdrowia.'
          },
          {
            code: 'C.U.32',
            desc: 'Opracowywać i wdrażać indywidualne programy promocji zdrowia pacjentów, rodzin i grup społecznych.'
          }
        ],
        competencies: [
          {
            code: 'K.S.4',
            desc: 'Ponoszenia odpowiedzialności za wykonywane czynności zawodowe.'
          },
          {
            code: 'K.S.5',
            desc: 'Zasięgania opinii ekspertów w przypadku trudności z samodzielnym rozwiązaniem problemu.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Definiowanie zdrowia i promocji zdrowia.',
          'Czynniki warunkujące zdrowie.',
          'Zdrowie w różnych okresach życia człowieka.',
          'Diagnozowanie potencjału zdrowotnego człowieka.',
          'Rozwój idei promocji zdrowia.',
          'Metody promocji zdrowia.',
          'Role zawodowe w promocji zdrowia. Promocja zdrowia a proces pielęgnowania.',
          'Siedliskowe podejście w promocji zdrowia.',
          'Promocja zdrowia i jej związki z profilaktyką, higieną i zdrowiem publicznym.',
          'Profilaktyka jako szczególna procedura działania w obliczu zjawisk społecznie niepożądanych i szkodliwych.'
        ],
        seminars: [
          'Edukacja zdrowotna – obszary, cele, funkcje, modele, formy organizacyjne, metody.',
          'Edukacja zdrowotna jako element procesu pielęgnowania, zadania i kompetencje pielęgniarek.',
          'Tworzenie programów edukacji zdrowotnej.',
          'Specyfika edukacji zdrowotnej pacjenta z uwzględnieniem kryterium wieku i stanu zdrowia.',
          'Strategia konstruowania programu promocji zdrowia.'
        ],
        selfStudy: [
          'Promocja zdrowia w wybranych grupach społecznych (dzieci, młodzież, środowiskopracy, kobiety w poszczególnych okresach życia, mężczyźni, ludzie starsi.',
          'Zadania i kompetencje pielęgniarki w promocji zdrowia i profilaktyka..',
          'Rozwój promocji zdrowia w świetle obrad konferencji międzynarodowych. Podstawowe dokumenty związane z promocja zdrowia.',
          'Doradztwo zdrowotne.',
          'Rola mediów w promocji zdrowia.'
        ]
      }
    }
  },
  'zakazenia-szpitalne': {
    category: 'zakazenia-szpitalne',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5s4bwXrWj5zfQ3u7I8bUgG0ydxCaMOwLKeVP6',
    description:
      'Zaawansowane testy o zakażeniach szpitalnych. Profilaktyka zakażeń, sterylizacja, dezynfekcja, aseptyka, antyseptyka, procedury izolacji oraz kontrola zakażeń w środowisku szpitalnym.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Zakażenia Szpitalne',
    keywords: [
      'zakażenia szpitalne',
      'profilaktyka',
      'sterylizacja',
      'dezynfekcja',
      'aseptyka',
      'antyseptyka',
      'kontrola zakażeń',
      'higiena szpitalna',
      'testy premium'
    ],
    details: {
      ects: 1,
      semester: 'Rok I, Semestr I',
      objectives:
        '1. Przyswojenie sobie przez studentów wiedzy z zakresu higieny szpitalnej i zakażeń szpitalnych/związanych z udzielaniem świadczeń medycznych.\n2. Zaznajomienie studentów ze specyfiką działań z zakresu zapobiegania zakażeniom szpitalnym.\n3. Przygotowanie studenta do aktywnego włączenia się w zwalczanie zakażeń szpitalnych oraz nadzór nad dekontaminacją w placówkach ochrony zdrowia.\n4. Wyrobienie umiejętności i nawyku podejmowania działań zapobiegających powstawaniu i szerzeniu się zakażeń szpitalnych na każdym stanowisku i przy każdym działaniu pielęgniarki.',
      prerequisites:
        'Na podstawie realizacji przedmiotów: Anatomia, Fizjologia, Patologia, Podstawy pielęgniarstwa, Mikrobiologia i parazytologia.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'C.W.36',
            desc: 'Pojęcie zakażeń związanych z udzielaniem świadczeń zdrowotnych, w tym zakażeń szpitalnych, z uwzględnieniem źródeł i rezerwuaru drobnoustrojów w środowisku pozaszpitalnym i szpitalnym, w tym dróg ich szerzenia.'
          },
          {
            code: 'C.W.37',
            desc: 'Sposoby kontroli szerzenia się, zapobiegania i zwalczania zakażeń szpitalnych.'
          },
          {
            code: 'C.W.38',
            desc: 'Mechanizm i sposoby postępowania w zakażeniu krwi, zakażeniu ogólnoustrojowym, szpitalnym zapaleniu płuc, zakażeniu dróg moczowych i zakażeniu miejsca operowanego.'
          }
        ],
        skills: [
          {
            code: 'C.U.48',
            desc: 'Wdrażać standardy postępowania zapobiegającego zakażeniom szpitalnym.'
          },
          {
            code: 'C.U.49',
            desc: 'Stosować środki ochrony własnej, pacjentów i współpracowników przed zakażeniami.'
          }
        ],
        competencies: [
          {
            code: 'K.S.4',
            desc: 'Ponoszenia odpowiedzialności za wykonywane czynności zawodowe.'
          },
          {
            code: 'K.S.5',
            desc: 'Zasięgania opinii ekspertów w przypadku trudności z samodzielnym rozwiązaniem problemu.'
          },
          {
            code: 'K.S.6',
            desc: 'Przewidywania i uwzględniania czynników wpływających na reakcje własne i pacjenta.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Regulacje prawne dotyczące kontroli zakażeń szpitalnych.',
          'Rola i organizacja kontroli zakażeń szpitalnych w placówkach ochrony zdrowia.',
          'Zasady monitorowania zakażeń w placówkach służby zdrowia.',
          'Epidemiologia drobnoustrojów w środowisku szpitalnym.',
          'Drogi szerzenia się zakażeń.',
          'Drobnoustroje chorobotwórcze (bakterie, wirusy, grzyby), jako czynnik etiologiczny zakażeń szpitalnych.',
          'Drobnoustroje alarmowe i ich wpływ na występowanie zakażeń.',
          'Szpitalne zakażenia układowe.',
          'Zakażenia związane z wykonywaniem procedur medycznych w oddziałach szpitalnych.',
          'Podstawy zapobiegania zakażeniom wirusami HBV, HCV, HIV.',
          'Zakażenia bakteryjne, grzybicze i wirusowe. Metody zapobiegania.',
          'Procedury zapobiegania szerzeniu się zakażeniom.',
          'Zadania pielęgniarki w profilaktyce zakażeń szpitalnych w różnych oddziałach.',
          'Umiejętność identyfikowania i kwalifikowania zakażeń oraz ich charakteru przez pielęgniarkę.'
        ],
        seminars: [],
        selfStudy: [
          'Rola pielęgniarki w zapobieganiu zakażeniom wewnątrzszpitalnym w placówkach ochrony zdrowia (wybranej) na podstawie analizy piśmiennictwa - praca pisemna.'
        ]
      }
    }
  },
  'badania-fizykalne': {
    category: 'badania-fizykalne',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5TrNkKU6spcKHld4CGX8o0kyJTPUwfnQEMegN',
    description:
      'Testy z badania fizykalnego dla studentów pielęgniarstwa. Opanuj techniki badania podmiotowego i przedmiotowego, symptomatologię narządową, ocenę stanu zdrowia pacjenta oraz dokumentowanie wyników badania. Przygotuj się do egzaminu z badania fizykalnego.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Badanie Fizykalne',
    keywords: [
      'badanie fizykalne',
      'badanie podmiotowe',
      'badanie przedmiotowe',
      'symptomatologia',
      'pielęgniarstwo',
      'ocena stanu zdrowia',
      'układy narządowe',
      'egzamin pielęgniarski',
      'testy wiedzy',
      'pytania egzaminacyjne'
    ],
    details: {
      ects: 3,
      semester: 'Rok I, Semestr II',
      objectives:
        'Przygotowanie studenta do: kompleksowego prowadzenia badania podmiotowego pacjenta, samodzielnego wykonania badania przedmiotowego w zakresie symptomatologii dolegliwości i objawów ze strony poszczególnych narządów oraz układów zgodnie z obowiązującymi zasadami u osób dorosłych, niemowląt i dzieci oraz osób w wieku podeszłym, dokumentowania wyników badania oraz dokonywania ich analizy i interpretacji dla potrzeb opieki pielęgniarskiej oraz współpracy w zespole terapeutycznym.',
      prerequisites:
        'Wiedza, umiejętności i kompetencje z zakresu: anatomii, fizjologii, biochemii, biofizyki, patologii, podstaw pielęgniarstwa, psychologii i etyki zawodu.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'CW32',
            desc: 'Pojęcie i zasady prowadzenia badania podmiotowego i jego dokumentowania.'
          },
          {
            code: 'CW33',
            desc: 'Metody i techniki kompleksowego badania przedmiotowego.'
          },
          {
            code: 'CW34',
            desc: 'Znaczenie wyników badania podmiotowego i przedmiotowego w formułowaniu oceny stanu zdrowia pacjenta dla potrzeb opieki pielęgniarskiej.'
          },
          {
            code: 'CW35',
            desc: 'Przeprowadzanie badania fizykalnego z wykorzystaniem systemów teleinformatycznych lub systemów łączności.'
          }
        ],
        skills: [
          {
            code: 'CU43',
            desc: 'Przeprowadzać badanie podmiotowe pacjenta, analizować i interpretować jego wyniki.'
          },
          {
            code: 'CU44',
            desc: 'Rozpoznawać i interpretować podstawowe odrębności w badaniu dziecka i osoby dorosłej, w tym osoby w podeszłym wieku.'
          },
          {
            code: 'CU45',
            desc: 'Wykorzystywać techniki badania fizykalnego do oceny fizjologicznych i patologicznych funkcji skóry, zmysłów, głowy, klatki piersiowej, gruczołów piersiowych, jamy brzusznej, narządów płciowych, układu sercowo-naczyniowego, układu oddechowego, obwodowego układu krążenia, układu mięśniowo-szkieletowego i układu nerwowego oraz dokumentować wyniki badania fizykalnego i wykorzystywać je do oceny stanu zdrowia pacjenta.'
          },
          {
            code: 'CU46',
            desc: 'Przeprowadzać kompleksowe badanie podmiotowe i przedmiotowe pacjenta, dokumentować wyniki badania oraz dokonywać ich analizy dla potrzeb opieki pielęgniarskiej.'
          },
          {
            code: 'CU47',
            desc: 'Przeprowadzać badanie fizykalne z wykorzystaniem systemów teleinformatycznych lub systemów łączności.'
          }
        ],
        competencies: [
          {
            code: 'KS1',
            desc: 'Kierowania się dobrem pacjenta, poszanowania godności i autonomii osób powierzonych opiece, okazywania zrozumienia dla różnic światopoglądowych i kulturowych oraz empatii w relacji z pacjentem i jego rodziną.'
          },
          {
            code: 'KS2',
            desc: 'Przestrzegania praw pacjenta i zachowywania w tajemnicy informacji związanych z pacjentem.'
          },
          {
            code: 'KS3',
            desc: 'Samodzielnego i rzetelnego wykonywania zawodu zgodnie z zasadami etyki, w tym przestrzegania wartości i powinności moralnych w opiece nad pacjentem.'
          },
          {
            code: 'KS4',
            desc: 'Ponoszenia odpowiedzialności za wykonywane czynności zawodowe.'
          },
          {
            code: 'KS5',
            desc: 'Zasięgania opinii ekspertów w przypadku trudności z samodzielnym rozwiązaniem problemu.'
          },
          {
            code: 'KS6',
            desc: 'Przewidywania i uwzględniania czynników wpływających na reakcje własne i pacjenta.'
          },
          {
            code: 'KS7',
            desc: 'Dostrzegania i rozpoznawania własnych ograniczeń w zakresie wiedzy, umiejętności i kompetencji społecznych oraz dokonywania samooceny deficytów i potrzeb edukacyjnych.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Badanie fizykalne – części składowe, znaczenie dla procesu diagnostycznego, sposób prowadzenia badania i udział pielęgniarki. Symptomatologia narządowa, zasady zbierania wywiadów dotyczących poszczególnych narządów i układów. Metodyka zbierania informacji w systemie OLD CARD.',
          'Badanie przedmiotowe ogólne (ocena stanu świadomości, zachowania i komunikacji, chodu, stan odżywienia, waga ciała, wzrost, budowa ciała, mięśnie, skóra i tkanka podskórna, obrzęki, owłosienie, paznokcie, węzły chłonne, temperatura ciała).',
          'Badanie głowy i szyi.',
          'Badanie klatki piersiowej: układ oddechowy, układ krążenia oraz gruczoły sutkowe.',
          'Badanie jamy brzusznej oraz układu moczowo-płciowego.',
          'Badanie narządu ruchu.',
          'Badanie tętnic obwodowych i układu żylnego.',
          'Badanie układu nerwowego.',
          'Odrębności w badaniu dziecka i osoby dorosłej oraz osoby w podeszłym wieku.',
          'Wykorzystanie systemów teleinformatycznych lub systemów łączności w badaniach pacjenta.'
        ],
        seminars: [
          'Zasady, sprzęt medyczny oraz kolejność i warunki przeprowadzania kompleksowego badania fizykalnego.',
          'Badanie głowy i szyi: wielkość, kształt czaszki, twarz, gałki oczne, uszy, nos, jama ustna, typowe objawy oczne, szyja, naczynia tętnicze, żylne, tarczyca.',
          'Badanie układu oddechowego: typy klatki piersiowej, oddychanie fizjologiczne i patologiczne, miejsce i linie orientacyjne, granice płuc, opukiwanie porównawcze i topograficzne, rodzaje szmerów oddechowych, duszność.',
          'Badanie układu krążenia: oglądanie i obmacywanie okolicy serca, uderzenie koniuszkowe, granice stłumienia względnego i bezwzględnego serca, przerost i rozszerzenie komór, przedsionków, tony serca – mechanizm powstawania, przyczyny osłabienia i wzmożenia tonów serca, szmery serca.',
          'Badanie gruczołów piersiowych i dołów pachowych.',
          'Badanie jamy brzusznej: oglądanie, obmacywanie, topografia narządów, objawy brzuszne, badanie żołądka, dwunastnicy, pęcherzyka żółciowego, wątroby, trzustki, śledziony.',
          'Badanie układu moczowo-płciowego.',
          'Badanie tętnic obwodowych i żył, układu ruchu.',
          'Badanie centralnego i obwodowego układu nerwowego.',
          'Dokumentowanie wyników badania podmiotowego i przedmiotowego oraz ich analiza dla potrzeb opieki pielęgniarskiej.'
        ],
        selfStudy: [
          'Zbieranie wywiadu od pacjenta w wieku rozwojowym oraz badanie przedmiotowe ogólne.',
          'Zbieranie wywiadu od pacjenta w wieku geriatrycznym oraz badanie przedmiotowe ogólne.',
          'Odrębności w badaniu skóry i jej wytworów u dzieci i osób w wieku starczym.',
          'Badanie jamy brzusznej, układu ruchu i układu nerwowego u dzieci i osób w wieku geriatrycznym.'
        ]
      }
    }
  },
  farmakologia: {
    category: 'farmakologia',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5pu33VvXHWiBDmgJ5wlKFsnLYVX34eQIkxfvb',
    description:
      'Kompleksowe testy z farmakologii dla studentów pielęgniarstwa. Poznaj grupy leków, farmakokinetykę i farmakodynamikę, zasady farmakoterapii, dawkowanie oraz wystawianie recept. Przygotuj się do egzaminu i bezpiecznej praktyki zawodowej.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Farmakologia',
    keywords: [
      'farmakologia',
      'pielęgniarstwo',
      'leki',
      'farmakoterapia',
      'farmakokinetyka',
      'farmakodynamika',
      'dawkowanie',
      'recepty',
      'interakcje lekowe',
      'egzamin pielęgniarski',
      'testy wiedzy',
      'pytania egzaminacyjne'
    ],
    details: {
      ects: 4,
      semester: 'Rok I, Semestr II',
      objectives:
        'Przygotować studentów do świadomego uczestniczenia w procesie farmakoterapii. Zapoznać studentów z farmakologią ogólną, podstawami farmakokinetyki i farmakodynamiki. Przekazać informacje na temat poszczególnych grup leków i wybranych substancji leczniczych, postaci leków, dróg ich podawania oraz sposobu dawkowania. Zapoznać studentów z zasadami wystawiania recept zgodnie ze zleceniami lekarskimi. Przygotować umiejętności korzystania z baz danych, kart charakterystyki leków i informatorów farmaceutycznych. Zapoznać z problemem interakcji i działań niepożądanych leków oraz obowiązkiem ich zgłaszania. Przygotować studentów do studiowania fachowej literatury. Zaszczepić potrzebę ciągłego samokształcenia.',
      prerequisites:
        'Znajomość podstaw biochemii, biofizyki, fizjologii, patofizjologii, mikrobiologii, parazytologii, immunologii.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'A.W19',
            desc: 'Charakteryzuje poszczególne grupy środków leczniczych, główne mechanizmy ich działania i powodowane przez nie przemiany w ustroju i działania uboczne.'
          },
          {
            code: 'A.W20',
            desc: 'Omawia podstawowe zasady farmakoterapii.'
          },
          {
            code: 'A.W21',
            desc: 'Omawia poszczególne grupy leków, substancje czynne zawarte w lekach, zastosowanie leków oraz postacie i drogi ich podawania.'
          },
          {
            code: 'A.W22',
            desc: 'Zna wpływ procesów chorobowych na metabolizm i eliminację leków.'
          },
          {
            code: 'A.W23',
            desc: 'Zna ważniejsze działania niepożądane leków, w tym wynikające z ich interakcji oraz zna procedurę zgłaszania działań niepożądanych leków.'
          },
          {
            code: 'A.W24',
            desc: 'Zna zasady wystawiania recept w ramach realizacji zleceń lekarskich.'
          },
          {
            code: 'A.W25',
            desc: 'Zna grupy leków w terapii krwiozastępczej i zasady leczenia krwią.'
          }
        ],
        skills: [
          {
            code: 'A.U7',
            desc: 'Potrafi szacować niebezpieczeństwo toksykologiczne w określonych grupach wiekowych oraz w różnych stanach klinicznych.'
          },
          {
            code: 'A.U8',
            desc: 'Posługuje się informatorami farmaceutycznymi i bazami danych o produktach leczniczych.'
          },
          {
            code: 'A.U9',
            desc: 'Potrafi wystawiać recepty na leki niezbędne do kontynuacji leczenia w ramach realizacji zleceń lekarskich.'
          },
          {
            code: 'A.U10',
            desc: 'Potrafi przygotowywać zapis form recepturowych substancji leczniczych i środków spożywczych specjalnego przeznaczenia żywieniowego zleconych przez lekarza.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Farmakologia ogólna, podstawy farmakokinetyki, farmakodynamiki.',
          'Wpływ wieku oraz stanów patologicznych na losy leku w ustroju (LADME).',
          'Leki anestezjologiczne. Narkoza.',
          'Leki psychotropowe (neuroleptyki, anksjolityki, leki przeciwdepresyjne i psychostymulujące).',
          'Opioidy, NLPZ, leki narkotyczne i leki stosowane w RZS.',
          'Środki krwiopochodne i krwiozastępcze, niedokrwistości, leki działające na układ krwiotwórczy. Leki przeciwzakrzepowe.',
          'Leki wpływające na naczynia krwionośne. Leczenie nadciśnienia tętniczego, choroby niedokrwiennej serca, niewydolności serca i miażdżycy.',
          'Farmakologia układu oddechowego (leki przeciwkaszlowe, wykrztuśne, leki stosowane w leczeniu astmy i POChP). Farmakoterapia astmy, nowoczesne formy leków.',
          'Leki wpływające na czynność wydzielniczą przewodu pokarmowego, leki stosowane w leczeniu choroby wrzodowej żołądka i dwunastnicy, leki wpływające na odruch wymiotny, leki wpływające na czynność motoryczną jelit, leki żółciopędne i żółciotwórcze.',
          'Leki przeciwnowotworowe, cytostatyczne i cytotoksyczne.',
          'Ogólne zasady chemioterapii zakażeń drobnoustrojami, antybiotyki i chemioterapeutyki.',
          'Farmakoterapia cukrzycy, insulinoterapia.'
        ],
        seminars: [
          'Substancje czynne w produktach leczniczych, postacie leków, drogi podania, leki generyczne.',
          'Rodzaje dawek i sposoby obliczania dawkowania (dzieci, osoby starsze, niewydolność wątroby i nerek).',
          'Zasady wystawiania recept na leki gotowe i recepturowe, postacie i drogi podania.',
          'Umiejętność posługiwania się informatorami farmaceutycznymi i bazami danych o produktach leczniczych.',
          'Karta charakterystyki produktu leczniczego (ChPL), znajomość zawartych informacji i aktywne korzystanie z zawartych w niej informacji o leku.',
          'Formy recepturowe leków, nazewnictwo recepturowe, sposób zapisu i zasady wystawiania recept.',
          'Procedura i zasada zgłaszania działań niepożądanych leku, prawa i obowiązki.',
          'Rozpoznawanie działań niepożądanych leków oraz podstawowych interakcji lekowych.'
        ],
        selfStudy: [
          'Hormony i leki działające na czynność gruczołów wydzielania wewnętrznego.',
          'Leki przeciwhistaminowe, leczenie uczuleń i stanów alergicznych.',
          'Leki spazmolityczne i wpływające na czynność macicy.',
          'Leki wpływające na układ kostny (leczenie osteoporozy).',
          'Leki przeciwrobacze i przeciwpierwotniakowe.',
          'Leki przeciwgrzybicze, przeciwwirusowe, leki stosowane w leczeniu gruźlicy.'
        ]
      }
    }
  },
  genetyka: {
    category: 'genetyka',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5D2kdG57Z2fx3PC4csA61VRoig5ELrXbvQz8K',
    description:
      'Testy z genetyki dla studentów pielęgniarstwa. Opanuj prawa dziedziczenia Mendla, choroby uwarunkowane genetycznie, budowę chromosomów, mutacje oraz podstawy poradnictwa genetycznego. Przygotuj się kompleksowo do egzaminu.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Genetyka',
    keywords: [
      'genetyka',
      'pielęgniarstwo',
      'dziedziczenie',
      'prawa Mendla',
      'chromosomy',
      'mutacje',
      'choroby genetyczne',
      'poradnictwo genetyczne',
      'egzamin pielęgniarski',
      'testy wiedzy',
      'pytania egzaminacyjne'
    ],
    details: {
      ects: 2,
      semester: 'Rok I, Semestr II',
      objectives:
        'Po realizacji przedmiotu student zna: założenia genetyki Mendlowskiej w odniesieniu do człowieka, zagadnienia dziedziczenia chorób genetycznych (jednogenowe, chromosomowe, mitochondrialne i wielogenowe), ich klasyfikację, patogenezę, diagnostykę oraz możliwości terapii i profilaktyki, a także podstawy biologii i patologii molekularnej; zasady nowoczesnej diagnostyki chorób genetycznie uwarunkowanych, ich interpretację i możliwości wykorzystania w praktyce; zasady prowadzenia poradnictwa genetycznego; znaczenie genetyki i współczesne kierunki jej rozwoju oraz kształtowanie postaw etycznych i społecznych w praktyce klinicznej.',
      prerequisites:
        'Wiadomości podstawowe z biologii, ze szczególnym uwzględnieniem biofizyki oraz fizjologii.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'A.W9',
            desc: 'Zna i rozumie uwarunkowania genetyczne grup krwi człowieka oraz konfliktu serologicznego w układzie Rh.'
          },
          {
            code: 'A.W10',
            desc: 'Zna i rozumie problematykę chorób uwarunkowanych genetycznie.'
          },
          {
            code: 'A.W11',
            desc: 'Zna i rozumie budowę chromosomów oraz molekularne podłoże mutagenezy.'
          },
          {
            code: 'A.W12',
            desc: 'Zna i rozumie zasady dziedziczenia różnej liczby cech, dziedziczenia cech ilościowych, niezależnego dziedziczenia cech i dziedziczenia pozajądrowej informacji genetycznej.'
          }
        ],
        skills: [
          {
            code: 'A.U3',
            desc: 'Potrafi szacować ryzyko ujawnienia się danej choroby w oparciu o zasady dziedziczenia i wpływ czynników środowiskowych.'
          },
          {
            code: 'A.U4',
            desc: 'Potrafi wykorzystywać uwarunkowania chorób genetycznych w profilaktyce chorób.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Znaczenie genetyki w medycynie, kierunki rozwoju genetyki, podstawowe zasady i prawa dziedziczenia. Podstawowe definicje pojęć w genetyce. Materiał genetyczny. Budowa i właściwości kwasów nukleinowych.',
          'Prawo Mendla, dziedziczenie cech autosomalnych i związanych z płcią. Rodowody w wywiadzie rodzinnym.',
          'Genom człowieka. Organizacja genomu człowieka. Metody mapowania genomu i wykorzystanie informacji zawartych w genomie.',
          'Uwarunkowania genetyczne grup krwi człowieka oraz konfliktu serologicznego w układzie Rh.',
          'Regulacja aktywności genów, mechanizm regulacji aktywności genetycznej.',
          'Zmienność genetyczna, mutacje jako przyczyny chorób.',
          'Wady rozwojowe o podłożu genetycznym.',
          'Genetyczne przyczyny nowotworów. Onkogeny i antyonkogeny, mutacje chromosomowe, liczbowe i strukturalne. Kancerogeneza środowiskowa.',
          'Znaczenie uwarunkowań chorób genetycznych w profilaktyce chorób.',
          'Choroby możliwe do leczenia genoterapeutycznego.',
          'Perspektywy i niebezpieczeństwa transferów genów.',
          'Etyczne, moralne i prawne aspekty genetyki.',
          'Genetyczne testy przesiewowe, testy nosicielstwa w rodzinach nieobciążonych.'
        ],
        seminars: [],
        selfStudy: [
          'Różnice wpływu genetyki i środowiska na powstanie nowotworów.',
          'Postępy w badaniach dotyczących genetyki.',
          'Etyczne aspekty badań genetycznych.',
          'Genetyka w transplantologii.',
          'Aktualne i proponowane rozwiązania prawne dotyczące badań genetycznych.',
          'Studiowanie literatury przedmiotu.'
        ]
      }
    }
  },
  patologia: {
    category: 'patologia',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5kfYUFUA5zS3pZrqLGeEj7tHO6cdWvCYm4N2R',
    description:
      'Testy z patologii, patofizjologii i patomorfologii dla studentów pielęgniarstwa. Poznaj mechanizmy chorób, etiopatogenezę schorzeń poszczególnych układów, procesy zapalne, nowotworowe oraz zaburzenia homeostazy. Przygotuj się kompleksowo do egzaminu.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Patologia',
    keywords: [
      'patologia',
      'patofizjologia',
      'patomorfologia',
      'pielęgniarstwo',
      'etiopatogeneza',
      'choroby',
      'nowotwory',
      'stan zapalny',
      'homeostaza',
      'egzamin pielęgniarski',
      'testy wiedzy',
      'pytania egzaminacyjne'
    ],
    details: {
      ects: 2,
      semester: 'Rok I, Semestr II',
      objectives:
        'Zapoznanie studentów ze zmianami występującymi pod wpływem bodźców patologicznych w prawidłowo funkcjonującym organizmie człowieka i z reakcjami obronnymi ustroju na różne patogeny. Charakterystyka etiopatogenezy chorób układu krążenia, układu oddechowego, układu krwionośnego, układu wydzielania wewnętrznego oraz chorób nowotworowych. Zapoznanie studentów z patofizjologią układu nerwowego, pokarmowego, moczowego, procesami starzenia, cukrzycy, podstawami stanu zapalnego i rolą odporności ustroju.',
      prerequisites:
        'Posiada wiadomości z zakresu anatomii, fizjologii i biochemii.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'A.W6',
            desc: 'Zna podstawowe pojęcia z zakresu patologii ogólnej i patologii poszczególnych układów organizmu.'
          },
          {
            code: 'A.W7',
            desc: 'Zna wybrane zagadnienia z zakresu patologii narządowej układu krążenia, układu oddechowego, układu trawiennego, układu hormonalnego, układu metabolicznego, układu moczowo-płciowego i układu nerwowego.'
          },
          {
            code: 'A.W8',
            desc: 'Zna czynniki chorobotwórcze zewnętrzne i wewnętrzne, modyfikowalne i niemodyfikowalne.'
          }
        ],
        skills: [
          {
            code: 'A.U2',
            desc: 'Potrafi łączyć obrazy uszkodzeń tkankowych i narządowych z objawami klinicznymi choroby, wywiadem i wynikami badań diagnostycznych.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Patologia, patofizjologia — pojęcia, zakres, procesy patologiczne.',
          'Patofizjologia układu krążenia.',
          'Patofizjologia układu oddechowego.',
          'Patofizjologia układu wydzielania wewnętrznego.',
          'Struktura i regulacja hormonalna.',
          'Patofizjologia układu nerwowego. Zaburzenia procesów w układzie nerwowym.',
          'Zaburzenia ośrodków regulacji układu autonomicznego.',
          'Patofizjologia chorób krwi i układu krwiotwórczego.',
          'Patofizjologia nowotworów.',
          'Układ immunologiczny.',
          'Patofizjologia układu pokarmowego.',
          'Homeostaza i adaptacja.',
          'Homeostaza a problem zdrowia i choroby.',
          'Molekularne podstawy dziedziczenia.',
          'Molekularne podstawy stanu zapalnego.',
          'Zaburzenia termoregulacji.',
          'Miażdżyca.',
          'Rola odporności w patologii.',
          'Cukrzyca, etiopatogeneza, zaburzenia biochemiczne w cukrzycy.',
          'Otyłość, patomorfologia i patofizjologia tkanki tłuszczowej.',
          'Procesy starzenia.'
        ],
        seminars: [
          'Choroba organiczna i czynnościowa — kryteria zjawisk chorobowych, przebieg i zejście choroby.',
          'Patofizjologia nerki i układu moczowego. Zaburzenia ilościowe i jakościowe filtracji kłębkowej.',
          'Homeostaza a problem zdrowia i choroby.',
          'Cukrzyca, etiopatogeneza, zaburzenia biochemiczne w cukrzycy.'
        ],
        selfStudy: [
          'Zaburzenia przemiany materii. Gospodarka wodno-elektrolitowa. Zaburzenia równowagi kwasowo-zasadowej.',
          'Okres przekwitania. Klimakterium. Andropauza.',
          'Działanie czynników środowiskowych. Hałas. Wibracja. Zmienione ciśnienie atmosferyczne.'
        ]
      }
    }
  },
  dietetyka: {
    category: 'dietetyka',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5JrZfRllmQWsLSvF0ZVh7qXdCNxbjatwczey8',
    description:
      'Testy z dietetyki dla studentów pielęgniarstwa. Opanuj zasady prawidłowego żywienia, rolę składników pokarmowych, diety terapeutyczne, ocenę stanu odżywienia oraz żywienie dojelitowe i pozajelitowe. Przygotuj się do egzaminu i praktyki zawodowej.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Dietetyka',
    keywords: [
      'dietetyka',
      'żywienie',
      'pielęgniarstwo',
      'diety terapeutyczne',
      'składniki pokarmowe',
      'stan odżywienia',
      'żywienie kliniczne',
      'poradnictwo żywieniowe',
      'egzamin pielęgniarski',
      'testy wiedzy',
      'pytania egzaminacyjne'
    ],
    details: {
      ects: 2,
      semester: 'Rok I, Semestr I',
      objectives:
        'Opanowanie podstawowej wiedzy z zakresu prawidłowego żywienia z uwzględnieniem roli składników pokarmowych. Poznanie wpływu sposobu żywienia na zdrowie człowieka.',
      prerequisites:
        'Podstawowa wiedza z zakresu zasad żywienia człowieka i fizjologii.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'C.W22',
            desc: 'Zna zapotrzebowanie organizmu na składniki pokarmowe.'
          },
          {
            code: 'C.W23',
            desc: 'Zna zasady żywienia osób zdrowych i chorych w różnym wieku oraz żywienia dojelitowego i pozajelitowego.'
          },
          {
            code: 'C.W24',
            desc: 'Zna zasady leczenia dietetycznego i powikłania dietoterapii.'
          },
          {
            code: 'C.W25',
            desc: 'Zna rodzaje i zastosowanie środków spożywczych specjalnego przeznaczenia żywieniowego.'
          }
        ],
        skills: [
          {
            code: 'C.U35',
            desc: 'Oceniać stan odżywienia organizmu z wykorzystaniem metod antropometrycznych, biochemicznych i badania podmiotowego oraz prowadzić poradnictwo w zakresie żywienia.'
          },
          {
            code: 'C.U36',
            desc: 'Stosować diety terapeutyczne w wybranych schorzeniach.'
          },
          {
            code: 'C.U37',
            desc: 'Dobierać środki spożywcze specjalnego przeznaczenia żywieniowego i wystawiać na nie recepty w ramach realizacji zleceń lekarskich oraz udzielać informacji na temat ich stosowania.'
          }
        ],
        competencies: [
          {
            code: 'K.S.4',
            desc: 'Ponoszenia odpowiedzialności za wykonywane czynności zawodowe.'
          },
          {
            code: 'K.S.5',
            desc: 'Zasięgania opinii ekspertów w przypadku trudności z samodzielnym rozwiązaniem problemu.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Ocena stanu odżywienia i sposobu żywienia różnych grup ludności. Charakterystyka niedożywienia i jego następstw.',
          'Znaczenie żywienia dojelitowego i pozajelitowego — standardy postępowania. Żywienie chorych — uwarunkowania dietetyczne. Zespoły leczenia żywieniowego. Wprowadzenie do problematyki żywieniowej (Evidence Based Nutrition). Podstawowe składniki odżywcze, zapotrzebowanie energetyczne.',
          'Podstawy prawne pracy pielęgniarki w udzielaniu porad żywieniowych i edukacji pacjenta.',
          'Warunki prawidłowego żywienia — piramidy żywieniowe.',
          'Metody oceny stanu odżywienia i sposobu żywienia.',
          'Klasyfikacja diet. Omówienie wybranych diet.',
          'Zaburzenia odżywiania. Żywienie dojelitowe i pozajelitowe — standardy postępowania.'
        ],
        seminars: [
          'Podstawy prawne w zakresie refundacji i ordynowania środków spożywczych specjalnego przeznaczenia, w tym preparatów zawierających hydrolizaty białek mleka.',
          'Charakterystyka i zastosowanie środków spożywczych, które może ordynować pielęgniarka, w tym wystawiać na nie zlecenia lub recepty.',
          'Rodzaje preparatów mleka modyfikowanego i mlekozastępczych oraz wskazania i przeciwwskazania do ich stosowania.'
        ],
        selfStudy: [
          'Opracowanie wybranych tematycznie testów wiedzy na temat żywienia: racjonalnego oraz w wybranych stanach chorobowych.'
        ]
      }
    }
  },
  'pielegniarstwo-internistyczne': {
    category: 'pielegniarstwo-internistyczne',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5EsWLi5icmxY7yfWXOQoKS6ujlVhadLJtzgFp',
    description:
      'Testy z chorób wewnętrznych i pielęgniarstwa internistycznego dla studentów pielęgniarstwa. Poznaj etiopatogenezę, objawy, leczenie i zasady opieki pielęgniarskiej nad pacjentami z chorobami układu krążenia, oddechowego, pokarmowego, moczowego, kostno-stawowego, dokrewnego oraz krwi. Przygotuj się do zaliczenia i praktyki zawodowej.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Choroby wewnętrzne i pielęgniarstwo internistyczne',
    keywords: [
      'choroby wewnętrzne',
      'interna',
      'pielęgniarstwo internistyczne',
      'układ krążenia',
      'układ oddechowy',
      'układ pokarmowy',
      'układ moczowy',
      'cukrzyca',
      'kardiologia',
      'egzamin pielęgniarski',
      'testy wiedzy',
      'pytania egzaminacyjne'
    ],
    details: {
      ects: 13,
      semester: 'Rok II, Semestr III',
      objectives:
        'Kształtowanie umiejętności rozpoznawania potrzeb chorego w sferze bio-psycho-społecznej z uwzględnieniem sfery kulturowej i duchowej. Nauczenie działania pielęgniarki w zespole interdyscyplinarnym w procesie edukacji zdrowotnej, profilaktyki, diagnozowania, leczenia i rehabilitacji chorych internistycznych. Wykształcenie umiejętności wykorzystania wiedzy klinicznej w formułowaniu diagnozy pielęgniarskiej, ustalania celów i planu opieki pielęgniarskiej u pacjentów z chorobami układu krążenia, serca, naczyń krwionośnych, układu oddechowego, układu pokarmowego, wątroby, trzustki, układu moczowego, układu kostno-stawowego, mięśni, układu dokrewnego oraz krwi.',
      prerequisites:
        'Wiedza, umiejętności i kompetencje z przedmiotów podstawowych (anatomia, fizjologia, patologia, farmakologia) oraz wybranych treści kierunkowych (podstawy pielęgniarstwa, filozofia i etyka zawodu pielęgniarki, promocja zdrowia).',
      learningOutcomes: {
        knowledge: [
          {
            code: 'D.W1',
            desc: 'Czynniki ryzyka i zagrożenia zdrowotne u pacjentów w różnym wieku.'
          },
          {
            code: 'D.W2',
            desc: 'Etiopatogeneza, objawy kliniczne, przebieg, leczenie, rokowanie i zasady opieki pielęgniarskiej nad pacjentami w wybranych chorobach.'
          },
          {
            code: 'D.W3',
            desc: 'Zasady diagnozowania i planowania opieki nad pacjentem w pielęgniarstwie internistycznym, chirurgicznym, położniczo-ginekologicznym, pediatrycznym, geriatrycznym, neurologicznym, psychiatrycznym, w intensywnej opiece medycznej, opiece paliatywnej i długoterminowej.'
          },
          {
            code: 'D.W4',
            desc: 'Rodzaje badań diagnostycznych i zasady ich zlecania.'
          },
          {
            code: 'D.W5',
            desc: 'Zasady przygotowania pacjenta do badań oraz zabiegów diagnostycznych, a także zasady opieki w trakcie oraz po tych badaniach i zabiegach.'
          },
          {
            code: 'D.W6',
            desc: 'Właściwości grup leków i ich działanie na układy i narządy pacjenta w różnych chorobach, z uwzględnieniem działań niepożądanych i interakcji z innymi lekami.'
          },
          {
            code: 'D.W7',
            desc: 'Standardy i procedury pielęgniarskie stosowane w opiece nad pacjentem w różnym wieku i stanie zdrowia.'
          },
          {
            code: 'D.W8',
            desc: 'Reakcje pacjenta na chorobę, przyjęcie do szpitala i hospitalizację.'
          },
          {
            code: 'D.W9',
            desc: 'Zasady organizacji opieki specjalistycznej (geriatrycznej, intensywnej opieki medycznej, neurologicznej, psychiatrycznej, pediatrycznej, internistycznej, chirurgicznej, paliatywnej, długoterminowej oraz na bloku operacyjnym).'
          }
        ],
        skills: [
          {
            code: 'D.U1',
            desc: 'Gromadzi informacje, formułuje diagnozę pielęgniarską, ustala cele i plan opieki pielęgniarskiej, wdraża interwencje pielęgniarskie oraz dokonuje ewaluacji opieki.'
          },
          {
            code: 'D.U2',
            desc: 'Prowadzi poradnictwo w zakresie samoopieki pacjentów dotyczące wad rozwojowych, chorób i uzależnień.'
          },
          {
            code: 'D.U9',
            desc: 'Doraźnie podaje tlen i monitoruje jego stan podczas tlenoterapii.'
          },
          {
            code: 'D.U10',
            desc: 'Wykonuje badanie elektrokardiograficzne i rozpoznaje zaburzenia zagrażające życiu.'
          },
          {
            code: 'D.U11',
            desc: 'Modyfikuje dawkę stałą insuliny szybko- i krótko działającej.'
          },
          {
            code: 'D.U15',
            desc: 'Dokumentuje sytuację zdrowotną pacjenta, dynamikę jej zmian i realizowaną opiekę pielęgniarską, z uwzględnieniem narzędzi informatycznych.'
          },
          {
            code: 'D.U18',
            desc: 'Rozpoznaje powikłania leczenia farmakologicznego, dietetycznego, rehabilitacyjnego i leczniczo-pielęgnacyjnego.'
          },
          {
            code: 'D.U26',
            desc: 'Przygotowuje i podaje pacjentom leki różnymi drogami, samodzielnie lub na zlecenie lekarza.'
          }
        ],
        competencies: [
          {
            code: 'K.S1',
            desc: 'Kieruje się dobrem pacjenta, poszanowaniem godności i autonomii osób powierzonych opiece, okazuje zrozumienie dla różnic światopoglądowych i kulturowych oraz empatię w relacji z pacjentem i jego rodziną.'
          },
          {
            code: 'K.S2',
            desc: 'Przestrzega praw pacjenta i zachowuje w tajemnicy informacje związane z pacjentem.'
          },
          {
            code: 'K.S4',
            desc: 'Ponosi odpowiedzialność za wykonywane czynności zawodowe.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Choroba wrzodowa żołądka i dwunastnicy oraz choroba refluksowa przełyku — etiopatogeneza, objawy, leczenie.',
          'Przewlekłe zapalenie i marskość wątroby.',
          'Ostre i przewlekłe zapalenie trzustki oraz nieswoiste zapalenia jelit.',
          'Cukrzyca typu 1 i 2 — symptomatologia, diagnostyka, zasady leczenia insuliną i lekami doustnymi.',
          'Schorzenia tarczycy — choroba Gravesa-Basedowa, symptomatologia, diagnostyka i leczenie.',
          'Funkcja układu krążenia i mechanizmy kompensacyjne. Objawy chorób układu krążenia groźne dla życia.',
          'Obrzęk płuc i wstrząs kardiogenny — przyczyny, objawy, zasady postępowania i pierwszej pomocy.',
          'Symptomatologia i rozpoznawanie chorób układu oddechowego.',
          'Przewlekła obturacyjna choroba płuc, astma oskrzelowa.',
          'Zapalenie płuc i opłucnej, gruźlica, rak, niewydolność oddechowa i zatorowość.',
          'Reumatoidalne zapalenie stawów.',
          'Układowe choroby tkanki łącznej (kolagenozy). Reumatyzm tkanek miękkich.',
          'Choroby układu czerwonokrwinkowego — niedokrwistość.',
          'Choroby układu białokrwinkowego — leuko- i limfocytozy odczynowe, limfo- i mieloproliferacje.',
          'Infekcje dróg moczowych.',
          'Przewlekła i ostra niewydolność nerek.',
          'Rodzaje i zasady zlecania badań diagnostycznych.'
        ],
        seminars: [
          'Problemy pacjentów z chorobami narządów wewnętrznych zależne od charakteru i przebiegu procesu chorobowego.',
          'Zadania pielęgniarki w opiece nad chorym z chorobą niedokrwienną serca.',
          'Diagnoza pielęgniarska i procedury rozwiązywania problemów opiekuńczych chorych z przewlekłą niewydolnością krążenia.',
          'Zadania pielęgniarki wobec chorego z astmą oskrzelową, obturacyjną chorobą płuc i przewlekłą niewydolnością oddechową.',
          'Zadania pielęgniarki wobec pacjenta z chorobą wrzodową żołądka i dwunastnicy oraz marskością wątroby.',
          'Postępowanie pielęgniarskie wobec chorego z zapaleniem pęcherzyka i dróg żółciowych.',
          'Problemy pielęgnacyjne pacjentów z nadczynnością i niedoczynnością tarczycy.',
          'Diagnoza pielęgniarska i procedury rozwiązywania problemów opiekuńczych chorych na cukrzycę typu I i II, rola pielęgniarki w edukacji pacjenta.',
          'Diagnoza pielęgniarska i procedury rozwiązywania problemów opiekuńczych chorych z zapaleniem układu moczowego i przewlekłą niewydolnością nerek.',
          'Diagnoza pielęgniarska i procedury rozwiązywania problemów opiekuńczych chorych z białaczką i niedokrwistością.',
          'Zadania pielęgniarki wobec pacjenta z reumatoidalnym zapaleniem stawów i osteoporozą.'
        ],
        selfStudy: [
          'Udział pielęgniarki w opiece nad chorym z chorobą niedokrwienną serca.',
          'Rola pielęgniarki w przygotowaniu pacjenta z nadciśnieniem tętniczym do samoopieki.',
          'Zadania pielęgniarki w opiece nad pacjentem z niewydolnością serca.',
          'Postępowanie pielęgniarskie wobec pacjenta z zapaleniem płuc.',
          'Zadania pielęgniarki w opiece nad chorym z astmą oskrzelową i z gruźlicą.',
          'Problemy opiekuńcze i sposoby ich rozwiązywania u pacjentów z przewlekłą obturacyjną chorobą płuc.',
          'Rola pielęgniarki w przygotowaniu pacjenta z cukrzycą do samoopieki.',
          'Kierunki opieki pielęgniarskiej wobec pacjentów z reumatoidalnym zapaleniem stawów oraz ZZSK.',
          'Problemy opiekuńcze pacjentów z chorobą wrzodową żołądka i dwunastnicy oraz przewlekłym zapaleniem trzustki.',
          'Zadania pielęgniarki wobec pacjenta z wrzodziejącym zapaleniem jelita grubego i chorobą Leśniowskiego-Crohna.',
          'Zadania pielęgniarki wobec chorego ze stanem zapalnym dróg moczowych oraz przewlekłą niewydolnością nerek.',
          'Zadania pielęgniarki w opiece nad pacjentem z niedokrwistością i białaczką oraz zaburzeniami tarczycy.',
          'Zadania pielęgniarki w farmakoterapii i leczeniu dietetycznym chorych na cukrzycę.',
          'Zakres zadań pielęgniarki w opiece nad pacjentem z zaburzeniami rytmu serca — tachy- i bradyarytmie.'
        ]
      }
    }
  },
  'pielegniarstwo-chirurgiczne': {
    category: 'pielegniarstwo-chirurgiczne',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5G5GvuJptmTzWn2MCIiBjAQoFa6kbwYUZJScD',
    description:
      'Testy z chirurgii i pielęgniarstwa chirurgicznego dla studentów pielęgniarstwa. Poznaj zasady opieki okołooperacyjnej, przygotowanie pacjenta do zabiegu w trybie pilnym i planowym, zapobieganie powikłaniom pooperacyjnym, pielęgnację ran i przetok oraz postępowanie w stanach zagrożenia życia w chirurgii.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Pielęgniarstwo chirurgiczne',
    keywords: [
      'chirurgia',
      'pielęgniarstwo chirurgiczne',
      'opieka okołooperacyjna',
      'powikłania pooperacyjne',
      'pielęgnacja ran',
      'przetoka jelitowa',
      'oparzenia',
      'blok operacyjny',
      'ERAS',
      'egzamin pielęgniarski',
      'testy wiedzy',
      'pytania egzaminacyjne'
    ],
    details: {
      ects: 13,
      semester: 'Rok II, Semestr III',
      objectives:
        'Pogłębienie wiedzy o pielęgnowaniu chorych z uwzględnieniem leczenia chirurgicznego w wybranych jednostkach chorobowych. Przygotowanie studenta do samodzielnego pielęgnowania chorych leczonych chirurgicznie przy zapewnieniu profesjonalnej, całościowej opieki bez względu na miejsce, czas i technikę zabiegu operacyjnego. Doskonalenie umiejętności samokształcenia i samokontroli.',
      prerequisites:
        'Wiedza, umiejętności i kompetencje z przedmiotów realizujących treści podstawowe i wybrane treści kierunkowe (podstawy pielęgniarstwa, etyka zawodu pielęgniarki, promocja zdrowia, interna i pielęgniarstwo internistyczne, anatomia i fizjologia oraz patologia).',
      learningOutcomes: {
        knowledge: [
          {
            code: 'D.W1',
            desc: 'Czynniki ryzyka i zagrożenia zdrowotne u pacjentów w różnym wieku.'
          },
          {
            code: 'D.W2',
            desc: 'Etiopatogeneza, objawy kliniczne, przebieg, leczenie, rokowanie i zasady opieki pielęgniarskiej nad pacjentami w wybranych chorobach.'
          },
          {
            code: 'D.W3',
            desc: 'Zasady diagnozowania i planowania opieki nad pacjentem w pielęgniarstwie chirurgicznym.'
          },
          {
            code: 'D.W4',
            desc: 'Rodzaje badań diagnostycznych i zasady ich zlecania.'
          },
          {
            code: 'D.W5',
            desc: 'Zasady przygotowania pacjenta w różnym wieku i stanie zdrowia do badań oraz zabiegów diagnostycznych, a także zasady opieki w trakcie oraz po tych badaniach i zabiegach.'
          },
          {
            code: 'D.W6',
            desc: 'Właściwości grup leków i ich działanie na układy i narządy pacjenta w różnych chorobach w zależności od wieku i stanu zdrowia, z uwzględnieniem działań niepożądanych, interakcji z innymi lekami i dróg podania.'
          },
          {
            code: 'D.W7',
            desc: 'Standardy i procedury pielęgniarskie stosowane w opiece nad pacjentem w różnym wieku i stanie zdrowia.'
          },
          {
            code: 'D.W8',
            desc: 'Reakcje pacjenta na chorobę, przyjęcie do szpitala i hospitalizację.'
          },
          {
            code: 'D.W10',
            desc: 'Zasady organizacji opieki specjalistycznej (chirurgicznej).'
          },
          {
            code: 'D.W22',
            desc: 'Zasady żywienia pacjentów, z uwzględnieniem leczenia dietetycznego, wskazań przed- i pooperacyjnych według protokołu kompleksowej opieki okołooperacyjnej dla poprawy wyników leczenia (Enhanced Recovery After Surgery, ERAS).'
          },
          {
            code: 'D.W23',
            desc: 'Czynniki zwiększające ryzyko okołooperacyjne.'
          },
          {
            code: 'D.W24',
            desc: 'Zasady przygotowania pacjenta do zabiegu operacyjnego w trybie pilnym i planowym, w chirurgii jednego dnia oraz zasady opieki nad pacjentem po zabiegu operacyjnym w celu zapobiegania wczesnym i późnym powikłaniom.'
          },
          {
            code: 'D.W25',
            desc: 'Zasady opieki nad pacjentem z przetoką jelitową i moczową.'
          },
          {
            code: 'D.W29',
            desc: 'Zasady obserwacji pacjenta po zabiegu operacyjnym, obejmujące monitorowanie w zakresie podstawowym i rozszerzonym.'
          }
        ],
        skills: [
          {
            code: 'D.U1',
            desc: 'Gromadzi informacje, formułuje diagnozę pielęgniarską, ustala cele i plan opieki pielęgniarskiej, wdraża interwencje pielęgniarskie oraz dokonuje ewaluacji opieki.'
          },
          {
            code: 'D.U2',
            desc: 'Prowadzi poradnictwo w zakresie samoopieki pacjentów w różnym wieku i stanie zdrowia dotyczące wad rozwojowych, chorób i uzależnień.'
          },
          {
            code: 'D.U3',
            desc: 'Prowadzi profilaktykę powikłań występujących w przebiegu chorób.'
          },
          {
            code: 'D.U6',
            desc: 'Dobiera technikę i sposoby pielęgnowania rany, w tym zakładania opatrunków.'
          },
          {
            code: 'D.U7',
            desc: 'Dobiera metody i środki pielęgnacji ran na podstawie ich klasyfikacji.'
          },
          {
            code: 'D.U8',
            desc: 'Rozpoznaje powikłania po specjalistycznych badaniach diagnostycznych i zabiegach operacyjnych.'
          },
          {
            code: 'D.U15',
            desc: 'Dokumentuje sytuację zdrowotną pacjenta, dynamikę jej zmian i realizowaną opiekę pielęgniarską, z uwzględnieniem narzędzi informatycznych do gromadzenia danych.'
          },
          {
            code: 'D.U17',
            desc: 'Prowadzi u osób dorosłych i dzieci żywienie dojelitowe (przez zgłębnik i przetokę odżywczą) oraz żywienie pozajelitowe.'
          },
          {
            code: 'D.U18',
            desc: 'Rozpoznaje powikłania leczenia farmakologicznego, dietetycznego, rehabilitacyjnego i leczniczo-pielęgnacyjnego.'
          },
          {
            code: 'D.U19',
            desc: 'Pielęgnuje pacjenta z przetoką jelitową oraz rurką intubacyjną i tracheotomijną.'
          },
          {
            code: 'D.U20',
            desc: 'Prowadzi rozmowę terapeutyczną.'
          },
          {
            code: 'D.U22',
            desc: 'Przekazuje informacje członkom zespołu terapeutycznego o stanie zdrowia pacjenta.'
          },
          {
            code: 'D.U24',
            desc: 'Ocenia poziom bólu, reakcję pacjenta na ból i jego nasilenie oraz stosuje farmakologiczne i niefarmakologiczne postępowanie przeciwbólowe.'
          }
        ],
        competencies: [
          {
            code: 'K.S1',
            desc: 'Kieruje się dobrem pacjenta, poszanowaniem godności i autonomii osób powierzonych opiece, okazuje zrozumienie dla różnic światopoglądowych i kulturowych oraz empatię w relacji z pacjentem i jego rodziną.'
          },
          {
            code: 'K.S2',
            desc: 'Przestrzega praw pacjenta i zachowuje w tajemnicy informacje związane z pacjentem.'
          },
          {
            code: 'K.S3',
            desc: 'Samodzielnie i rzetelnie wykonuje zawód zgodnie z zasadami etyki, w tym przestrzega wartości i powinności moralnych w opiece nad pacjentem.'
          },
          {
            code: 'K.S4',
            desc: 'Ponosi odpowiedzialność za wykonywane czynności zawodowe.'
          },
          {
            code: 'K.S5',
            desc: 'Zasięga opinii ekspertów w przypadku trudności z samodzielnym rozwiązaniem problemu.'
          },
          {
            code: 'K.S6',
            desc: 'Przewiduje i uwzględnia czynniki wpływające na reakcje własne i pacjenta.'
          },
          {
            code: 'K.S7',
            desc: 'Dostrzega i rozpoznaje własne ograniczenia w zakresie wiedzy, umiejętności i kompetencji społecznych oraz dokonuje samooceny deficytów i potrzeb edukacyjnych.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Nowoczesne metody diagnozowania i leczenia chirurgicznego.',
          'Ocena stanu pacjenta po zabiegu operacyjnym i zapobieganie powikłaniom pooperacyjnym.',
          'Powikłania pooperacyjne.',
          'Odżywianie chorego w chirurgii. Zaburzenia gospodarki wodno-elektrolitowej.',
          'Ostre choroby jamy brzusznej (zapalenie otrzewnej, niedrożność jelit, krwotok z przewodu pokarmowego, ostre zapalenie wyrostka robaczkowego, ostre zapalenie trzustki). Zachowawcze i chirurgiczne leczenie schorzeń jamy brzusznej.',
          'Choroby gruczołu piersiowego. Chirurgiczne leczenie schorzeń gruczołu piersiowego.',
          'Chirurgiczne leczenie schorzeń tarczycy. Opieka pielęgniarska po operacji z powodu schorzeń gruczołów wydzielania wewnętrznego.',
          'Choroby układu moczowo-płciowego wymagające zachowawczego lub zabiegowego leczenia chirurgicznego.',
          'Schorzenia naczyń obwodowych tętniczych i żylnych (choroba Buergera, niedokrwienie kończyn, żylaki kończyn dolnych i amputacja kończyny, zatory).',
          'Oparzenia i odmrożenia.',
          'Stany zagrożenia życia w chirurgii.',
          'Pacjent w chirurgii jednego dnia.'
        ],
        seminars: [
          'Rola pielęgniarki w diagnozowaniu pacjenta ze schorzeniami leczonymi w oddziałach chirurgii.',
          'Przygotowanie chorego do zabiegu operacyjnego.',
          'Zasady pielęgnowania pacjenta w okresie okołooperacyjnym.',
          'Zadania pielęgniarki w zapobieganiu i wczesnym rozpoznawaniu powikłań pooperacyjnych.',
          'Rola pielęgniarki w odżywianiu chorego w chirurgii.',
          'Pielęgnowanie chorego po urazach.',
          'Zasady pielęgnowania pacjenta z chirurgicznym schorzeniem narządów jamy brzusznej i przewodu pokarmowego.',
          'Model opieki pielęgniarskiej chorej/chorego z chorobami gruczołu piersiowego.',
          'Model opieki pielęgniarskiej chorego po zabiegu usunięcia tarczycy.',
          'Zadania pielęgniarki w opiece nad pacjentem po operacji w obrębie układu moczowo-płciowego.',
          'Model opieki pielęgniarskiej chorego z chorobą niedokrwienną kończyn, żylakami kończyn dolnych i po amputacji kończyny dolnej.',
          'Problemy pielęgnacyjne w opiece nad chorym z oparzeniami i odmrożeniami.',
          'Standardy postępowania pielęgniarskiego w wybranych stanach zagrożenia życia w schorzeniach chirurgicznych.',
          'Pielęgnowanie chorych z ranami (pooperacyjną, owrzodzeniową, oparzeniową). Zapobieganie zakażeniom szpitalnym ran w chirurgii.'
        ],
        selfStudy: [
          'Profilaktyka wybranego schorzenia chirurgicznego.',
          'Rola pielęgniarki w zapobieganiu zakażeniom wewnątrzszpitalnym na oddziale chirurgicznym i bloku operacyjnym.',
          'Rola pielęgniarki w zapobieganiu powikłaniom pooperacyjnym u pacjenta z wybranym schorzeniem chirurgicznym.',
          'Udział pielęgniarki w edukacji chorego leczonego w oddziałach zabiegowych.',
          'Żywienie chorych i rodzaje diet w oddziale chirurgicznym.'
        ]
      }
    }
  },
  'pielegniarstwo-neurologiczne': {
    category: 'pielegniarstwo-neurologiczne',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5arfwh6ktQrdmqhSKIRj5fanksB630Te2FpiO',
    description:
      'Testy z neurologii i pielęgniarstwa neurologicznego dla studentów pielęgniarstwa. Poznaj zespoły uszkodzenia układu nerwowego, choroby naczyniowe mózgu, choroby demielinizacyjne i zwyrodnieniowe, padaczkę oraz zasady opieki nad chorym z zaburzeniami świadomości, mowy, czucia i mobilności.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Pielęgniarstwo neurologiczne',
    keywords: [
      'neurologia',
      'pielęgniarstwo neurologiczne',
      'udar mózgu',
      'stwardnienie rozsiane',
      'padaczka',
      'choroba Parkinsona',
      'choroba Alzheimera',
      'guzy mózgu',
      'zaburzenia świadomości',
      'egzamin pielęgniarski',
      'testy wiedzy',
      'pytania egzaminacyjne'
    ],
    details: {
      ects: 8,
      semester: 'Rok II, Semestr IV',
      objectives:
        'Przekazanie wiedzy i umiejętności z zakresu neurologii i pielęgniarstwa neurologicznego.',
      prerequisites:
        'Anatomia i fizjologia człowieka, podstawy pielęgniarstwa, pielęgniarstwo internistyczne, pielęgniarstwo chirurgiczne, pielęgniarstwo pediatryczne.',
      learningOutcomes: {
        knowledge: [
          {
            code: 'D.W1',
            desc: 'Czynniki ryzyka i zagrożenia zdrowotne u pacjentów w różnym wieku.'
          },
          {
            code: 'D.W2',
            desc: 'Etiopatogeneza, objawy kliniczne, przebieg, leczenie, rokowanie i zasady opieki pielęgniarskiej nad pacjentami w wybranych chorobach.'
          },
          {
            code: 'D.W3',
            desc: 'Zasady diagnozowania i planowania opieki nad pacjentem w pielęgniarstwie neurologicznym.'
          },
          {
            code: 'D.W4',
            desc: 'Rodzaje badań diagnostycznych i zasady ich zlecania.'
          },
          {
            code: 'D.W5',
            desc: 'Zasady przygotowania pacjenta w różnym wieku i stanie zdrowia do badań oraz zabiegów diagnostycznych, a także zasady opieki w trakcie oraz po tych badaniach i zabiegach.'
          },
          {
            code: 'D.W6',
            desc: 'Właściwości grup leków i ich działanie na układy i narządy pacjenta w różnych chorobach w zależności od wieku i stanu zdrowia, z uwzględnieniem działań niepożądanych, interakcji z innymi lekami i dróg podania.'
          },
          {
            code: 'D.W7',
            desc: 'Standardy i procedury pielęgniarskie stosowane w opiece nad pacjentem w różnym wieku i stanie zdrowia.'
          },
          {
            code: 'D.W8',
            desc: 'Reakcje pacjenta na chorobę, przyjęcie do szpitala i hospitalizację.'
          },
          {
            code: 'D.W10',
            desc: 'Zasady organizacji opieki specjalistycznej (neurologicznej).'
          },
          {
            code: 'D.W11',
            desc: 'Etiopatogeneza najczęstszych schorzeń wieku podeszłego.'
          },
          {
            code: 'D.W12',
            desc: 'Narzędzia i skale oceny wsparcia osób starszych i ich rodzin oraz zasady ich aktywizacji.'
          },
          {
            code: 'D.W18',
            desc: 'Metody, techniki i narzędzia oceny stanu świadomości i przytomności.'
          },
          {
            code: 'D.W19',
            desc: 'Etiopatogeneza i objawy kliniczne podstawowych zaburzeń psychicznych.'
          },
          {
            code: 'D.W20',
            desc: 'Zasady obowiązujące przy zastosowaniu przymusu bezpośredniego.'
          },
          {
            code: 'D.W26',
            desc: 'Podstawowe kierunki rehabilitacji leczniczej i zawodowej.'
          },
          {
            code: 'D.W27',
            desc: 'Przebieg i sposoby postępowania rehabilitacyjnego w różnych chorobach.'
          },
          {
            code: 'D.W28',
            desc: 'Standardy i procedury postępowania w stanach nagłych i zabiegach ratujących życie.'
          },
          {
            code: 'D.W32',
            desc: 'Patofizjologia i objawy kliniczne chorób stanowiących zagrożenie dla życia (niewydolność oddechowa, niewydolność krążenia, niewydolność układu nerwowego, wstrząs, sepsa).'
          },
          {
            code: 'D.W33',
            desc: 'Metody i skale oceny bólu, poziomu sedacji oraz zaburzeń snu i stanów delirycznych u pacjentów w stanach zagrożenia życia.'
          },
          {
            code: 'D.W34',
            desc: 'Metody i techniki komunikowania się z pacjentem niezdolnym do nawiązania i podtrzymania efektywnej komunikacji ze względu na stan zdrowia lub stosowane leczenie.'
          },
          {
            code: 'D.W35',
            desc: 'Zasady udzielania pierwszej pomocy i algorytmy postępowania resuscytacyjnego w zakresie podstawowych zabiegów resuscytacyjnych (Basic Life Support, BLS) i zaawansowanego podtrzymywania życia (Advanced Life Support, ALS).'
          }
        ],
        skills: [
          {
            code: 'D.U1',
            desc: 'Gromadzi informacje, formułuje diagnozę pielęgniarską, ustala cele i plan opieki pielęgniarskiej, wdraża interwencje pielęgniarskie oraz dokonuje ewaluacji opieki.'
          },
          {
            code: 'D.U2',
            desc: 'Prowadzi poradnictwo w zakresie samoopieki pacjentów w różnym wieku i stanie zdrowia dotyczące wad rozwojowych, chorób i uzależnień.'
          },
          {
            code: 'D.U3',
            desc: 'Prowadzi profilaktykę powikłań występujących w przebiegu chorób.'
          },
          {
            code: 'D.U4',
            desc: 'Organizuje izolację pacjentów z chorobą zakaźną w miejscach publicznych i w warunkach domowych.'
          },
          {
            code: 'D.U8',
            desc: 'Rozpoznaje powikłania po specjalistycznych badaniach diagnostycznych i zabiegach operacyjnych.'
          },
          {
            code: 'D.U9',
            desc: 'Doraźnie podaje pacjentowi tlen i monitoruje jego stan podczas tlenoterapii.'
          },
          {
            code: 'D.U11',
            desc: 'Modyfikuje dawkę stałą insuliny szybko- i krótko działającej.'
          },
          {
            code: 'D.U12',
            desc: 'Przygotowuje pacjenta fizycznie i psychicznie do badań diagnostycznych.'
          },
          {
            code: 'D.U15',
            desc: 'Dokumentuje sytuację zdrowotną pacjenta, dynamikę jej zmian i realizowaną opiekę pielęgniarską, z uwzględnieniem narzędzi informatycznych do gromadzenia danych.'
          },
          {
            code: 'D.U18',
            desc: 'Rozpoznaje powikłania leczenia farmakologicznego, dietetycznego, rehabilitacyjnego i leczniczo-pielęgnacyjnego.'
          },
          {
            code: 'D.U20',
            desc: 'Prowadzi rozmowę terapeutyczną.'
          },
          {
            code: 'D.U21',
            desc: 'Prowadzi rehabilitację przyłóżkową i aktywizację z wykorzystaniem elementów terapii zajęciowej.'
          },
          {
            code: 'D.U22',
            desc: 'Przekazuje informacje członkom zespołu terapeutycznego o stanie zdrowia pacjenta.'
          },
          {
            code: 'D.U23',
            desc: 'Asystuje lekarzowi w trakcie badań diagnostycznych.'
          },
          {
            code: 'D.U24',
            desc: 'Ocenia poziom bólu, reakcję pacjenta na ból i jego nasilenie oraz stosuje farmakologiczne i niefarmakologiczne postępowanie przeciwbólowe.'
          },
          {
            code: 'D.U25',
            desc: 'Postępuje zgodnie z procedurą z ciałem zmarłego pacjenta.'
          },
          {
            code: 'D.U26',
            desc: 'Przygotowuje i podaje pacjentom leki różnymi drogami, samodzielnie lub na zlecenie lekarza.'
          }
        ],
        competencies: [
          {
            code: 'K.S1',
            desc: 'Kieruje się dobrem pacjenta, poszanowaniem godności i autonomii osób powierzonych opiece, okazuje zrozumienie dla różnic światopoglądowych i kulturowych oraz empatię w relacji z pacjentem i jego rodziną.'
          },
          {
            code: 'K.S2',
            desc: 'Przestrzega praw pacjenta.'
          },
          {
            code: 'K.S3',
            desc: 'Samodzielnie i rzetelnie wykonuje zawód zgodnie z zasadami etyki, w tym przestrzega wartości i powinności moralnych w opiece nad pacjentem.'
          },
          {
            code: 'K.S4',
            desc: 'Ponosi odpowiedzialność za wykonywane czynności zawodowe.'
          },
          {
            code: 'K.S5',
            desc: 'Zasięga opinii ekspertów w przypadku trudności z samodzielnym rozwiązaniem problemu.'
          },
          {
            code: 'K.S6',
            desc: 'Przewiduje i uwzględnia czynniki wpływające na reakcje własne i pacjenta.'
          },
          {
            code: 'K.S7',
            desc: 'Dostrzega i rozpoznaje własne ograniczenia w zakresie wiedzy, umiejętności i kompetencji społecznych oraz dokonuje samooceny deficytów i potrzeb edukacyjnych.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Podstawowe wiadomości dotyczące anatomii układu nerwowego.',
          'Zespoły uszkodzenia układu nerwowego.',
          'Badania diagnostyczne w neurologii.',
          'Wywiad, podstawowe objawy patologiczne ze strony układu nerwowego, badanie neurologiczne pacjenta.',
          'Choroby naczyniowe mózgu: zawał mózgu, krwotok śródmózgowy, krwotok podpajęczynówkowy.',
          'Choroby demielinizacyjne.',
          'Padaczka.',
          'Choroby zwyrodnieniowe układu nerwowego: stwardnienie boczne zanikowe, choroba Alzheimera, choroba Parkinsona.',
          'Choroby zapalne układu nerwowego.',
          'Zespoły korzeniowe.',
          'Poliradikulopatie i polineuropatie.',
          'Choroby nerwowo-mięśniowe.',
          'Guzy mózgu.',
          'Urazy czaszkowo-mózgowe.',
          'Bóle głowy.'
        ],
        seminars: [
          'Udział pielęgniarki w diagnozowaniu, leczeniu i rehabilitacji chorych neurologicznie.',
          'Zakres rozpoznania pielęgniarskiego i problemy pielęgnacyjne chorego po udarze mózgu.',
          'Zakres rozpoznania pielęgniarskiego i problemy pielęgnacyjne pacjentów po urazie rdzenia kręgowego w różnych fazach leczenia.',
          'Zakres rozpoznania pielęgniarskiego i problemy pielęgnacyjne chorych w chorobach demielinizacyjnych.',
          'Zakres rozpoznania pielęgniarskiego i problemy pielęgnacyjne chorych na stwardnienie rozsiane.',
          'Zakres rozpoznania pielęgniarskiego i problemy pielęgnacyjne chorych na padaczkę.',
          'Zakres rozpoznania pielęgniarskiego i problemy pielęgnacyjne w chorobach degeneracyjnych ośrodkowego układu nerwowego.',
          'Zakres rozpoznania pielęgniarskiego i problemy pielęgnacyjne w zespołach otępiennych pochodzenia neurologicznego.',
          'Zakres rozpoznania pielęgniarskiego i problemy pielęgnacyjne chorych z guzem mózgu.',
          'Zakres rozpoznania pielęgniarskiego i problemy pielęgnacyjne chorych z zespołem korzeniowym i dyskopatią.',
          'Zakres rozpoznania pielęgniarskiego i problemy pielęgnacyjne chorych po urazie czaszkowo-mózgowym.',
          'Zakres rozpoznania pielęgniarskiego i problemy pielęgnacyjne chorych z zaburzeniami mowy.',
          'Zakres rozpoznania pielęgniarskiego i problemy pielęgnacyjne chorych z zaburzeniami czucia.',
          'Zakres rozpoznania pielęgniarskiego i problemy pielęgnacyjne chorych z zaburzeniami świadomości.'
        ],
        selfStudy: [
          'Epidemiologia wybranych chorób układu nerwowego na świecie i w Polsce.',
          'Metody monitorowania chorych neurologicznych.',
          'Metody terapii stosowane w oddziałach neurologicznych.',
          'Opieka pielęgniarska nad chorym w wybranych zaburzeniach funkcji układu nerwowego.',
          'Zapobieganie zakażeniom w oddziale neurologicznym.',
          'Zapobieganie odleżynom u chorych neurologicznych.',
          'Opieka psychologiczna nad pacjentem oraz jego rodziną w oddziale neurologicznym.'
        ]
      }
    }
  },
  'pielegniarstwo-pediatryczne': {
    category: 'pielegniarstwo-pediatryczne',
    course: 'pielegniarstwo',
    requiredTier: 'basic',
    image:
      'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UEui6vIxs2k5EyuGdN4SRigYP6qreJDvtVZl',
    description:
      'Testy z pediatrii i pielęgniarstwa pediatrycznego dla studentów pielęgniarstwa. Poznaj rozwój psychomotoryczny dziecka, choroby wieku rozwojowego układu oddechowego, pokarmowego, moczowego, krążenia i nerwowego, opiekę nad noworodkiem i wcześniakiem oraz zasady szczepień ochronnych i żywienia dzieci.',
    duration: [25, 40, 60],
    popularity: 'Sprawdź swoją wiedzę już teraz!',
    status: true,
    numberOfQuestions: [10, 40],
    title: 'Pielęgniarstwo pediatryczne',
    keywords: [
      'pediatria',
      'pielęgniarstwo pediatryczne',
      'noworodek',
      'wcześniak',
      'choroby wieku rozwojowego',
      'szczepienia ochronne',
      'żywienie dzieci',
      'wady wrodzone',
      'rozwój psychomotoryczny',
      'egzamin pielęgniarski',
      'testy wiedzy',
      'pytania egzaminacyjne'
    ],
    details: {
      ects: 15,
      semester: 'Rok II, Semestr IV',
      objectives:
        'Zapoznanie studentów z najczęściej występującymi chorobami wieku rozwojowego oraz zasadami ich profilaktyki, diagnostyki i leczenia. Przekazanie wiedzy i kształtowanie umiejętności w zakresie oceny i monitorowania rozwoju psychofizycznego dzieci i młodzieży. Przygotowanie studenta do samodzielnego pielęgnowania chorych dzieci przy zapewnieniu profesjonalnej, całościowej opieki bez względu na miejsce, czas i rodzaj schorzenia. Doskonalenie umiejętności samokształcenia i samokontroli.',
      prerequisites:
        'Wiedza, umiejętności i kompetencje z przedmiotów realizujących treści podstawowe i wybrane treści kierunkowe (podstawy pielęgniarstwa, filozofia i etyka zawodu pielęgniarki, promocja zdrowia, interna i pielęgniarstwo internistyczne, chirurgia i pielęgniarstwo chirurgiczne).',
      learningOutcomes: {
        knowledge: [
          {
            code: 'D.W1',
            desc: 'Czynniki ryzyka i zagrożenia zdrowotne u pacjentów w różnym wieku.'
          },
          {
            code: 'D.W2',
            desc: 'Etiopatogeneza, objawy kliniczne, przebieg, leczenie, rokowanie i zasady opieki pielęgniarskiej nad pacjentami w wybranych chorobach.'
          },
          {
            code: 'D.W3',
            desc: 'Zasady diagnozowania i planowania opieki nad pacjentem w pielęgniarstwie pediatrycznym.'
          },
          {
            code: 'D.W4',
            desc: 'Rodzaje badań diagnostycznych i zasady ich zlecania.'
          },
          {
            code: 'D.W5',
            desc: 'Zasady przygotowania pacjenta w różnym wieku i stanie zdrowia do badań oraz zabiegów diagnostycznych, a także zasady opieki w trakcie oraz po tych badaniach i zabiegach.'
          },
          {
            code: 'D.W6',
            desc: 'Właściwości grup leków i ich działanie na układy i narządy pacjenta w różnych chorobach w zależności od wieku i stanu zdrowia, z uwzględnieniem działań niepożądanych, interakcji z innymi lekami i dróg podania.'
          },
          {
            code: 'D.W7',
            desc: 'Standardy i procedury pielęgniarskie stosowane w opiece nad pacjentem w różnym wieku i stanie zdrowia.'
          },
          {
            code: 'D.W8',
            desc: 'Reakcje pacjenta na chorobę, przyjęcie do szpitala i hospitalizację.'
          },
          {
            code: 'D.W10',
            desc: 'Zasady organizacji opieki specjalistycznej (pediatrycznej).'
          },
          {
            code: 'D.W13',
            desc: 'Patofizjologia, objawy kliniczne, przebieg, leczenie i rokowanie chorób wieku rozwojowego: układu oddechowego, układu krążenia, układu nerwowego, dróg moczowych, układu pokarmowego oraz chorób endokrynologicznych, metabolicznych, alergicznych i krwi.'
          },
          {
            code: 'D.W14',
            desc: 'Patofizjologia, objawy kliniczne chorób i stanów zagrożenia życia noworodka, w tym wcześniaka, oraz podstawy opieki pielęgniarskiej w tym zakresie.'
          },
          {
            code: 'D.W18',
            desc: 'Metody, techniki i narzędzia oceny stanu świadomości i przytomności.'
          },
          {
            code: 'D.W28',
            desc: 'Standardy i procedury postępowania w stanach nagłych i zabiegach ratujących życie.'
          },
          {
            code: 'D.W31',
            desc: 'Patofizjologia i objawy kliniczne chorób stanowiących zagrożenie dla życia (niewydolność oddechowa, niewydolność krążenia, niewydolność układu nerwowego, wstrząs, sepsa).'
          }
        ],
        skills: [
          {
            code: 'D.U1',
            desc: 'Gromadzi informacje, formułuje diagnozę pielęgniarską, ustala cele i plan opieki pielęgniarskiej, wdraża interwencje pielęgniarskie oraz dokonuje ewaluacji opieki.'
          },
          {
            code: 'D.U2',
            desc: 'Prowadzi poradnictwo w zakresie samoopieki pacjentów w różnym wieku i stanie zdrowia dotyczące wad rozwojowych, chorób i uzależnień.'
          },
          {
            code: 'D.U3',
            desc: 'Prowadzi profilaktykę powikłań występujących w przebiegu chorób.'
          },
          {
            code: 'D.U4',
            desc: 'Organizuje izolację pacjentów z chorobą zakaźną w miejscach publicznych i w warunkach domowych.'
          },
          {
            code: 'D.U5',
            desc: 'Ocenia rozwój psychofizyczny dziecka, wykonuje testy przesiewowe i wykrywa zaburzenia w rozwoju.'
          },
          {
            code: 'D.U9',
            desc: 'Doraźnie podaje pacjentowi tlen i monitoruje jego stan podczas tlenoterapii.'
          },
          {
            code: 'D.U12',
            desc: 'Przygotowuje pacjenta fizycznie i psychicznie do badań diagnostycznych.'
          },
          {
            code: 'D.U13',
            desc: 'Wystawia skierowania na wykonanie określonych badań diagnostycznych.'
          },
          {
            code: 'D.U15',
            desc: 'Dokumentuje sytuację zdrowotną pacjenta, dynamikę jej zmian i realizowaną opiekę pielęgniarską, z uwzględnieniem narzędzi informatycznych do gromadzenia danych.'
          },
          {
            code: 'D.U17',
            desc: 'Prowadzi u osób dorosłych i dzieci żywienie dojelitowe (przez zgłębnik i przetokę odżywczą) oraz żywienie pozajelitowe.'
          },
          {
            code: 'D.U18',
            desc: 'Rozpoznaje powikłania leczenia farmakologicznego, dietetycznego, rehabilitacyjnego i leczniczo-pielęgnacyjnego.'
          },
          {
            code: 'D.U20',
            desc: 'Prowadzi rozmowę terapeutyczną.'
          },
          {
            code: 'D.U22',
            desc: 'Przekazuje informacje członkom zespołu terapeutycznego o stanie zdrowia pacjenta.'
          },
          {
            code: 'D.U23',
            desc: 'Asystuje lekarzowi w trakcie badań diagnostycznych.'
          },
          {
            code: 'D.U24',
            desc: 'Ocenia poziom bólu, reakcję pacjenta na ból i jego nasilenie oraz stosuje farmakologiczne i niefarmakologiczne postępowanie przeciwbólowe.'
          },
          {
            code: 'D.U25',
            desc: 'Postępuje zgodnie z procedurą z ciałem zmarłego pacjenta.'
          },
          {
            code: 'D.U26',
            desc: 'Przygotowuje i podaje pacjentom leki różnymi drogami, samodzielnie lub na zlecenie lekarza.'
          }
        ],
        competencies: [
          {
            code: 'K.S1',
            desc: 'Kieruje się dobrem pacjenta, poszanowaniem godności i autonomii osób powierzonych opiece, okazuje zrozumienie dla różnic światopoglądowych i kulturowych oraz empatię w relacji z pacjentem i jego rodziną.'
          },
          {
            code: 'K.S2',
            desc: 'Przestrzega praw pacjenta.'
          },
          {
            code: 'K.S3',
            desc: 'Samodzielnie i rzetelnie wykonuje zawód zgodnie z zasadami etyki, w tym przestrzega wartości i powinności moralnych w opiece nad pacjentem.'
          },
          {
            code: 'K.S4',
            desc: 'Ponosi odpowiedzialność za wykonywane czynności zawodowe.'
          },
          {
            code: 'K.S5',
            desc: 'Zasięga opinii ekspertów w przypadku trudności z samodzielnym rozwiązaniem problemu.'
          },
          {
            code: 'K.S6',
            desc: 'Przewiduje i uwzględnia czynniki wpływające na reakcje własne i pacjenta.'
          },
          {
            code: 'K.S7',
            desc: 'Dostrzega i rozpoznaje własne ograniczenia w zakresie wiedzy, umiejętności i kompetencji społecznych oraz dokonuje samooceny deficytów i potrzeb edukacyjnych.'
          }
        ]
      },
      programContent: {
        lectures: [
          'Rozwój psychomotoryczny dziecka w poszczególnych okresach rozwojowych.',
          'Stany zagrażające życiu i zdrowiu wcześniaka i noworodka.',
          'Semiotyka. Badanie fizykalne w pediatrii.',
          'Schorzenia układu pokarmowego u dzieci — symptomatologia, badania diagnostyczne, biegunki infekcyjne ostre i przewlekłe, zaburzenia trawienia i wchłaniania (choroba glutenowa, alergie pokarmowe, mukowiscydoza), choroba refluksowa przełyku, choroby wątroby i trzustki.',
          'Alergie pokarmowe u dzieci.',
          'Najczęstsze wady wrodzone: wady cewy nerwowej i twarzoczaszki. Wady wrodzone układu pokarmowego — atrezja odbytu, zarośnięcie odcinków przewodu pokarmowego, przetoki przełykowo-oskrzelowe, zwężenie odźwiernika.',
          'Schorzenia układu oddechowego w pediatrii — symptomatologia, metody diagnostyki, infekcje górnych dróg oddechowych, zapalenie płuc i oskrzeli, alergie oddechowe, astma oskrzelowa, RDS.',
          'Schorzenia układu moczowego u dzieci — odrębności funkcjonowania, symptomatologia w zależności od wieku, wady wrodzone, refluks pęcherzowo-moczowy, infekcje układu moczowego, kłębuszkowe zapalenie nerek, zespół nerczycowy, przewlekła niewydolność nerek i leczenie nerkozastępcze.',
          'Choroby układu nerwowego u dzieci (porażenie mózgowe, zapalenie opon mózgowo-rdzeniowych).',
          'Schorzenia układu krążenia u dzieci — symptomatologia i badania diagnostyczne w zależności od wieku, rytm serca i ciśnienie tętnicze w okresie rozwojowym, wady wrodzone serca, niewydolność krążenia, zaburzenia rytmu i przewodnictwa.',
          'Wybrane choroby zakaźne wieku dziecięcego (odra, ospa wietrzna, różyczka, błonica).',
          'Choroby pasożytnicze przewodu pokarmowego u dzieci — charakterystyka pasożytów, sposoby zakażenia, objawy, leczenie farmakologiczne i profilaktyka.',
          'Schorzenia ortopedyczne u dzieci.',
          'Choroby nowotworowe układu krwiotwórczego u dzieci. Najczęściej występujące choroby nowotworowe u dzieci.'
        ],
        seminars: [
          'Hospitalizacja jako sytuacja trudna. Reakcja dzieci i rodziców na fakt hospitalizacji. Zadania pielęgniarki.',
          'Pielęgnowanie noworodka i wcześniaka (testy przesiewowe, żółtaczka fizjologiczna i przedłużająca się, zaburzenia oddychania).',
          'Profilaktyka zakażeń w oddziałach pediatrycznych.',
          'Żywienie dzieci zdrowych i chorych. Schemat sztucznego karmienia niemowląt i małych dzieci. Diety eliminacyjne i suplementacyjne. Schorzenia związane z niedoborami pokarmowymi — anemia niedoborowa, krzywica.',
          'Przygotowanie dziecka do zabiegu operacyjnego. Opieka pielęgniarska przed zabiegiem i po nim.',
          'Pielęgnowanie dziecka w chorobach układu oddechowego. Drenaż ułożeniowy. Standard postępowania pielęgnacyjnego.',
          'Problemy pielęgnacyjne i sposoby ich rozwiązywania u dzieci z chorobami alergicznymi. Standard opieki nad dzieckiem z astmą oskrzelową.',
          'Problemy pielęgnacyjne dzieci z chorobami układu nerwowego (porażenie mózgowe, zapalenie opon mózgowo-rdzeniowych).',
          'Planowanie i realizacja opieki nad dzieckiem z chorobą układu pokarmowego.',
          'Problemy pielęgnacyjne dzieci z chorobą układu krążenia i krwi (choroba Henocha-Schönleina, anemia z niedoboru żelaza, anemia sierpowata).',
          'Problemy pielęgnacyjne dzieci w chorobach zakaźnych wieku dziecięcego (odra, ospa wietrzna, różyczka, błonica).',
          'Planowanie i realizacja opieki pielęgniarskiej u dzieci z zaburzeniami metabolicznymi.',
          'Mukowiscydoza — planowanie opieki pielęgniarskiej.',
          'Postępowanie i pielęgnacja dzieci w najczęstszych schorzeniach ortopedycznych.',
          'Planowanie opieki pielęgniarskiej wobec małego pacjenta i jego rodziny w przypadku wady wrodzonej. Poradnictwo genetyczne.',
          'Problemy pielęgnacyjne dzieci i rodziców w przypadku choroby nowotworowej układu krwiotwórczego.',
          'Pielęgnowanie dzieci z chorobami pasożytniczymi przewodu pokarmowego.',
          'Kształtowanie się pojęcia śmierci u dzieci. Opieka terminalna.',
          'Rola i zadania pielęgniarki w uodpornieniu populacji — szczepienia ochronne obowiązkowe według kalendarza i zalecane.',
          'Dziecko maltretowane. SIDS. Urazowość. Uzależnienia u dzieci.'
        ],
        selfStudy: [
          'Padaczka u dzieci — postępowanie i pielęgnacja.',
          'Planowanie opieki pielęgniarskiej w zaburzeniach neurologicznych u dzieci.',
          'Pielęgnowanie dziecka ze zmianami na skórze i błonach śluzowych.',
          'Wirus nabytego niedoboru odporności u dzieci — planowanie opieki pielęgniarskiej.',
          'Zespół nadpobudliwości psychoruchowej i zaburzeń koncentracji uwagi u dzieci.',
          'Najczęstsze problemy psychospołeczne wieku dziecięcego. Fobie i samobójstwa.'
        ]
      }
    }
  }
}
