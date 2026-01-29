import Link from 'next/link'

export default function Policy() {
  return (
    <div className="h-full w-full max-w-4xl mx-auto bg-white flex flex-col p-4 sm:p-8 md:p-12 gap-4 rounded-2xl px-4 mb-8">
      {/* Data Controller Section - RODO Art. 13 */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mb-4">Administrator Danych Osobowych</h2>
        <p className="text-base xs:text-lg text-zinc-800 mb-2">
          Administratorem Twoich danych osobowych jest:
        </p>
        <div className="bg-white rounded-lg p-4 border border-zinc-200">
          <p className="text-base xs:text-lg text-zinc-800 font-semibold">Wolfmed Edukacja</p>
          <p className="text-base xs:text-lg text-zinc-800">
            E-mail:{' '}
            <Link
              href="mailto:wolfmededu@gmail.com"
              target="_blank"
              className="hover:text-red-500 transition-colors text-blue-400"
            >
              wolfmededu@gmail.com
            </Link>
          </p>
        </div>
        <p className="text-sm text-zinc-600 mt-4">
          W sprawach związanych z ochroną danych osobowych możesz kontaktować się z nami pod powyższym adresem e-mail.
        </p>
      </div>

      <p className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7">
        Wolfmed Edukacja to innowacyjna platforma edukacyjna, która oferuje kursy i testy medyczne dedykowane przyszłym
        opiekunom medycznym, pielęgniarkom oraz innym specjalistom przygotowującym się do egzaminów zawodowych. Dbamy o
        Twoją prywatność i chcemy, abyś czuł się pewnie, korzystając z naszych produktów oraz platformy. Naszą polityką
        jest poszanowanie prywatności użytkowników i wszelkich informacji, które możemy zbierać podczas prowadzenia
        naszej strony internetowej.
      </p>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">
        Podstawa prawna przetwarzania danych (Art. 6 RODO)
      </h2>
      <p className="text-base xs:text-lg text-zinc-800 mb-4">
        Przetwarzamy Twoje dane osobowe na następujących podstawach prawnych:
      </p>
      <ul className="text-base xs:text-lg text-zinc-700 leading-7 flex flex-col gap-3">
        <li className="list-disc mx-8">
          <strong>Art. 6 ust. 1 lit. a) RODO</strong> – Twoja zgoda, np. na otrzymywanie informacji marketingowych lub
          wykorzystanie plików cookie do celów analitycznych.
        </li>
        <li className="list-disc mx-8">
          <strong>Art. 6 ust. 1 lit. b) RODO</strong> – wykonanie umowy, której jesteś stroną, np. świadczenie usług
          edukacyjnych, realizacja zakupionych kursów, obsługa płatności.
        </li>
        <li className="list-disc mx-8">
          <strong>Art. 6 ust. 1 lit. c) RODO</strong> – wypełnienie obowiązków prawnych ciążących na administratorze,
          np. przechowywanie dokumentacji podatkowej.
        </li>
        <li className="list-disc mx-8">
          <strong>Art. 6 ust. 1 lit. f) RODO</strong> – prawnie uzasadniony interes administratora, np. zapewnienie
          bezpieczeństwa platformy, dochodzenie roszczeń.
        </li>
      </ul>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Odwiedzający stronę internetową</h2>
      <p className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7">
        Podobnie jak większość operatorów stron internetowych, Wolfmed Edukacja zbiera informacje, które nie
        identyfikują użytkowników, takie jak typ przeglądarki, preferencje językowe, strona, z której następuje
        odwołanie, oraz datę i godzinę każdego żądania. Celem zbierania tych informacji jest lepsze zrozumienie, jak
        użytkownicy korzystają z naszej strony internetowej. Od czasu do czasu możemy publikować raporty dotyczące
        trendów w korzystaniu z naszej witryny, które nie zawierają danych osobowych.
      </p>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Płatności</h2>
      <p className="text-base xs:text-lg text-zinc-800">
        Wolfmed Edukacja oferuje kursy edukacyjne w modelu płatnym. Aby dokonać zakupu kursu, musisz podać naszemu
        procesorowi płatności (Stripe) swoje dane płatnicze oraz adres e-mail. Stripe akceptuje płatności kartą oraz
        płatności BLIK. Po dokonaniu płatności, przechowujemy numer transakcji, kwotę oraz adres e-mail w celu obsługi
        zamówienia i zapewnienia dostępu do zakupionych treści.
      </p>
      <p className="text-base xs:text-lg text-zinc-800 mt-3">
        Aktualnie oferujemy kursy z zakresu: opiekuna medycznego (MED-14), pielęgniarstwa oraz inne specjalistyczne
        kursy medyczne. Lista dostępnych kursów może się zmieniać.
      </p>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Zbieranie informacji osobowych</h2>
      <p className="text-base xs:text-lg text-zinc-800">
        Niektórzy użytkownicy Wolfmed Edukacja decydują się na interakcję z naszą platformą w sposób, który wymaga od
        nas zbierania informacji osobowych. Rodzaj i ilość zbieranych informacji zależy od charakteru interakcji. Na
        przykład, prosimy użytkowników, którzy się rejestrują, o podanie nazwy użytkownika i adresu e-mail. W przypadku
        transakcji z naszą aplikacją mogą być wymagane dodatkowe informacje, w tym dane osobowe i finansowe niezbędne do
        przetworzenia tych transakcji. Zbieramy tylko te informacje, które są niezbędne do realizacji celu interakcji z
        naszą platformą. Nie ujawniamy informacji osobowych, chyba że opisano to poniżej. Użytkownicy mogą zawsze
        odmówić dostarczenia informacji osobowych, co może uniemożliwić im korzystanie z większości funkcji naszej
        aplikacji.
      </p>
      <p className="text-base xs:text-lg text-zinc-800 mt-3">
        Usunięcie konta przez użytkownika skutkuje automatycznym usunięciem danych osobowych. Żądanie usunięcia danych
        osobowych przed zakończeniem korzystania z aplikacji jest równoznaczne z brakiem dalszej możliwości korzystania
        z naszej platformy. Możesz zażądać usunięcia swoich danych osobowych, kontaktując się z nami pod adresem:{' '}
        <Link
          href="mailto:wolfmededu@gmail.com"
          target="_blank"
          className="hover:text-red-500 transition-colors text-blue-400"
        >
          wolfmededu@gmail.com
        </Link>
      </p>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Okres przechowywania danych</h2>
      <p className="text-base xs:text-lg text-zinc-800">Twoje dane osobowe przechowujemy przez następujące okresy:</p>
      <ul className="text-base xs:text-lg text-zinc-700 leading-7 flex flex-col gap-2 mt-3">
        <li className="list-disc mx-8">
          Dane konta użytkownika – do momentu usunięcia konta lub przez 3 lata od ostatniej aktywności.
        </li>
        <li className="list-disc mx-8">
          Dane transakcyjne – przez 5 lat od zakończenia roku podatkowego, w którym dokonano transakcji (zgodnie z
          przepisami podatkowymi).
        </li>
        <li className="list-disc mx-8">
          Dane z plików cookie analitycznych – zgodnie z okresem ważności danego pliku cookie (do 2 lat).
        </li>
      </ul>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">
        Podmioty przetwarzające dane (Procesory)
      </h2>
      <p className="text-base xs:text-lg text-zinc-800 mb-4">
        W celu świadczenia usług korzystamy z zaufanych partnerów zewnętrznych, którzy przetwarzają dane w naszym
        imieniu na podstawie umów powierzenia przetwarzania danych (DPA):
      </p>
      <div className="space-y-4">
        <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
          <h3 className="font-semibold text-zinc-800">Clerk (clerk.com)</h3>
          <p className="text-sm text-zinc-600 mt-1">
            <strong>Cel:</strong> Uwierzytelnianie użytkowników, zarządzanie sesjami
          </p>
          <p className="text-sm text-zinc-600">
            <strong>Lokalizacja:</strong> USA (EU-US Data Privacy Framework)
          </p>
          <p className="text-sm text-zinc-600">
            <strong>Dane:</strong> Adres e-mail, hasło (zaszyfrowane), dane sesji
          </p>
        </div>
        <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
          <h3 className="font-semibold text-zinc-800">Stripe (stripe.com)</h3>
          <p className="text-sm text-zinc-600 mt-1">
            <strong>Cel:</strong> Przetwarzanie płatności za kursy
          </p>
          <p className="text-sm text-zinc-600">
            <strong>Lokalizacja:</strong> USA/Irlandia (EU-US Data Privacy Framework)
          </p>
          <p className="text-sm text-zinc-600">
            <strong>Dane:</strong> Dane płatnicze, adres e-mail, historia transakcji
          </p>
        </div>
        <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
          <h3 className="font-semibold text-zinc-800">Google Analytics (google.com)</h3>
          <p className="text-sm text-zinc-600 mt-1">
            <strong>Cel:</strong> Analiza ruchu na stronie (tylko za zgodą użytkownika)
          </p>
          <p className="text-sm text-zinc-600">
            <strong>Lokalizacja:</strong> USA (EU-US Data Privacy Framework)
          </p>
          <p className="text-sm text-zinc-600">
            <strong>Dane:</strong> Anonimowe dane o zachowaniu użytkownika, adres IP (anonimizowany)
          </p>
        </div>
      </div>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Twoje prawa (Art. 15-22 RODO)</h2>
      <p className="text-base xs:text-lg text-zinc-800 mb-4">
        Zgodnie z RODO przysługują Ci następujące prawa w związku z przetwarzaniem Twoich danych osobowych:
      </p>
      <ul className="text-base xs:text-lg text-zinc-700 leading-7 flex flex-col gap-3">
        <li className="list-disc mx-8">
          <strong>Prawo dostępu</strong> (Art. 15) – możesz uzyskać informację, czy przetwarzamy Twoje dane oraz
          otrzymać ich kopię.
        </li>
        <li className="list-disc mx-8">
          <strong>Prawo do sprostowania</strong> (Art. 16) – możesz żądać poprawienia nieprawidłowych lub uzupełnienia
          niekompletnych danych.
        </li>
        <li className="list-disc mx-8">
          <strong>Prawo do usunięcia</strong> (Art. 17) – możesz żądać usunięcia swoich danych („prawo do bycia
          zapomnianym").
        </li>
        <li className="list-disc mx-8">
          <strong>Prawo do ograniczenia przetwarzania</strong> (Art. 18) – możesz żądać ograniczenia przetwarzania
          danych w określonych przypadkach.
        </li>
        <li className="list-disc mx-8">
          <strong>Prawo do przenoszenia danych</strong> (Art. 20) – możesz otrzymać swoje dane w ustrukturyzowanym
          formacie.
        </li>
        <li className="list-disc mx-8">
          <strong>Prawo do sprzeciwu</strong> (Art. 21) – możesz sprzeciwić się przetwarzaniu danych opartemu na
          prawnie uzasadnionym interesie.
        </li>
        <li className="list-disc mx-8">
          <strong>Prawo do cofnięcia zgody</strong> – w każdej chwili możesz cofnąć zgodę na przetwarzanie danych, co
          nie wpływa na zgodność z prawem przetwarzania przed jej cofnięciem.
        </li>
      </ul>
      <p className="text-base xs:text-lg text-zinc-800 mt-4">
        Aby skorzystać z powyższych praw, skontaktuj się z nami pod adresem:{' '}
        <Link
          href="mailto:wolfmededu@gmail.com"
          target="_blank"
          className="hover:text-red-500 transition-colors text-blue-400"
        >
          wolfmededu@gmail.com
        </Link>
        . Odpowiemy na Twoje żądanie w ciągu 30 dni.
      </p>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Prawo do skargi</h2>
      <p className="text-base xs:text-lg text-zinc-800">
        Jeśli uważasz, że przetwarzanie Twoich danych osobowych narusza przepisy RODO, masz prawo wnieść skargę do
        organu nadzorczego:
      </p>
      <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 mt-3">
        <p className="font-semibold text-zinc-800">Prezes Urzędu Ochrony Danych Osobowych (UODO)</p>
        <p className="text-sm text-zinc-600">ul. Stawki 2, 00-193 Warszawa</p>
        <p className="text-sm text-zinc-600">
          Strona:{' '}
          <Link
            href="https://uodo.gov.pl"
            target="_blank"
            className="hover:text-red-500 transition-colors text-blue-400"
          >
            https://uodo.gov.pl
          </Link>
        </p>
      </div>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Zbiorcze statystyki</h2>
      <p className="text-base xs:text-lg text-zinc-800">
        Wolfmed Edukacja może zbierać statystyki dotyczące zachowania użytkowników na swojej stronie internetowej.
        Informacje te mogą być publicznie udostępniane lub przekazywane innym podmiotom. Jednak Wolfmed Edukacja nie
        ujawnia danych osobowych, chyba że jest to opisane w dalszej części dokumentu.
      </p>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Ochrona danych osobowych</h2>
      <p className="text-base xs:text-lg text-zinc-800">
        Wolfmed Edukacja ujawnia potencjalnie identyfikujące oraz osobiste dane jedynie swoim pracownikom, kontrahentom
        i organizacjom stowarzyszonym, które (i) muszą mieć dostęp do tych danych w celu ich przetwarzania lub
        świadczenia usług dostępnych w ramach aplikacji Wolfmed Edukacja, oraz (ii) zgodziły się na zachowanie
        poufności. Niektóre z tych podmiotów mogą znajdować się poza granicami twojego kraju. Korzystając z aplikacji
        Wolfmed Edukacja, zgadzasz się na przekazanie im takich informacji. Wolfmed Edukacja nie sprzedaje ani nie
        wynajmuje takich danych innym podmiotom. Poza wyżej wymienionymi przypadkami dane mogą być ujawnione tylko w
        odpowiedzi na wezwanie sądowe, nakaz sądowy lub inne żądanie władz, bądź gdy Wolfmed Edukacja w dobrej wierze
        uznaje, że ujawnienie jest konieczne dla ochrony praw i mienia aplikacji, osób trzecich lub szeroko pojętego
        interesu publicznego. Zarejestrowani użytkownicy aplikacji mogą być od czasu do czasu informowani o nowych
        funkcjach, poproszeni o opinię lub informowani o aktualnościach. W przypadku przesłania nam prośby (np.
        mailowej), zastrzegamy sobie prawo do jej opublikowania, aby lepiej odpowiedzieć na pytanie lub pomóc innym
        użytkownikom. Wolfmed Edukacja podejmuje wszelkie kroki, aby chronić dane osobowe przed nieautoryzowanym
        dostępem, zmianą, użyciem lub zniszczeniem.
      </p>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Usunięcie konta</h2>
      <p className="text-base xs:text-lg text-zinc-800">
        Możesz przestać korzystać z naszej aplikacji, usuwając swoje konto za pomocą funkcji dostępnej w Wolfmed
        Edukacja. Po usunięciu konta wszystkie powiązane dane zostaną trwale usunięte. W przypadku zakupu kursów,
        usunięcie konta nie wpływa na wcześniejsze transakcje (które przechowujemy zgodnie z wymogami prawnymi).
        Użytkownik, który usunie konto, traci dostęp do zakupionych kursów i materiałów. Pamiętaj, że usunięcie konta
        wiąże się z utratą możliwości korzystania z naszej aplikacji.
      </p>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Odzyskiwanie danych na żądanie</h2>
      <p className="text-base xs:text-lg text-zinc-800">
        Możesz przestać korzystać z naszej aplikacji, usuwając swoje konto w Wolfmed Edukacja. Dla kont, które zostały
        zablokowane, wszystkie powiązane dane zostaną trwale usunięte po 60 dniach od daty blokady. Nie realizujemy
        próśb o odzyskanie treści z kont zablokowanych, w tym treści niezgodnych z naszymi zasadami. Dla regularnych
        kont przechowujemy jedynie podstawowe dane, takie jak adres e-mail. Jeśli potrzebujesz dostępu do tych danych,
        skontaktuj się z naszym zespołem wsparcia.
      </p>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Cookies (Pliki cookie)</h2>
      <p className="text-base xs:text-lg text-zinc-800 mb-4">
        Ciasteczka (z angielskiego cookies) to pliki przechowywane na komputerze użytkownika, które przeglądarka wysyła
        przy każdej kolejnej wizycie. Wolfmed Edukacja korzysta z ciasteczek do identyfikacji użytkowników oraz do
        zarządzania preferencjami dostępu do strony.
      </p>
      <p className="text-base xs:text-lg text-zinc-800 mb-4">
        <strong>Przy pierwszej wizycie na naszej stronie wyświetlamy banner z informacją o plikach cookie</strong>,
        który pozwala Ci wybrać, na jakie kategorie plików cookie wyrażasz zgodę. Możesz zmienić swoje preferencje w
        dowolnym momencie, klikając link &quot;Ustawienia cookies&quot; w stopce strony.
      </p>
      <ul className="text-base xs:text-lg sm:text-xl text-zinc-700 leading-7 flex flex-col gap-4">
        <li className="list-disc mx-8">
          <strong>Ściśle niezbędne pliki cookie:</strong> Używane do zapewnienia usług dostępnych na naszej stronie, w
          tym logowania i dostępu do zabezpieczonych obszarów. Te ciasteczka są dostarczane przez Clerk, nasz dostawca
          uwierzytelniania, i są niezbędne do korzystania z podstawowych funkcji strony. Nie można ich odmówić.
        </li>
        <li className="list-disc mx-8">
          <strong>Ciasteczka Wydajnościowe/Analityczne:</strong> Używane do lepszego zrozumienia zachowań użytkowników i
          poprawy naszej strony. Nasza strona korzysta z Google Analytics (tylko za Twoją zgodą). Informacje zbierane
          przez Google (w tym anonimizowany adres IP) są przesyłane i przechowywane na ich serwerach. Czas
          przechowywania ciasteczek Google Analytics wynosi do dwóch lat.
        </li>
      </ul>
      <p className="text-base xs:text-lg text-zinc-800 mt-4">
        Użytkownicy, którzy nie chcą, aby ciasteczka były przechowywane na ich komputerach, powinni ustawić przeglądarki
        tak, aby odrzucały ciasteczka. Należy jednak pamiętać, że niektóre funkcje aplikacji mogą działać nieprawidłowo
        bez pomocy ciasteczek. Więcej informacji o ciasteczkach można znaleźć na stronie{' '}
        <Link
          href="https://pl.wikipedia.org/wiki/HTTP_cookie"
          target="_blank"
          className="hover:text-red-500 transition-colors text-blue-400"
        >
          Wikipedia
        </Link>
      </p>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Transfery biznesowe</h2>
      <p className="text-base xs:text-lg text-zinc-800">
        W przypadku przejęcia Wolfmed Edukacja lub znacznej części jej aktywów, lub w przypadku, gdy Wolfmed Edukacja
        zbankrutuje lub zakończy działalność, informacje o użytkownikach będą jednym z aktywów, które mogą zostać
        przeniesione lub nabyte przez stronę trzecią. Użytkownik przyjmuje do wiadomości, że takie transfery mogą mieć
        miejsce, a każdy nabywca Wolfmed Edukacja może kontynuować korzystanie z jego danych osobowych zgodnie z
        postanowieniami niniejszej polityki.
      </p>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Reklamy</h2>
      <p className="text-base xs:text-lg text-zinc-800">
        Nie prowadzimy żadnych zewnętrznych reklam na platformie Wolfmed Edukacja i nie korzystamy z żadnych sieci
        reklamowych. Niniejsza Polityka Prywatności dotyczy użycia plików cookie przez Wolfmed Edukacja i nie obejmuje
        użycia plików cookie przez żadnych reklamodawców.
      </p>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Użytkownicy Międzynarodowi</h2>
      <p className="text-base xs:text-lg text-zinc-800">
        Wolfmed Edukacja działa w Europie. Jeśli uzyskujesz dostęp do naszych usług z Europejskiego Obszaru
        Gospodarczego, pamiętaj, że Twoje dane osobowe będą przesyłane na nasze serwery i mogą być przekazywane naszym
        dostawcom usług wspierającym naszą działalność. Działając zgodnie z przepisami RODO, zapewnimy, że Twoje dane
        osobowe będą miały odpowiedni poziom ochrony, gdzie są przetwarzane, a Twoje prawa będą chronione. Przekazując
        swoje informacje do naszych usług, zgadzasz się na transfer swoich danych i ich przetwarzanie zgodnie z tą
        Polityką Prywatności.
      </p>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Zmiany w Polityce Prywatności</h2>
      <p className="text-base xs:text-lg text-zinc-800">
        Chociaż większość zmian będzie prawdopodobnie niewielka, Wolfmed Edukacja może od czasu do czasu aktualizować
        swoją Politykę Prywatności według własnego uznania. Zachęcamy użytkowników do regularnego sprawdzania tej strony
        w celu zapoznania się z ewentualnymi zmianami. Jeśli masz konto w Wolfmed Edukacja, możesz również otrzymać
        powiadomienie informujące o tych zmianach. Kontynuowanie korzystania z naszego serwisu po wprowadzeniu
        jakichkolwiek zmian w Polityce Prywatności będzie oznaczać akceptację tych zmian.
      </p>

      <h2 className="text-xl xs:text-2xl sm:text-3xl font-semibold mt-10 mb-3">Inne Warunki i Zasady</h2>
      <p className="text-base xs:text-lg text-zinc-800">
        Korzystanie z usług Wolfmed Edukacja podlega dodatkowym warunkom mającym zastosowanie do tych usług, które mogą
        być okresowo publikowane w Warunkach użytkowania z serwisu, w tym bez ograniczeń, Warunkom z Wolfmed Edukacja
        dostępnych na stronie:{' '}
        <Link
          href={`${process.env.NEXT_PUBLIC_APP_URL}/warunki`}
          target="_blank"
          className="hover:text-red-500 transition-colors text-blue-400"
        >
          {`${process.env.NEXT_PUBLIC_APP_URL}/warunki`}
        </Link>
      </p>
      <p className="text-base xs:text-lg text-zinc-800 mt-3">
        Zgadzając się na naszą Politykę Prywatności, zgadzasz się również na Politykę Prywatności Google dla usług, z
        których korzystamy (Google Analytics), naszego dostawcy autoryzacji Clerk, oraz procesora płatności Stripe.
      </p>

      <div className="mt-8 pt-6 border-t border-zinc-200 text-sm text-zinc-500">
        <p>Ostatnia aktualizacja: Styczeń 2026</p>
      </div>
    </div>
  )
}
