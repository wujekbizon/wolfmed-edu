import React from 'react'

const LegalCompliance = () => {
  return (
    <div id="legal-compliance" className="h-full w-full bg-white flex flex-col p-4 sm:p-8 md:p-12 gap-2 rounded-2xl">
      <h2 className="text-xl xs:text-2xl font-bold mb-8">
        Lista Kontrolna Zgodności Prawnej dla Użytkowników Wolfmed Edukacja
      </h2>
      <p className="text-base xs:text-lg text-zinc-800">
        1. Akceptacja Regulaminu
        <br />
        Korzystając z Wolfmed Edukacja, przyznajesz, że przeczytałeś i zaakceptowałeś nasz Regulamin.
      </p>
      <p className="text-base xs:text-lg text-zinc-800">
        2. Świadomość Polityki Prywatności
        <br />
        Jesteś świadomy i zgadzasz się z naszą Polityką Prywatności, która opisuje, jak zbieramy, używamy i chronimy
        Twoje dane osobowe.
      </p>
      <p className="text-base xs:text-lg text-zinc-800">
        3. Zgodność z RODO
        <br />
        Korzystając z naszej aplikacji, wyrażasz zgodę na przetwarzanie swoich danych osobowych zgodnie z regulacjami
        RODO.
      </p>
      <p className="text-base xs:text-lg text-zinc-800">
        4. Obowiązki Użytkowników
        <br />
        Zgadzasz się korzystać z aplikacji w sposób zgodny z prawem oraz szanować prawa innych użytkowników i
        integralność platformy.
      </p>
      <p className="text-base xs:text-lg text-zinc-800">
        5. Prawo do Dostępu i Modyfikacji Danych
        <br />
        Jesteś świadomy swoich praw dotyczących danych osobowych, w tym prawa do dostępu, modyfikacji i usunięcia swoich
        danych.
      </p>
      <p className="text-base xs:text-lg text-zinc-800">
        6. Preferencje Komunikacyjne
        <br />
        Rozumiesz, że możesz otrzymywać komunikaty od nas dotyczące swojego konta i usług.
      </p>
    </div>
  )
}

export default LegalCompliance
