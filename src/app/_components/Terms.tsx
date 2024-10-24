import Link from 'next/link'

export default function Terms() {
  return (
    <div className="h-full w-full max-w-4xl mx-auto bg-white flex flex-col p-4 sm:p-8 md:p-12 gap-4 rounded-2xl px-4 mb-8">
      <p className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7">
        Witamy w Wolfmed Edukacja. Niniejsza strona wyjaśnia nasze zasady korzystania z aplikacji. Korzystając z Wolfmed
        Edukacja, zgadzasz się na wszystkie zasady zawarte na tej stronie. Część z nich musi być sformułowana w języku
        prawnym, ale dołożyliśmy wszelkich starań, aby przedstawić jasne i proste wyjaśnienia dotyczące ich znaczenia.
      </p>
      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Tworzenie konta</h2>
      <p className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7">
        Aby zarejestrować konto w Wolfmed Edukacja, musisz mieć co najmniej 18 lat. Jesteś odpowiedzialny za swoje konto
        oraz wszystkie działania na nim. Możesz przeglądać Wolfmed Edukacja bez rejestracji, ale aby skorzystać z
        większości dostępnych funkcji, musisz założyć konto, podać ważny adres email i ustawić hasło. Informacje, które
        nam podajesz, muszą być dokładne i pełne. Nie możesz podszywać się pod nikogo innego ani wybierać obraźliwych
        nazw, które naruszają czyjeś prawa. Jeśli nie przestrzegasz tych zasad, możemy anulować twoje konto. Jesteś
        odpowiedzialny za wszystkie działania na swoim koncie oraz za zachowanie poufności swojego hasła. Jeśli dowiesz
        się, że ktoś użył twojego konta bez twojej zgody, powinieneś zgłosić to na adres{' '}
        <Link
          href="mailto:wolfmededu@gmail.com"
          target="_blank"
          className="hover:text-red-500 transition-colors text-blue-400"
        >
          wolfmededu@gmail.com
        </Link>
      </p>
      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Zasady, których należy unikać</h2>
      <ul className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7 flex flex-col gap-4">
        Wiele osób korzysta z Wolfmed Edukacja. Oczekujemy, że wszyscy będą się zachowywać odpowiedzialnie i pomogą
        utrzymać to miejsce w porządku. Jeśli chcesz być częścią naszej społeczności, nie rób żadnej z poniższych
        rzeczy:
        <li className="list-disc mx-8">
          Nie łam prawa. Nie podejmuj działań, które naruszają prawa innych osób, łamią prawo lub naruszają jakiekolwiek
          umowy lub obowiązki prawne wobec kogokolwiek.
        </li>
        <li className="list-disc mx-8">
          Nie rozpowszechniaj niechcianych lub nieautoryzowanych materiałów reklamowych lub promocyjnych, ani żadnej
          poczty junk, spamu lub listów łańcuchowych. Nie prowadź list dyskusyjnych, listservów ani żadnego rodzaju
          automatycznych odpowiedzi lub spamu na lub za pośrednictwem Witryny.
        </li>
        <li className="list-disc mx-8">
          Nie publikuj nieodpowiednich treści. Nasza aplikacja pozwala użytkownikom jedynie na ustawienie nazwy
          użytkownika oraz motta, które mogą być publicznie widoczne. Nazwa użytkownika i motto nie mogą być
          nieodpowiednie, czyli zawierać treści niezgodnych z prawem, obraźliwych, obscenicznych, wulgarnych,
          zniesławiających lub jakichkolwiek innych, które mogą naruszać prywatność lub prawa innych osób.
        </li>
        <li className="list-disc mx-8">
          Nie oferuj zabronionych treści. Aplikacja Wolfmed Edukacja nie obsługuje nagród ani sprzedaży przedmiotów.
          Zabronione jest publikowanie treści, które naruszają zasady naszej aplikacji lub obowiązujące przepisy prawne.
        </li>
      </ul>
      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">
        Rzeczy, których nie robimy i za które nie ponosimy odpowiedzialności
      </h2>
      <p className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7">
        Wolfmed Edukacja nie ponosi odpowiedzialności za jakiekolwiek szkody lub straty wynikające z korzystania z
        aplikacji. Nie angażujemy się w spory między użytkownikami ani między użytkownikami a osobami trzecimi związane
        z użytkowaniem naszych usług. Korzystanie z aplikacji odbywa się na własne ryzyko użytkownika, a wszelkie
        treści, które przeglądasz, są wyłącznie na Twoją odpowiedzialność.
      </p>
      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Opłaty</h2>
      <p className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7">
        Korzystanie z aplikacji Wolfmed Edukacja jest obecnie całkowicie bezpłatne, a my nie pobieramy żadnych prowizji.
        Liczymy na dobrowolne wsparcie w postaci donacji. Nasz partner płatniczy, Stripe, pobiera prowizję za
        przetwarzanie płatności, która jest już wliczona w proponowane kwoty wsparcia wynoszące 49,99 zł lub 14,99 zł.
      </p>
      <p className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7">
        W przyszłości, w zależności od liczby użytkowników oraz obciążenia naszych darmowych serwerów i usług, możemy
        być zmuszeni wprowadzić płatną subskrypcję lub zamknąć aplikację, jeśli dalsze utrzymanie okaże się niemożliwe.
      </p>
      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">
        O innych stronach internetowych i linkach
      </h2>
      <p className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7">
        Wolfmed Edukacja może zawierać linki do naszych mediów społecznościowych. Choć nasz zespół weryfikuje każdy link
        przed jego udostępnieniem, korzystanie z zewnętrznych witryn odbywa się na własne ryzyko. Zewnętrzne linki mogą
        również pojawiać się w postach i artykułach na naszym blogu. Naszym partnerem do przetwarzania płatności jest
        Stripe, a korzystanie z płatności wiąże się z akceptacją warunków operatora.
      </p>
      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Prawa własności intelektualnej</h2>
      <p className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7">
        Wszystkie testy oraz materiały edukacyjne udostępniane w aplikacji są oparte na programie nauczania MED-14:
        &quot;Świadczenie usług medyczno-pielęgnacyjnych i opiekuńczych osobie chorej i niesamodzielnej&quot;. Materiały
        te są dostępne publicznie, dlatego użytkownicy mogą je wykorzystywać do własnego użytku edukacyjnego, jednakże
        wszelkie ich rozpowszechnianie lub kopiowanie poza platformą Wolfmed Edukacja wymaga przestrzegania zasad prawa
        autorskiego. Zastrzegamy sobie prawo do ograniczenia lub cofnięcia dostępu do treści w przypadku ich
        niewłaściwego wykorzystania.
      </p>
      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Usunięcie konta</h2>
      <p className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7">
        Możesz zaprzestać korzystania z naszej aplikacji i usunąć swoje konto samodzielnie. W tym celu wystarczy kliknąć
        na zdjęcie swojego avatara w górnym rogu, otworzyć panel klienta oferowany przez Clerk, przejść do zakładki
        „Zarządzaj kontem”, a następnie do sekcji „Bezpieczeństwo”. Tam możesz całkowicie usunąć swoje konto, co
        spowoduje usunięcie wszystkich stworzonych testów, całkowitego postępu w aplikacji oraz danych rejestracyjnych,
        takich jak email i hasło, które zostaną usunięte również z bazy Clerk. W razie jakichkolwiek problemów możesz
        skontaktować się z naszym zespołem pod adresem{' '}
        <Link
          href="mailto:wolfmededu@gmail.com"
          target="_blank"
          className="hover:text-red-500 transition-colors text-blue-400"
        >
          wolfmededu@gmail.com
        </Link>
      </p>
      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Odpowiedzialność Odszkodowawcza</h2>
      <p className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7">
        Zgadzasz się chronić Wolfmed Edukacja oraz naszych pracowników i partnerów przed wszelkimi roszczeniami,
        szkodami lub kosztami, które mogą wyniknąć z naruszenia tych warunków lub obowiązujących przepisów prawa.
        Zastrzegamy sobie prawo do przejęcia obrony w sprawach, w których zgodziłeś się nas zabezpieczyć, a Ty
        zobowiązujesz się współpracować z nami w razie potrzeby.
      </p>
      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Rozwiązywanie Sporów</h2>
      <p className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7">
        Zachęcamy do kontaktu z Wolfmed Edukacja, jeśli masz jakiekolwiek problemy, zanim zdecydujesz się na działania
        prawne. W przypadku, gdy sprawa wymaga podjęcia kroków prawnych, te warunki będą regulowane przez przepisy prawa
        obowiązujące w Polsce, bez wpływu na zasady kolizji praw.
      </p>
      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Umowa między Tobą a Nami</h2>
      <p className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7">
        Niniejsze Warunki stanowią całość umowy między Tobą a Wolfmed Edukacja w odniesieniu do naszych usług. Zastępują
        wszystkie inne komunikaty i propozycje między Tobą a Wolfmed Edukacja. Jeśli jakiekolwiek postanowienie tych
        Warunków zostanie uznane za nieważne przez sąd, pozostałe postanowienia pozostaną w mocy. Niepodjęcie przez
        Wolfmed Edukacja żadnych działań w celu egzekwowania swoich praw nie oznacza rezygnacji z tych praw.
      </p>
      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Różne postanowienia</h2>
      <p className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7">
        Możemy modyfikować lub zaprzestać świadczenia usług w dowolnym momencie według własnego uznania. Zgadzasz się,
        że z wyjątkiem wyraźnie określonych w niniejszych Warunkach, nie ma osób trzecich uprawnionych do korzystania z
        tych Warunków. Żadne zaniechanie egzekwowania któregokolwiek z postanowień tych Warunków nie będzie uznawane za
        dalsze lub ciągłe zrzeczenie się takich praw. Zgadzasz się, że wszelkie roszczenia związane z usługami muszą być
        zgłoszone w ciągu jednego (1) roku od powstania przyczyny roszczenia, w przeciwnym razie roszczenie to jest na
        zawsze wykluczone.
      </p>
    </div>
  )
}
