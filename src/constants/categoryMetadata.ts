import { CategoryMetadata } from "@/types/categoryType";

export const DEFAULT_CATEGORY_METADATA: CategoryMetadata = {
  category: '',
  course: '',
  requiredTier: 'free',
  image: 'https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5KkQtwIbr79T0mSRj6eAJqPf4kEid2ncgM5Nu',
  description: 'Twoja własna kategoria testów',
  duration: [25, 40, 60],
  popularity: 'Kategoria niestandardowa',
  status: true,
  numberOfQuestions: [10, 40]
};

export const CATEGORY_METADATA: Record<string, CategoryMetadata> = {
  "opiekun-medyczny": {
    category: "opiekun-medyczny",
    course: "opiekun-medyczny",
    requiredTier: "basic",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5hAALGCKaPSlWXcFVLft4M8kAgI2ECx19u7JN",
    description: "Przygotuj się do egzaminu Opiekuna Medycznego z naszymi kompleksowymi testami i pytaniami. Bogata baza pytań, która pomoże Ci w 100% przygotować sie do egzaminu państwowego i zdać za pierwszym razem!",
    duration: [25, 40, 60],
    popularity: "Bardzo popularny",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Egzamin - Opiekun Medyczny",
    keywords: ["opiekun", "med-14", "egzamin", "testy", "pytania", "zagadnienia", "medyczno-pielęgnacyjnych", "opiekuńczych", "baza"],
  },
  "anatomia": {
    category: "anatomia",
    course: "pielegniarstwo",
    requiredTier: "basic",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k52G1vt6SEBiUD8sVXHObYqkj3TNfo4PKMGg6J",
    description: "Kompleksowe testy z anatomii dla studentów pielęgniarstwa. Poznaj budowę ciała ludzkiego, układy narządowe, struktury anatomiczne i ich funkcje. Idealne przygotowanie do egzaminów i praktyki zawodowej.",
    duration: [25, 40, 60],
    popularity: "Sprawdź swoją wiedzę już teraz!",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Anatomia",
    keywords: ["anatomia", "pielęgniarstwo", "budowa ciała", "układy narządowe", "struktura anatomiczna", "kości", "mięśnie", "narządy", "egzamin pielęgniarski", "testy wiedzy", "pytania egzaminacyjne"],
    details: {
      ects: 4,
      semester: "Rok I, Semestr I",
      objectives: "Głównym celem kursu anatomii jest zapoznanie studentów z budową ciała ludzkiego oraz wzajemnymi relacjami poszczególnych jego części z nawiązaniem do aspektów klinicznych.",
      prerequisites: "Podstawowe wiadomości z zakresu biologii, obejmujące podstawy nauki o człowieku.",
      learningOutcomes: {
        knowledge: [
          { code: "AN.W.1", desc: "Omawia budowę ciała ludzkiego w podejściu topograficznym (kończyny górna i dolna, klatka piersiowa, brzuch, miednica, grzbiet, szyja, głowa) i czynnościowym (układ kostno-stawowy, układ mięśniowy, układ krążenia, układ oddechowy, układ pokarmowy, układ moczowy, układy płciowe, układ nerwowy, narządy zmysłów, powłoka wspólna)." }
        ],
        skills: [
          { code: "AN.U.1", desc: "Posługuje się w praktyce mianownictwem anatomicznym oraz wykorzystuje znajomość topografii narządów ciała ludzkiego." }
        ]
      },
      programContent: {
        lectures: [
          "Narządy i układy, części ciała i okolice, jamy ciała",
          "Budowa narządu ruchu (kości, mięśnie, stawy)",
          "Układ krążenia: budowa serca, podział i budowa naczyń krwionośnych, krążenie małe i duże, budowa śledziony",
          "Układ chłonny: naczynia chłonne, węzły chłonne, chłonka i jej krążenie",
          "Układ oddechowy: budowa nosa, krtani, tchawicy i oskrzeli, płuc i opłucnej",
          "Układ trawienny: budowa jamy ustnej, gardzieli i gardła, przełyku, żołądka, jelita cienkiego, jelita grubego, wątroby, trzustki",
          "Układ moczowo-płciowy: budowa nerek, moczowodów, pęcherza moczowego, cewki moczowej, budowa narządów płciowych męskich i żeńskich",
          "Gruczoły dokrewne: budowa gruczołu tarczowego, gruczołów przytarczycznych, części wewnątrzwydzielniczej trzustki, grasicy",
          "Układ nerwowy: budowa układu ośrodkowego, obwodowego i autonomicznego",
          "Receptory i narządy zmysłów",
          "Powłoka wspólna"
        ],
        seminars: [
          "Kości szkieletu osiowego i kończyn. Czaszka. Ogólna budowa mięśni i ich narządów pomocniczych. Układ mięśniowy",
          "Podział układu nerwowego. Morfologia centralnego układu nerwowego. Ośrodki i drogi nerwowe",
          "Narządy zmysłów. Układ wewnątrzwydzielniczy",
          "Układ autonomiczny. Nerwy rdzeniowe",
          "Nerwy czaszkowe",
          "Jama nosowa, gardło i krtań. Układ oddechowy",
          "Jama ustna, ślinianki i przełyk. Układ trawienny. Otrzewna",
          "Nerka. Układ moczowy. Układ płciowy męski",
          "Układ płciowy żeński. Dno miednicy",
          "Budowa ogólna i podział układu krążenia. Serce. Krążenie małe. Tętnice krążenia dużego. Żyły. Krążenie płodowe. Układ chłonny",
          "Anatomia topograficzna"
        ],
        selfStudy: [
          "Zaburzenia rozwojowe układów i narządów",
          "Zmiany w strukturach anatomicznych poszczególnych układów i narządów występujące w wieku podeszłym (układ kostny, układ oddechowy, układ krążenia, układ nerwowy, układ moczowy, narządy zmysłów)",
          "Zmiany w strukturach anatomicznych układów i narządów w przebiegu wybranych procesów patologicznych (np. cukrzycy, miażdżycy, choroby alkoholowej)",
          "Biomechanika stawów kręgosłupa, głowy, kończyn",
          "Wady wrodzone układu nerwowego",
          "Anomalie układu naczyń, malformacje tętniczo-żylne, tętniaki, naczyniaki",
          "Choroby związane z zaburzeniami czynności układu wewnątrzwydzielniczego (tarczycy, przytarczyc, przysadki mózgowej, nadnerczy, części wewnątrzwydzielniczej trzustki)",
          "Anatomia radiologiczna układów i narządów, metody obrazowania (rtg, tomografia komputerowa, rezonans magnetyczny, ultrasonografia, angiografia)"
        ]
      }
    }
  },
   "fizjologia": {
    category: "fizjologia",
    course: "pielegniarstwo",
    requiredTier: "basic",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UN2L0ZIxs2k5EyuGdN4SRigYP6qreJDvtVZl",
    description: "Kompleksowe testy z fizjologii dla studentów pielęgniarstwa, obejmujące wszystkie istotne zagadnienia wymagane na egzaminach i w codziennej praktyce zawodowej. Sprawdź swoją wiedzę z układów organizmu, procesów fizjologicznych i funkcji życiowych.",
    duration: [25, 40, 60],
    popularity: "Sprawdź swoją wiedzę już teraz!",
    status: true,
    numberOfQuestions: [10,40],
    title: "Fizjologia",
    keywords: ["fizjologia", "pielęgniarstwo", "układ krążenia", "układ oddechowy", "zdrowie", "opieka", "egzamin pielęgniarski", "testy wiedzy", "pytania egzaminacyjne"],
    details: {
      ects: 3,
      semester: "Rok I, Semestr I",
      objectives: "Wyposażenie studentów w wiedzę o funkcjonowaniu poszczególnych układów fizjologicznych: nerwowego, hormonalnego, krwionośnego, mięśniowego, oddechowego, trawiennego i moczowego organizmu człowieka. Zdobyte na zajęciach z fizjologii wiadomości i praktyczne umiejętności, stanowiące podstawę dla patofizjologii, winny pozwolić studentom samodzielnie wykonywać podstawowe pomiary parametrów fizjologicznych.",
      prerequisites: "Podstawy anatomii człowieka. Znajomość podstawowych procesów biochemicznych oraz związków chemicznych (węglowodany, białka, tłuszcze). Wiedza z biologii i chemii realizowana w zakresie szkoły średniej.",
      learningOutcomes: {
        knowledge: [
          { code: "F.W.2", desc: "Zna neurohormonalną regulację procesów fizjologicznych i elektrofizjologicznych zachodzących w organizmie." },
          { code: "F.W.3", desc: "Zna udział układów i narządów organizmu w utrzymaniu jego homeostazy." },
          { code: "F.W.4", desc: "Zna fizjologię poszczególnych układów i narządów organizmu." },
          { code: "F.W.5", desc: "Zna podstawy działania układów regulacji (homeostaza) oraz rolę sprzężenia zwrotnego dodatniego i ujemnego." }
        ],
        skills: []
      },
      programContent: {
        lectures: [
          "Neurofizjologia: Centralny system nerwowy",
          "Autonomiczny układ nerwowy i jego funkcja. Obwodowy układ nerwowy",
          "Fizjologia mięśni: typy tkanek mięśniowych, budowa mięśnia szkieletowego i mechanizm skurczu mięśnia, energetyka pracy mięśniowej",
          "Fizjologia krwi: Funkcje krwi. Skład krwi (skład osocza i podział elementów morfotycznych)"
        ],
        seminars: [
          "Badanie odruchów człowieka",
          "Zmęczenie mięśni (przyczyny, objawy)",
          "Rodzaje skurczów mięśniowych",
          "Określanie grup krwi",
          "Zmiany liczby hematokrytowej (odwodnienie, anemia)",
          "Badanie parametrów układu krążenia (tętno, objętość wyrzutowa serca, pojemność minutowa serca). Pomiar ciśnienia krwi, EKG",
          "Zmiany parametrów układu krążenia w czasie wysiłku. Próby czynnościowe układu krążenia (próby ortostatyczne)",
          "Próby czynnościowe układu oddechowego - spirometria"
        ],
        selfStudy: [
          "Regulacja napięcia mięśniowego. Zaburzenia napięcia mięśniowego",
          "Podstawy immunologii. Rola chłonki",
          "Erytropoeza, erytropoetyna",
          "Regulacja równowagi kwasowo-zasadowej i wodno-elektrolitowej",
          "Narządy zmysłów i ich fizjologia",
          "Różnice w poziomie wskaźników fizjologicznych pomiędzy dorosłymi a dziećmi"
        ]
      }
    }
  },
  "biochemia-biofizyka": {
    category: "biochemia-biofizyka",
    course: "pielegniarstwo",
    requiredTier: "basic",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5bHmZPN10lAXCNeHTtQdjmyVvPInzGfZrLsw9",
    description: "Testy z biochemii i biofizyki dla studentów pielęgniarstwa. Opanuj procesy biochemiczne w organizmie, metabolizm, białka, węglowodany, lipidy oraz podstawy biofizyki. Przygotuj się kompleksowo do egzaminu.",
    duration: [25, 40, 60],
    popularity: "Sprawdź swoją wiedzę już teraz!",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Biochemia z Biofizyką",
    keywords: ["biochemia", "biofizyka", "pielęgniarstwo", "metabolizm", "białka", "enzymy", "homeostaza", "procesy biochemiczne", "egzamin pielęgniarski", "testy wiedzy", "pytania egzaminacyjne"],
    details: {
      ects: 2,
      semester: "Rok I, Semestr I",
      objectives: "W sposób zwięzły zapoznać studentów z podstawowymi procesami biochemicznymi związanymi z życiem komórki oraz przedstawić interpretację wybranych zjawisk życiowych w oparciu o metodologię nauk fizycznych. Dostarczyć podstaw do studiowania innych zagadnień związanych z medycyną i pielęgniarstwem takich jak: genetyka, fizjologia, patofizjologia, farmakologia.",
      prerequisites: "Chemia, biologia, fizyka i matematyka w zakresie szkoły średniej.",
      learningOutcomes: {
        knowledge: [
          { code: "BB.W.13", desc: "Biofizyka: podstawy fizykochemiczne działania zmysłów wykorzystujących fizyczne nośniki informacji (fale dźwiękowe i elektromagnetyczne)." },
          { code: "BB.W.14", desc: "Biochemia: witaminy, aminokwasy, nukleozydy, monosacharydy, kwasy karboksylowe i ich pochodne, wchodzące w skład makrocząsteczek obecnych w komórkach, macierzy zewnątrzkomórkowej i płynach ustrojowych." },
          { code: "BB.W.15", desc: "Biofizyka: mechanizmy regulacji i biofizyczne podstawy funkcjonowania metabolizmu w organizmie." },
          { code: "BB.W.16", desc: "Biofizyka: wpływ na organizm czynników zewnętrznych, takich jak temperatura, grawitacja, ciśnienie, pole elektromagnetyczne oraz promieniowanie jonizujące." }
        ],
        skills: [
          { code: "BB.U.5", desc: "Potrafi współuczestniczyć w doborze metod diagnostycznych w poszczególnych stanach klinicznych z wykorzystaniem wiedzy z zakresu biochemii i biofizyki." }
        ]
      },
      programContent: {
        lectures: [
          "Rola witamin i minerałów w organizmie. Różnicowanie. Choroby wynikające z niedoboru",
          "Budowa i znaczenie biomedyczne aminokwasów, nukleozydów, monosacharydów i kwasów karboksylowych. Ich udział w budowie makrocząsteczek oraz procesach metabolicznych",
          "Podstawy fizykochemiczne funkcjonowania narządów zmysłów oraz fizyczne nośniki informacji (węch, smak i dotyk)",
          "Podstawy fizykochemiczne funkcjonowania narządów zmysłów oraz fizyczne nośniki informacji (wzrok i słuch)"
        ],
        seminars: [
          "Czynniki fizyczne wpływające na organizm człowieka, mechanizm działania, wykorzystanie w diagnostyce i terapii (temperatura, grawitacja, ciśnienie, pole elektromagnetyczne oraz promieniowanie jonizujące)",
          "Biofizyczne ujęcie metod obrazowania tkanek i narządów"
        ],
        selfStudy: [
          "Studiowanie literatury przedmiotu",
          "Bloki metaboliczne w przemianach aminokwasów. Choroby związane z tym zaburzeniem",
          "Biochemia gospodarki węglowodanowej i lipidowej. Zaburzenia. Choroby",
          "Biochemia mięśni",
          "Prawa rządzące przepływem cieczy w naczyniach w ujęciu biofizyki. Ciśnienie tętnicze i żylne w naczyniach krwionośnych człowieka",
          "Prąd elektryczny i jego charakterystyka, zastosowanie w medycynie"
        ]
      }
    }
  },
  "socjologia": {
    category: "socjologia",
    course: "pielegniarstwo",
    requiredTier: "basic",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5nt6oObL9GQYxNri4Uw0MejlVEP63mgKp18FO",
    description: "Testy z socjologii dla studentów pielęgniarstwa. Poznaj struktury społeczne, role zawodowe w ochronie zdrowia, komunikację interpersonalną oraz socjologiczne aspekty pracy z pacjentem. Przygotuj się do egzaminu z nauk społecznych.",
    duration: [25, 40, 60],
    popularity: "Sprawdź swoją wiedzę już teraz!",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Socjologia",
    keywords: ["socjologia", "pielęgniarstwo", "struktury społeczne", "komunikacja", "relacje interpersonalne", "pacjent", "opieka zdrowotna", "role społeczne", "egzamin pielęgniarski", "testy wiedzy", "pytania egzaminacyjne"],
    details: {
      ects: 1,
      semester: "Rok I, Semestr I",
      objectives: "Celem zajęć jest przekazanie studentowi elementarnej wiedzy na temat struktury i funkcjonowania społeczeństwa. Treści przekazane na zajęciach umożliwią studentowi zrozumienie zjawisk i procesów zachodzących w życiu społecznym w powiązaniu z problematyką zdrowia, choroby. Ważnym zamierzeniem jest wykształcenie w studentach wrażliwości na życie społeczne.",
      prerequisites: "Brak",
      learningOutcomes: {
        knowledge: [
          { code: "S.W.7", desc: "Pojęcia oraz zasady funkcjonowania grupy, organizacji, instytucji, populacji, społeczności i ekosystemu." },
          { code: "S.W.8", desc: "Wybrane obszary odrębności kulturowych i religijnych." },
          { code: "S.W.9", desc: "Zakres interakcji społecznej i proces socjalizacji oraz działanie lokalnych społeczności i ekosystemu." },
          { code: "S.W.10", desc: "Pojęcia dewiacji i zaburzenia, ze szczególnym uwzględnieniem patologii dziecięcej." },
          { code: "S.W.11", desc: "Zjawisko dyskryminacji społecznej, kulturowej, etnicznej oraz ze względu na płeć." },
          { code: "S.W.12", desc: "Podstawowe pojęcia i zagadnienia z zakresu pedagogiki jako nauki stosowanej i procesu wychowania w aspekcie zjawiska społecznego (chorowania, zdrowienia, hospitalizacji, umierania)." }
        ],
        skills: [
          { code: "S.U.9", desc: "Proponować działania zapobiegające dyskryminacji i rasizmowi oraz dewiacjom i patologiom wśród dzieci i młodzieży." }
        ]
      },
      programContent: {
        lectures: [
          "Podstawowe teorie socjologiczne wykorzystywane do wyjaśnienia wpływu uwarunkowań społecznych na stan zdrowia i relacje z pacjentem.",
          "Kulturowe podstawy życia społecznego. Socjo-kulturowe uwarunkowania zachowań, stylu życia a stan zdrowia.",
          "Pojęcie grupy społecznej, klasyfikacja grup, grupy odniesienia. Interakcje społeczne, proces socjalizacji a kształtowanie osobowości.",
          "Pojęcie zdrowia i choroby w wymiarze psycho-społecznym. Problematyka dewiacji w socjologii. Przyczyna i typologia dewiacji.",
          "Stratyfikacja społeczna. Zróżnicowanie i nierówności społeczne a stan zdrowia.",
          "Wsparcie społeczne. Rodzaje i systemy wsparcia na różnych poziomach życia społecznego. Stres społeczny a zmiany w stanie zdrowia.",
          "Psychospołeczne konsekwencje choroby i niepełnosprawności. Teoria naznaczenia społecznego a sytuacja osób chorych, niepełnosprawnych, starszych wiekiem.",
          "Rodzina jako grupa i instytucja społeczna. Strukturalne, funkcjonalne oraz rozwojowe ujęcie rodziny. Wpływ rodziny na stan zdrowia. Występowanie choroby przewlekłej, niepełnosprawności a funkcjonowanie rodziny.",
          "Społeczno-kulturowe wyznaczniki roli zawodowej pielęgniarki. Proces socjalizacji do roli zawodowej a społeczna definicja roli. Przystosowanie zawodowe, mechanizmy społeczne warunkujące satysfakcje z roli zawodowej, stres zawodowy, wypalenie zawodowe.",
          "Pojęcie instytucji. Szpital jako instytucja i jako organizacja formalna mającą wpływ na psychospołeczne funkcjonowanie pacjenta, pracownika."
        ],
        seminars: [],
        selfStudy: [
          "Analiza literatury na zadany przez prowadzącego temat."
        ]
      }
    }
  },
  "mikrobiologia-parazytologia": {
    category: "mikrobiologia-parazytologia",
    course: "pielegniarstwo",
    requiredTier: "premium",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5QNXUuJYf6PZ5eKuhFM9REHkAy4n7s3aNYmWi",
    description: "Zaawansowane testy z mikrobiologii i parazytologii dla studentów pielęgniarstwa. Poznaj bakterie, wirusy, grzyby, pasożyty oraz mechanizmy zakażeń. Niezbędna wiedza do pracy w ochronie zdrowia.",
    duration: [25, 40, 60],
    popularity: "Treść Premium!",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Mikrobiologia z Parazytologią",
    keywords: ["mikrobiologia", "parazytologia", "bakterie", "wirusy", "grzyby", "pasożyty", "zakażenia", "patogeny", "egzamin pielęgniarski", "testy premium"],
    details: {
      ects: 2,
      semester: "Rok I, Semestr I",
      objectives: "1. Wprowadzenie w tematykę obejmującą podstawy mikrobiologii ogólnej oraz podstawy parazytologii.\n2. Przedstawienie klasyfikacji drobnoustrojów z uwzględnieniem podziału na drobnoustroje chorobotwórcze i występujące we florze fizjologicznej.\n3. Zwrócenie uwagi na problematykę związaną z zakażeniami szpitalnymi, ze sterylizacją, dezynfekcją, antyseptyką.\n4. Zapoznanie z budową i cyklami rozwojowymi pasożytów najczęściej spotykanych u człowieka oraz odpowiadających im objawów parazytoz.",
      prerequisites: "Biologia",
      learningOutcomes: {
        knowledge: [
          { code: "MP.W.17", desc: "Klasyfikacja drobnoustrojów z uwzględnieniem mikroorganizmów chorobotwórczych i obecnych w mikrobiocie fizjologicznej człowieka." },
          { code: "MP.W.18", desc: "Podstawowe pojęcia z zakresu mikrobiologii i parazytologii oraz metody stosowane w diagnostyce mikrobiologicznej." }
        ],
        skills: [
          { code: "MP.U.6", desc: "Rozpoznawać najczęściej spotykane pasożyty człowieka na podstawie ich budowy, cykli życiowych oraz wywoływanych przez nie objawów chorobowych." }
        ]
      },
      programContent: {
        lectures: [
          "Podstawy klasyfikacji, morfologii, fizjologii oraz genetyki drobnoustrojów (bakterii, wirusów, grzybów, pierwotniaków).",
          "Przegląd drobnoustrojów chorobotwórczych dla człowieka, epidemiologia zakażeń, zakażenia szpitalne.",
          "Flora fizjologiczna i zakażenia oportunistyczne.",
          "Podstawowe pojęcia z ekologii i parazytologii.",
          "Pasożyty najczęściej występujące u człowieka, ich morfologia i cykle rozwojowe.",
          "Parazytozy – profilaktyka, diagnostyka i leczenie.",
          "Przegląd mikrobiologii lekarskiej – ziarniaki Gram(+), ziarniaki Gram(-), pałeczki Gram(-), prątki, laseczki, maczugowce, wirusy, grzyby i promieniowce.",
          "Chorobotwórczość, drogi szerzenia się zarazków w ustroju, zagrożenia chorobami zakaźnymi w Polsce i na świecie, profilaktyka chorób zakaźnych."
        ],
        seminars: [
          "Postępowanie aseptyczne i antyseptyczne w pracy pielęgnacyjno-leczniczej, pobieranie i przesyłanie materiałów do badań mikrobiologicznych.",
          "Ogólne zasady pracy z drobnoustrojami, metody posiewu i hodowli drobnoustrojów, oznaczanie wrażliwości bakterii na antybiotyki i chemioterapeutyki.",
          "Biologiczne czynniki chorobotwórcze.",
          "Mikroorganizmy wywołujące zomr - neisseria meningitidis.",
          "Drobnoustroje chorobotwórcze wywołujące zakażenia przewodu pokarmowego, bioterroryzm, czynniki chorobotwórcze wykorzystywane jako broń biologiczna.",
          "Pasożyty najczęściej występujące u człowieka, nomenklatura, rozpoznawanie.",
          "Epidemiologia parazytoz kosmopolitycznych i tropikalnych. Metody diagnostyczne."
        ],
        selfStudy: [
          "Choroby prionowe.",
          "Sepsa, posocznica.",
          "Zasady racjonalnej antybiotykoterapii w szpitalu.",
          "Zewnątrzkomórkowe struktury bakteryjne: otoczki, fimbrie, rzęski, przetrwalniki.",
          "Czynniki chorobotwórczości mikroorganizmów.",
          "Profilaktyka i epidemiologia parazytoz.",
          "Profilaktyka chorób zakaźnych.",
          "Drobnoustroje wykorzystywane w medycynie (inżynieria genetyczna)."
        ]
      }
    }
  },
  "psychologia": {
    category: "psychologia",
    course: "pielegniarstwo",
    requiredTier: "premium",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5kbdfnVA5zS3pZrqLGeEj7tHO6cdWvCYm4N2R",
    description: "Testy z psychologii dla przyszłych pielęgniarek. Opanuj psychologię kliniczną, komunikację z pacjentem, wsparcie emocjonalne, mechanizmy obronne oraz psychologiczne aspekty choroby i leczenia.",
    duration: [25, 40, 60],
    popularity: "Treść Premium!",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Psychologia",
    keywords: ["psychologia", "pielęgniarstwo", "psychologia kliniczna", "komunikacja z pacjentem", "wsparcie emocjonalne", "choroba", "pacjent", "testy premium"],
    details: {
      ects: 3,
      semester: "Rok I, Semestr I",
      objectives: "Zapoznanie studentów z pojęciami, podstawowymi mechanizmami zachowań człowieka i uwarunkowaniami jego prawidłowego i zaburzonego funkcjonowania. Zaprezentowanie studentom podstawowej wiedzy z zakresu procesów komunikacyjnych, rozpoznawanie i rozwiązywanie konfliktów. Zdobycie umiejętności współpracy w zespole terapeutycznym i leczącym, umiejętności korzystania z diagnozy psychologicznej. Uwrażliwienie studentów na potrzeby drugiej osoby, ze szczególnym uwzględnieniem osoby chorej i niepełnosprawnej. Zapoznanie z podstawowymi technikami obniżania napięcia emocjonalnego, radzenie sobie z wypaleniem zawodowym.",
      prerequisites: "Podstawowa wiedza z zakresu budowy i funkcjonowania układu nerwowego człowieka.",
      learningOutcomes: {
        knowledge: [
          { code: "P.W.1", desc: "Psychologiczne podstawy rozwoju człowieka, jego zachowania prawidłowe i zaburzone." },
          { code: "P.W.2", desc: "Problematykę relacji człowiek – środowisko społeczne i mechanizmy funkcjonowania człowieka w sytuacjach trudnych." },
          { code: "P.W.3", desc: "Etapy rozwoju psychicznego człowieka i występujące na tych etapach prawidłowości." },
          { code: "P.W.4", desc: "Pojęcie emocji i motywacji oraz zaburzenia osobowościowe." },
          { code: "P.W.5", desc: "Istotę, strukturę i zjawiska zachodzące w procesie przekazywania i wymiany informacji oraz modele i style komunikacji interpersonalnej." },
          { code: "P.W.6", desc: "Techniki redukowania lęku, metody relaksacji oraz mechanizmy powstawania i zapobiegania zespołowi wypalenia zawodowego." }
        ],
        skills: [
          { code: "P.U.1", desc: "Rozpoznawać zachowania prawidłowe, zaburzone i patologiczne." },
          { code: "P.U.2", desc: "Oceniać wpływ choroby i hospitalizacji na stan fizyczny i psychiczny człowieka." },
          { code: "P.U.3", desc: "Oceniać funkcjonowanie człowieka w sytuacjach trudnych (stres, frustracja, konflikt, trauma, żałoba) oraz przedstawiać elementarne formy pomocy psychologicznej." },
          { code: "P.U.4", desc: "Identyfikować błędy i bariery w procesie komunikowania się." },
          { code: "P.U.5", desc: "Wykorzystywać techniki komunikacji werbalnej i pozawerbalnej w opiece pielęgniarskiej." },
          { code: "P.U.6", desc: "Tworzyć warunki do prawidłowej komunikacji z pacjentem i członkami zespołu opieki." },
          { code: "P.U.7", desc: "Wskazywać i stosować właściwe techniki redukowania lęku i metody relaksacyjne." },
          { code: "P.U.8", desc: "Stosować mechanizmy zapobiegania zespołowi wypalenia zawodowego." }
        ]
      },
      programContent: {
        lectures: [
          "Psychologia jako nauka o człowieku.",
          "Zachowanie człowieka i jego determinanty.",
          "Biologiczne mechanizmy zachowań.",
          "Mózgowe mechanizmy zachowań.",
          "Rozwój psychiki jednostki.",
          "Osobowość jako system regulacji i samoregulacji człowieka.",
          "Pojecie zdrowia psychicznego, zaburzenia w zachowaniu a zdrowie psychiczne.",
          "Zachowanie człowieka w sytuacjach trudnych i konfliktowych, mechanizmy obronne stosowane przez człowieka.",
          "Choroba, niepełnosprawność, odmienna orientacja seksualna jako sytuacje trudne.",
          "Pomoc psychologiczna w chorobie.",
          "Komunikacja międzyludzka."
        ],
        seminars: [
          "Emocje i motywacja jako procesy wpływające na zachowanie się człowieka.",
          "Wpływ stresu na zachowanie człowieka.",
          "Osobowość jako system regulacji zachowania, rozwój osobowości i kontaktów społecznych.",
          "Rozwój psychoruchowy człowieka/modele, zaburzenia.",
          "Zaburzenia rozwoju emocjonalnego/etiologia, metody terapii.",
          "Specyfika rozwoju psychicznego osób niepełnosprawnych.",
          "Funkcjonowanie człowieka jako istoty społecznej, kształtowanie się postaw i norm moralnych.",
          "Podstawy teorii konfliktu i metod jego rozwiązywania, rozwijanie umiejętności aktywnego słuchania."
        ],
        selfStudy: [
          "Charakterystyka wybranych jednostek chorobowych.",
          "Konsekwencje psychologiczne i społeczne dla jednostki."
        ]
      }
    }
  },
  "pedagogika": {
    category: "pedagogika",
    course: "pielegniarstwo",
    requiredTier: "premium",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5bp3ERm10lAXCNeHTtQdjmyVvPInzGfZrLsw9",
    description: "Testy z pedagogiki dla studentów pielęgniarstwa. Edukacja zdrowotna pacjentów, metody nauczania, promocja samoopieki oraz pedagogiczne aspekty pracy z różnymi grupami wiekowymi.",
    duration: [25, 40, 60],
    popularity: "Treść Premium!",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Pedagogika",
    keywords: ["pedagogika", "pielęgniarstwo", "edukacja zdrowotna", "nauczanie pacjentów", "promocja zdrowia", "metody dydaktyczne", "testy premium"],
    details: {
      ects: 2,
      semester: "Rok I, Semestr I",
      objectives: "Uzyskanie wiedzy pedagogicznej przydatnej w codziennej pracy z pacjentem, umożliwiającej skuteczną pracę wspierającą jego rozwój. Zrozumienie istoty spotkania wychowawczego – niepowtarzalnego wydarzenia.",
      prerequisites: "Brak",
      learningOutcomes: {
        knowledge: [
          { code: "PE.W.13", desc: "Problematykę procesu kształcenia w ujęciu edukacji zdrowotnej." },
          { code: "PE.W.14", desc: "Metodykę edukacji zdrowotnej dzieci, młodzieży i dorosłych." }
        ],
        skills: [
          { code: "PE.U.10", desc: "Rozpoznawać potrzeby edukacyjne w grupach odbiorców usług pielęgniarskich." },
          { code: "PE.U.11", desc: "Analizować programy edukacyjne w zakresie działań prozdrowotnych dla różnych grup odbiorców." }
        ]
      },
      programContent: {
        lectures: [
          "Pedagogika jako dyscyplina nauk o wychowaniu.",
          "Zależność pedagogiki od innych dziedzin wiedzy.",
          "Przedmiot badań pedagogiki, jej źródła i tożsamość.",
          "Działy pedagogiki.",
          "Metodologia badań pedagogicznych.",
          "Teoria kształcenia zawodowego.",
          "Pielęgniarstwo a pedagogika."
        ],
        seminars: [
          "Relacje pomiędzy pielęgniarstwem, a pedagogiką.",
          "Korzystanie z dorobku naukowego pedagogiki w pielęgniarstwie.",
          "Zadania pedagogiczne w działalności zawodowej pielęgniarki.",
          "Rola i zadania pielęgniarki w edukacji zdrowotnej pacjenta.",
          "Dydaktyka pielęgniarstwa – zadania, formy organizacyjne i metody kształcenia pielęgniarek."
        ],
        selfStudy: [
          "Systemy (doktryny) pedagogiczne i sposoby ich klasyfikacji.",
          "Szkoła tradycyjna - założenia i jej przedstawiciele.",
          "Szkoła progresywistyczna – założenia i jej przedstawiciele.",
          "Nowe Wychowanie – założenia i jej przedstawiciele.",
          "Pedagogika funkcjonalna.",
          "Pedagogika humanistyczna.",
          "Pedagogika personalistyczna."
        ]
      }
    }
  },
  "zdrowie-publiczne": {
    category: "zdrowie-publiczne",
    course: "pielegniarstwo",
    requiredTier: "premium",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k54pC04HH9lLqODmv7er0SPRQB8C9VnfbTHisc",
    description: "Testy ze zdrowia publicznego dla pielęgniarstwa. Epidemiologia, profilaktyka, polityka zdrowotna, statystyka medyczna oraz organizacja systemu ochrony zdrowia w Polsce.",
    duration: [25, 40, 60],
    popularity: "Treść Premium!",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Zdrowie Publiczne",
    keywords: ["zdrowie publiczne", "epidemiologia", "profilaktyka", "polityka zdrowotna", "statystyka medyczna", "ochrona zdrowia", "pielęgniarstwo", "testy premium"],
    details: {
      ects: 4,
      semester: "Rok I-II, Semestr I, III",
      objectives: "Poznanie koncepcji i zadań zdrowia publicznego oraz aspektów zdrowia, czynników warunkujących, współczesne zagrożenia wraz z ochroną zdrowia w Polsce. Opanowanie niezbędnej wiedzy z zakresu społecznych uwarunkowań zdrowia i choroby w kontekście interdyscyplinarnym, nabycie umiejętności organizowania działań na rzecz promocji zdrowia w różnych środowiskach i instytucjach, opanowanie umiejętności metodycznych związanych z edukacją zdrowotną, opanowanie umiejętności organizowania działań pomocowych instytucjonalnych i pozainstytucjonalnych w obszarze środowisk lokalnych i na różnych szczeblach zarządzania, poznać współczesne koncepcje zdrowia, opracowywać i realizować projekty badawcze w zakresie pedagogiki progresywno prozdrowotnej.",
      prerequisites: "",
      learningOutcomes: {
        knowledge: [
          { code: "ZP.W.20", desc: "Zna zadania z zakresu zdrowia publicznego." },
          { code: "ZP.W.21", desc: "Zna kulturowe, społeczne i ekonomiczne uwarunkowania zdrowia publicznego." },
          { code: "ZP.W.22", desc: "Zna podstawowe pojęcia dotyczące zdrowia i choroby." },
          { code: "ZP.W.23", desc: "Rozumie istotę profilaktyki i prewencji chorób." },
          { code: "ZP.W.24", desc: "Rozumie zasady funkcjonowania rynku usług medycznych w Polsce oraz w wybranych państwach członkowskich Unii Europejskiej." },
          { code: "ZP.W.25", desc: "Zna swoiste zagrożenia zdrowotne występujące w środowisku zamieszkania, edukacji i pracy." },
          { code: "ZP.W.26", desc: "Zna międzynarodowe klasyfikacje statystyczne, w tym chorób i problemów zdrowotnych (ICD-10), procedur medycznych (ICD-9) oraz funkcjonowania, niepełnosprawności i zdrowia (ICF)." }
        ],
        skills: [
          { code: "ZP.U.13", desc: "Potrafi oceniać światowe trendy dotyczące ochrony zdrowia w aspekcie najnowszych danych epidemiologicznych i demograficznych." },
          { code: "ZP.U.14", desc: "Potrafi analizować i oceniać funkcjonowanie różnych systemów opieki medycznej oraz identyfikować źródła ich finansowania." },
          { code: "ZP.U.15", desc: "Potrafi stosować międzynarodowe klasyfikacje statystyczne, w tym chorób i problemów zdrowotnych (ICD-10), procedur medycznych (ICD-9) oraz funkcjonowania niepełnosprawności i zdrowia (ICF)." }
        ]
      },
      programContent: {
        lectures: [
          "Zdrowie publiczne: kulturowe, społeczne i ekonomiczne uwarunkowania zdrowia.",
          "Podstawowe pojęcia dotyczące zdrowia i choroby.",
          "Profilaktyka, prewencja chorób – cele, zadania, formy.",
          "Programowe działania na rzecz wybranych chorób: Narodowy Program Zdrowia, programy promocji zdrowia i ich realizacja w Polsce.",
          "Problemy zdrowotne i społeczne ludzi starych. Opieka paliatywna.",
          "Model medycyny rodzinnej – założenia i zadania.",
          "Podstawowe pojęcia epidemiologiczne: pozytywne i negatywne mierniki stanu zdrowia populacji, podstawowe pojęcia epidemiologii chorób zakaźnych.",
          "Higiena pracy.",
          "Zagrożenie ekologiczne.",
          "Zagrożenia zdrowotne występujące w środowisku zamieszkania i nauki.",
          "Zagrożenia zdrowia występujące w środowisku pracy.",
          "Patologia rodziny, a zdrowie. Krzywdzenie dzieci.",
          "Demograficzne uwarunkowania stanu zdrowia zbiorowości.",
          "Definicja chorób społecznych. Analiza występowania wybranych chorób.",
          "Zaburzenia psychiczne jako choroby społeczne: zaburzenia psychosomatyczne, zaburzenia lękowe, depresje."
        ],
        seminars: [
          "Opieka medyczna w szkole w ramach zdrowia publicznego.",
          "Profilaktyka zakażeń wirusem HIV.",
          "Wypadki i urazy. Profilaktyka urazów i wypadków.",
          "Choroby zawodowe. Profilaktyka.",
          "Organizacja, finansowanie i kontraktowanie w systemie ochrony zdrowia w Polsce i na świecie.",
          "Zasady w pielęgniarstwie, standard opieki, procedura, algorytm.",
          "Omówienie Międzynarodowej Statystyki Klasyfikacji Chorób i Problemów Zdrowotnych, klasyfikacji ICD-9-CM – i kwalifikowaniu schorzeń i chorób wg ICD-10 oraz niepełnosprawności i zdrowia (ICF)."
        ],
        selfStudy: [
          "Studiowanie literatury w zakresie zagrożeń zdrowotnych współczesnych społeczeństw świata, wybranych zagadnień patologii społecznej i opieki medycznej nad wybranymi grupami ludności, oraz inne tematy."
        ]
      }
    }
  },
  "prawo-medyczne": {
    category: "prawo-medyczne",
    course: "pielegniarstwo",
    requiredTier: "premium",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5JajIrkmQWsLSvF0ZVh7qXdCNxbjatwczey8g",
    description: "Testy z prawa medycznego dla pielęgniarek. Prawa pacjenta, odpowiedzialność zawodowa, dokumentacja medyczna, tajemnica zawodowa oraz regulacje prawne w ochronie zdrowia.",
    duration: [25, 40, 60],
    popularity: "Treść Premium!",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Prawo Medyczne",
    keywords: ["prawo medyczne", "prawa pacjenta", "odpowiedzialność zawodowa", "dokumentacja medyczna", "tajemnica lekarska", "regulacje prawne", "pielęgniarstwo", "testy premium"],
    details: {
      ects: 2,
      semester: "Rok I, Semestr I",
      objectives: "1. Dostarczenie podstawowych informacji z zakresu systemu prawa polskiego wraz z elementami prawa wspólnotowego, ze szczególnym uwzględnieniem prawa pracy, ubezpieczeń społecznych oraz prawnych podstaw wykonywania zawodu pielęgniarki, w tym z przepisami dotyczącymi odpowiedzialności cywilnej, karnej i dyscyplinarnej pielęgniarek.\n2. Wdrożenie umiejętności stosowania przepisów prawa w ramach wykonywania zawodu pielęgniarki.",
      prerequisites: "Student zna w podstawowym zakresie system organów ustrojowych Rzeczypospolitej Polskiej oraz źródła prawa powszechnie obowiązującego.",
      learningOutcomes: {
        knowledge: [
          { code: "PM.W.15", desc: "Podstawowe pojęcia z zakresu prawa i rolę prawa w życiu społeczeństwa, ze szczególnym uwzględnieniem praw człowieka i prawa pracy." },
          { code: "PM.W.16", desc: "Podstawowe regulacje prawne z zakresu ubezpieczeń zdrowotnych obowiązujące w Polsce i w państwach członkowskich Unii Europejskiej oraz wybrane trendy w polityce ochrony zdrowia w Polsce i w państwach członkowskich Unii Europejskiej." },
          { code: "PM.W.17", desc: "Podstawy prawne wykonywania zawodu pielęgniarki, w tym prawa i obowiązki pielęgniarki, organizację i zadania samorządu zawodowego pielęgniarek i położnych oraz prawa i obowiązki jego członków." },
          { code: "PM.W.18", desc: "Zasady odpowiedzialności karnej, cywilnej, pracowniczej i zawodowej związanej z wykonywaniem zawodu pielęgniarki." },
          { code: "PM.W.19", desc: "Prawa człowieka, prawa dziecka i prawa pacjenta." }
        ],
        skills: [
          { code: "PM.U.12", desc: "Stosować przepisy prawa dotyczące praktyki zawodowej pielęgniarki." }
        ]
      },
      programContent: {
        lectures: [
          "Podstawy zagadnień prawnych - system prawa, prawa człowieka, podstawowe pojęcia z zakresu prawa cywilnego.",
          "System ubezpieczeń społecznych - ogólne zasady, system występujący w Polsce, przepisy wspólnotowe.",
          "Kodeks pracy - podstawy.",
          "Ustawa o zawodach pielęgniarki i położnej i ustawa o samorządach zawodowych.",
          "Działalność lecznicza i świadczenia zdrowotne.",
          "Prawa pacjenta - ustawa o prawach pacjenta i Rzeczniku Praw Pacjenta, Karta Praw Pacjenta.",
          "Odpowiedzialność prawna związana z wykonywaniem zawodu - karna, cywilna i pracownicza."
        ],
        seminars: [
          "Odpowiedzialność prawna związana z wykonywaniem zawodu - karna, cywilna i pracownicza - kodeks pracy, ustawy, prawa pacjenta."
        ],
        selfStudy: [
          "Organy samorządu zawodowego pielęgniarek i położnych – skład i kompetencje.",
          "Studiowanie literatury przedmiotu."
        ]
      }
    }
  },
  "podstawy-pielegniarstwa": {
    category: "podstawy-pielegniarstwa",
    course: "pielegniarstwo",
    requiredTier: "premium",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5gOhTeFK1JZolbvwfgWCAFPh8xz9BIKNsVjGk",
    description: "Kompleksowe testy z podstaw pielęgniarstwa. Podstawowe procedury, techniki pielęgnacyjne, higiena, bezpieczeństwo pacjenta, standardy opieki oraz fundamenty zawodu pielęgniarki.",
    duration: [25, 40, 60],
    popularity: "Treść Premium!",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Podstawy Pielęgniarstwa",
    keywords: ["podstawy pielęgniarstwa", "procedury pielęgnacyjne", "techniki", "higiena", "bezpieczeństwo pacjenta", "standardy opieki", "zawód pielęgniarki", "testy premium"],
    details: {
      ects: 15,
      semester: "Rok I, Semestr I-II",
      objectives: "1. Zapoznanie z teoretycznymi podstawami pielęgniarstwa.\n2. Kształtowanie umiejętności praktycznych w zakresie opieki bezpośredniej nad pacjentem i jego rodziną.\n3. Planowanie i realizowanie zindywidualizowanej, bezpiecznej i etycznej opieki nad pacjentem.",
      prerequisites: "Podstawowe wiadomości z anatomii, fizjologii i patologii człowieka.",
      learningOutcomes: {
        knowledge: [
          { code: "PP.W.1", desc: "Uwarunkowania rozwoju pielęgniarstwa na tle transformacji opieki pielęgniarskiej i profesjonalizacji współczesnego pielęgniarstwa." },
          { code: "PP.W.2", desc: "Pojęcie pielęgnowania, w tym wspierania, pomagania i towarzyszenia." },
          { code: "PP.W.3", desc: "Funkcje i zadania zawodowe pielęgniarki oraz rolę pacjenta w procesie realizacji opieki pielęgniarskiej." },
          { code: "PP.W.4", desc: "Proces pielęgnowania (istota, etapy, zasady) i primary nursing (istota, odrębności) oraz wpływ pielęgnowania tradycyjnego na funkcjonowanie praktyki pielęgniarskiej." },
          { code: "PP.W.5", desc: "Klasyfikacje diagnoz i praktyk pielęgniarskich." },
          { code: "PP.W.6", desc: "Istotę opieki pielęgniarskiej opartej o wybrane założenia teoretyczne (Florence Nightingale, Virginia Henderson, Dorothea Orem, Callista Roy, Betty Neuman)." },
          { code: "PP.W.7", desc: "Istotę, cel, wskazania, przeciwwskazania, powikłania, obowiązujące zasady i technikę wykonywania podstawowych czynności pielęgniarskich, diagnostycznych, leczniczych i rehabilitacyjnych." },
          { code: "PP.W.8", desc: "Zadania pielęgniarki w opiece nad pacjentem zdrowym, zagrożonym chorobą, chorym i o niepomyślnym rokowaniu." },
          { code: "PP.W.9", desc: "Zakres i charakter opieki pielęgniarskiej w wybranych stanach pacjenta, sytuacjach klinicznych, w deficycie samoopieki, zaburzonym komforcie, zaburzonej sferze psychoruchowej." },
          { code: "PP.W.10", desc: "Zakres opieki pielęgniarskiej i interwencji pielęgniarskich w wybranych diagnozach pielęgniarskich." },
          { code: "PP.W.11", desc: "Udział pielęgniarki w zespole interdyscyplinarnym w procesie promowania zdrowia, profilaktyki, diagnozowania, leczenia i rehabilitacji." }
        ],
        skills: []
      },
      programContent: {
        lectures: [],
        seminars: [],
        selfStudy: []
      }
    }
  },
  "etyka-zawodowa": {
    category: "etyka-zawodowa",
    course: "pielegniarstwo",
    requiredTier: "premium",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5KqquTG6br79T0mSRj6eAJqPf4kEid2ncgM5N",
    description: "Testy z etyki zawodu pielęgniarki. Kodeks etyki, dylematy etyczne, godność pacjenta, autonomia, poufność oraz wartości etyczne w codziennej praktyce pielęgniarskiej.",
    duration: [25, 40, 60],
    popularity: "Treść Premium!",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Etyka Zawodu Pielęgniarki",
    keywords: ["etyka", "kodeks etyki", "dylematy etyczne", "godność pacjenta", "autonomia", "wartości etyczne", "zawód pielęgniarki", "testy premium"],
    details: {
      ects: 1,
      semester: "Rok I, Semestr I",
      objectives: "Zdobycie wiedzy i umiejętności prezentowania postaw i podejmowania decyzji etycznych w pracy pielęgniarki.",
      prerequisites: "Podstawowa znajomość kodeksu zawodowego.",
      learningOutcomes: {
        knowledge: [
          { code: "EZP.W.12", desc: "Przedmiot etyki ogólnej i zawodowej." },
          { code: "EZP.W.13", desc: "Istotę podejmowania decyzji etycznych i rozwiązywania dylematów moralnych w pracy pielęgniarki." },
          { code: "EZP.W.14", desc: "Problematykę etyki normatywnej, w tym aksjologii wartości, powinności i sprawności moralnych istotnych w pracy pielęgniarki." },
          { code: "EZP.W.15", desc: "Kodeks etyki zawodowej pielęgniarki i położnej." }
        ],
        skills: [
          { code: "EZP.U.27", desc: "Rozwiązywać dylematy etyczne i moralne w praktyce pielęgniarskiej." }
        ],
        competencies: [
          { code: "EZP.S.4", desc: "Ponoszenia odpowiedzialności za wykonywane czynności zawodowe." },
          { code: "EZP.S.5", desc: "Zasięgania opinii ekspertów w przypadku trudności z samodzielnym rozwiązaniem problemu." }
        ]
      },
      programContent: {
        lectures: [
          "Historia etyki pielęgniarskiej.",
          "Pojęcie, zagadnienia etyki.",
          "Koncepcje etyczne w pielęgniarstwie.",
          "Wartości, zasady etyczne i kodeksy istotne w zawodzie pielęgniarki.",
          "Prawa człowieka, a praktyka pielęgniarska.",
          "Potrzebna czy niepotrzebna – etyka w pielęgniarstwie."
        ],
        seminars: [
          "Podstawowe koncepcje etyczne w medycynie: analiza przypadków – aplikacja koncepcji do praktyki pielęgniarskiej.",
          "Analiza norm kodeksowych na przykładzie Kodeksu etyki zawodowej pielęgniarki i położnej RP oraz Kodeksu pielęgniarek MRP.",
          "Dylematy w praktyce pielęgniarki. Podejmowanie decyzji etycznych.",
          "Opieka holistyczna w pielęgniarstwie – elementy opieki wielokulturowej i duchowej w pielęgniarstwie."
        ],
        selfStudy: [
          "Odpowiedzialność zawodowa pielęgniarki.",
          "Prawa pacjenta.",
          "Podejmowanie decyzji etycznych w pracy pielęgniarskiej.",
          "Wzory osobowe w pielęgniarstwie.",
          "Problemy bioetyczne w medycynie."
        ]
      }
    }
  },
  "promocja-zdrowia": {
    category: "promocja-zdrowia",
    course: "pielegniarstwo",
    requiredTier: "premium",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k52bP49YSEBiUD8sVXHObYqkj3TNfo4PKMGg6J",
    description: "Testy z promocji zdrowia dla pielęgniarstwa. Style życia, profilaktyka chorób, edukacja zdrowotna, zdrowe nawyki oraz programy promocji zdrowia w różnych grupach społecznych.",
    duration: [25, 40, 60],
    popularity: "Treść Premium!",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Promocja Zdrowia",
    keywords: ["promocja zdrowia", "profilaktyka", "edukacja zdrowotna", "zdrowy styl życia", "prewencja", "nawyki zdrowotne", "pielęgniarstwo", "testy premium"],
    details: {
      ects: 2,
      semester: "Rok III, Semestr VI",
      objectives: "1. Przygotowanie studenta do włączenia się w realizację programów promocji zdrowia skierowanych do różnych osób i społeczności.\n2. Kształtowanie nawyku doskonalenia zawodowego i przygotowanie do systematycznego samokształcenia w przyszłej pracy zawodowej.",
      prerequisites: "Psychologia, Podstawy pielęgniarstwa.",
      learningOutcomes: {
        knowledge: [
          { code: "PZ.W.16", desc: "Zasady promocji zdrowia i profilaktyki zdrowotnej." },
          { code: "PZ.W.17", desc: "Zasady konstruowania programów promocji zdrowia." },
          { code: "PZ.W.18", desc: "Strategie promocji zdrowia o zasięgu lokalnym, krajowym i światowym." }
        ],
        skills: [
          { code: "PZ.U.28", desc: "Oceniać potencjał zdrowotny pacjenta i jego rodziny z wykorzystaniem skal, siatek i pomiarów." },
          { code: "PZ.U.29", desc: "Rozpoznawać uwarunkowania zachowań zdrowotnych pacjenta i czynniki ryzyka chorób wynikających ze stylu życia." },
          { code: "PZ.U.30", desc: "Dobierać metody i formy profilaktyki i prewencji chorób oraz kształtować zachowania zdrowotne różnych grup społecznych." },
          { code: "PZ.U.31", desc: "Uczyć pacjenta samokontroli stanu zdrowia." },
          { code: "PZ.U.32", desc: "Opracowywać i wdrażać indywidualne programy promocji zdrowia pacjentów, rodzin i grup społecznych." }
        ],
        competencies: [
          { code: "PZ.S.4", desc: "Ponoszenia odpowiedzialności za wykonywane czynności zawodowe." },
          { code: "PZ.S.5", desc: "Zasięgania opinii ekspertów w przypadku trudności z samodzielnym rozwiązaniem problemu." }
        ]
      },
      programContent: {
        lectures: [
          "Definiowanie zdrowia i promocji zdrowia.",
          "Czynniki warunkujące zdrowie.",
          "Zdrowie w różnych okresach życia człowieka.",
          "Diagnozowanie potencjału zdrowotnego człowieka.",
          "Rozwój idei promocji zdrowia.",
          "Metody promocji zdrowia.",
          "Role zawodowe w promocji zdrowia. Promocja zdrowia a proces pielęgnowania.",
          "Siedliskowe podejście w promocji zdrowia.",
          "Promocja zdrowia i jej związki z profilaktyką, higieną i zdrowiem publicznym.",
          "Profilaktyka jako szczególna procedura działania w obliczu zjawisk społecznie niepożądanych i szkodliwych."
        ],
        seminars: [
          "Edukacja zdrowotna – obszary, cele, funkcje, modele, formy organizacyjne, metody.",
          "Edukacja zdrowotna jako element procesu pielęgnowania, zadania i kompetencje pielęgniarek.",
          "Tworzenie programów edukacji zdrowotnej.",
          "Specyfika edukacji zdrowotnej pacjenta z uwzględnieniem kryterium wieku i stanu zdrowia.",
          "Strategia konstruowania programu promocji zdrowia."
        ],
        selfStudy: [
          "Opracowanie programu promocji zdrowia wg wskazówek i kryteriów oceny prowadzącego."
        ]
      }
    }
  },
  "zakazenia-szpitalne": {
    category: "zakazenia-szpitalne",
    course: "pielegniarstwo",
    requiredTier: "premium",
    image: "https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5s4bwXrWj5zfQ3u7I8bUgG0ydxCaMOwLKeVP6",
    description: "Zaawansowane testy o zakażeniach szpitalnych. Profilaktyka zakażeń, sterylizacja, dezynfekcja, aseptyka, antyseptyka, procedury izolacji oraz kontrola zakażeń w środowisku szpitalnym.",
    duration: [25, 40, 60],
    popularity: "Treść Premium!",
    status: true,
    numberOfQuestions: [10, 40],
    title: "Zakażenia Szpitalne",
    keywords: ["zakażenia szpitalne", "profilaktyka", "sterylizacja", "dezynfekcja", "aseptyka", "antyseptyka", "kontrola zakażeń", "higiena szpitalna", "testy premium"],
    details: {
      ects: 1,
      semester: "Rok I, Semestr I",
      objectives: "1. Przyswojenie sobie przez studentów wiedzy z zakresu higieny szpitalnej i zakażeń szpitalnych/związanych z udzielaniem świadczeń medycznych.\n2. Zaznajomienie studentów ze specyfiką działań z zakresu zapobiegania zakażeniom szpitalnym.\n3. Przygotowanie studenta do aktywnego włączenia się w zwalczanie zakażeń szpitalnych oraz nadzór nad dekontaminacją w placówkach ochrony zdrowia.\n4. Wyrobienie umiejętności i nawyku podejmowania działań zapobiegających powstawaniu i szerzeniu się zakażeń szpitalnych na każdym stanowisku i przy każdym działaniu pielęgniarki.",
      prerequisites: "Na podstawie realizacji przedmiotów: Anatomia, Fizjologia, Patologia, Podstawy pielęgniarstwa, Mikrobiologia i parazytologia.",
      learningOutcomes: {
        knowledge: [
          { code: "ZS.W.36", desc: "Pojęcie zakażeń związanych z udzielaniem świadczeń zdrowotnych, w tym zakażeń szpitalnych, z uwzględnieniem źródeł i rezerwuaru drobnoustrojów w środowisku pozaszpitalnym i szpitalnym, w tym dróg ich szerzenia." },
          { code: "ZS.W.37", desc: "Sposoby kontroli szerzenia się, zapobiegania i zwalczania zakażeń szpitalnych." },
          { code: "ZS.W.38", desc: "Mechanizm i sposoby postępowania w zakażeniu krwi, zakażeniu ogólnoustrojowym, szpitalnym zapaleniu płuc, zakażeniu dróg moczowych i zakażeniu miejsca operowanego." }
        ],
        skills: [
          { code: "ZS.U.48", desc: "Wdrażać standardy postępowania zapobiegającego zakażeniom szpitalnym." },
          { code: "ZS.U.49", desc: "Stosować środki ochrony własnej, pacjentów i współpracowników przed zakażeniami." }
        ],
        competencies: [
          { code: "ZS.S.4", desc: "Ponoszenia odpowiedzialności za wykonywane czynności zawodowe." },
          { code: "ZS.S.5", desc: "Zasięgania opinii ekspertów w przypadku trudności z samodzielnym rozwiązaniem problemu." },
          { code: "ZS.S.6", desc: "Przewidywania i uwzględniania czynników wpływających na reakcje własne i pacjenta." }
        ]
      },
      programContent: {
        lectures: [
          "Regulacje prawne dotyczące kontroli zakażeń szpitalnych.",
          "Rola i organizacja kontroli zakażeń szpitalnych w placówkach ochrony zdrowia.",
          "Zasady monitorowania zakażeń w placówkach służby zdrowia.",
          "Epidemiologia drobnoustrojów w środowisku szpitalnym.",
          "Drogi szerzenia się zakażeń.",
          "Drobnoustroje chorobotwórcze (bakterie, wirusy, grzyby), jako czynnik etiologiczny zakażeń szpitalnych.",
          "Drobnoustroje alarmowe i ich wpływ na występowanie zakażeń.",
          "Szpitalne zakażenia układowe.",
          "Zakażenia związane z wykonywaniem procedur medycznych w oddziałach szpitalnych.",
          "Podstawy zapobiegania zakażeniom wirusami HBV, HCV, HIV.",
          "Zakażenia bakteryjne, grzybicze i wirusowe. Metody zapobiegania.",
          "Procedury zapobiegania szerzeniu się zakażeniom.",
          "Zadania pielęgniarki w profilaktyce zakażeń szpitalnych w różnych oddziałach.",
          "Umiejętność identyfikowania i kwalifikowania zakażeń oraz ich charakteru przez pielęgniarkę."
        ],
        seminars: [],
        selfStudy: [
          "Rola pielęgniarki w zapobieganiu zakażeniom wewnątrzszpitalnym w placówkach ochrony zdrowia (wybranej) na podstawie analizy piśmiennictwa - praca pisemna."
        ]
      }
    }
  }
};
