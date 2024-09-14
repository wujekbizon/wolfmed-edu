import { Test } from '@/types/dataTypes'

export const loadingTestData: Test[] = [
  {
    id: '1',
    category: 'medical',
    data: {
      question:
        'Jednym z ogólnych zaleceń dotyczących diety osób z kamicą pęcherzyka żółciowego jest zwiększenie spożycia błonnika pokarmowego. Jednak w zaostrzeniu kamicy żółciowej stosuje się dietę łatwostrawną, niskotłuszczową z ograniczeniem produktów bogatych w:',
      answers: [
        { option: 'węglowodany', isCorrect: false },
        { option: 'białko', isCorrect: false },
        { option: 'błonnik', isCorrect: true },
      ],
    },
  },
  {
    id: '2',
    category: 'medical',
    data: {
      question:
        'Literatura podaje, że przestrzeń nas otaczająca dzieli się na 4 strefy: strefę intymną, osobistą, społeczną i publiczną. Najbliższą dla nas strefą zarezerwowaną dla osób najbliższych jest strefa:',
      answers: [
        { option: 'publiczna;', isCorrect: false },
        { option: 'osobista;', isCorrect: false },
        { option: 'bintymna.', isCorrect: true },
      ],
    },
  },
  {
    id: '3',
    category: 'medical',
    data: {
      question:
        'Według skali Lawtona używanie telefonu, robienie zakupów, przygotowywanie posiłków,codzienne porządki, panie, korzystanie ze środków transportu, przyjmowanie leków, rozporządzanie swoimi pieniędzmi należy do:',
      answers: [
        { option: 'Podstawowych czynności życia codziennego;', isCorrect: false },
        { option: 'Zawansowanych (instrumentalnych)czynności życia codziennego;', isCorrect: true },
        { option: 'Zależy od wieku pacjenta;', isCorrect: false },
      ],
    },
  },
]
