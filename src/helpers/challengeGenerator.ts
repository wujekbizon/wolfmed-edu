'use server'

import type { Procedure } from '@/types/dataTypes'
import type {
  QuizChallenge,
  VisualRecognitionChallenge,
  SpotErrorChallenge,
  ScenarioChallenge,
  QuizQuestion,
} from '@/types/challengeTypes'
import { ErrorCategory } from '@/types/challengeTypes'

/**
 * Generate quiz questions from procedure algorithm steps with diverse question types
 */
export async function generateQuizChallenge(procedure: Procedure): Promise<QuizChallenge> {
  const algorithm = procedure.data.algorithm
  const questions: QuizQuestion[] = []

  // Generate 5-10 questions based on the steps
  const numQuestions = Math.min(10, Math.max(5, algorithm.length))
  const stepIndices = getRandomIndices(algorithm.length, numQuestions)

  // Question type templates for variety
  type QuestionTemplate = {
    question: string
    isStandard: boolean
    customOptions?: string[]
    correctAnswer?: number
  }

  const questionTemplates: Array<(index: number, step: string) => QuestionTemplate | null> = [
    // Standard "what to do" questions
    (index: number, step: string): QuestionTemplate => ({
      question: `Co należy zrobić w kroku ${index + 1} procedury?`,
      isStandard: true,
    }),
    // "Why" questions - educational
    (index: number, step: string): QuestionTemplate | null => {
      if (step.toLowerCase().includes('zdezynfekuj') || step.toLowerCase().includes('myj')) {
        return {
          question: `Dlaczego ważna jest dezynfekcja/mycie rąk w procedurze "${procedure.data.name}"?`,
          customOptions: [
            'Aby zapobiec zakażeniom i chronić pacjenta',
            'Aby sprzęt wyglądał czysto',
            'To opcjonalny krok',
            'Tylko dla komfortu personelu'
          ],
          correctAnswer: 0,
          isStandard: false,
        }
      }
      return null
    },
    // "When" questions - sequencing
    (index: number, step: string): QuestionTemplate | null => {
      if (index > 0 && index < algorithm.length - 1) {
        const prevStep = algorithm[index - 1]
        const nextStep = algorithm[index + 1]
        if (prevStep && nextStep) {
          return {
            question: `Kiedy należy wykonać: "${step}"?`,
            customOptions: [
              `Po: "${prevStep.step.substring(0, 50)}..."`,
              `Przed: "${prevStep.step.substring(0, 50)}..."`,
              'Na początku procedury',
              'Na końcu procedury'
            ],
            correctAnswer: 0,
            isStandard: false,
          }
        }
      }
      return null
    },
    // "What if" questions - critical thinking
    (index: number, step: string): QuestionTemplate | null => {
      if (step.toLowerCase().includes('zgodę') || step.toLowerCase().includes('tożsamość')) {
        return {
          question: `Co może się stać, jeśli pominiesz sprawdzenie tożsamości lub zgodę pacjenta?`,
          customOptions: [
            'Ryzyko pomyłki pacjenta i konsekwencje prawne',
            'Nic się nie stanie',
            'Procedura będzie szybsza',
            'Pacjent będzie bardziej zadowolony'
          ],
          correctAnswer: 0,
          isStandard: false,
        }
      }
      return null
    },
    // Order questions
    (index: number, step: string): QuestionTemplate | null => {
      if (step.toLowerCase().includes('przed') || step.toLowerCase().includes('najpierw')) {
        return {
          question: `Jaka jest prawidłowa kolejność działań w tym kroku?`,
          isStandard: true,
        }
      }
      return null
    },
  ]

  stepIndices.forEach((index, questionIndex) => {
    const currentStep = algorithm[index]
    if (!currentStep) return
    const correctStepText = currentStep.step

    // Try to generate a varied question type
    const templateIndex = questionIndex % questionTemplates.length
    const template = questionTemplates[templateIndex]
    const customQuestion = template ? template(index, correctStepText) : null

    if (customQuestion && !customQuestion.isStandard && customQuestion.customOptions && customQuestion.correctAnswer !== undefined) {
      // Use custom question with predefined options
      questions.push({
        id: `quiz-${questionIndex}`,
        question: customQuestion.question,
        options: customQuestion.customOptions,
        correctAnswer: customQuestion.correctAnswer,
        explanation: `Ta wiedza jest kluczowa dla bezpiecznego wykonania procedury "${procedure.data.name}".`,
      })
    } else {
      // Generate standard question
      const wrongOptions = generateWrongOptions(algorithm, index, 3)
      const correctAnswerIndex = Math.floor(Math.random() * 4)
      const options = [...wrongOptions.slice(0, correctAnswerIndex), correctStepText, ...wrongOptions.slice(correctAnswerIndex)]

      const questionText = customQuestion?.question || `Co należy zrobić w kroku ${index + 1} procedury?`

      questions.push({
        id: `quiz-${questionIndex}`,
        question: questionText,
        options: options.slice(0, 4),
        correctAnswer: correctAnswerIndex,
        explanation: `Prawidłowa odpowiedź: ${correctStepText}`,
      })
    }
  })

  return {
    procedureId: procedure.id,
    procedureName: procedure.data.name,
    questions,
  }
}

/**
 * Generate visual recognition challenge
 */
export async function generateVisualRecognitionChallenge(procedure: Procedure, allProcedures: Procedure[]): Promise<VisualRecognitionChallenge> {
  // Filter out the current procedure to get distractors
  const otherProcedures = allProcedures.filter(p => p.id !== procedure.id)

  // Randomly select 3 other procedures as distractors
  const distractorIndices = getRandomIndices(otherProcedures.length, Math.min(3, otherProcedures.length))
  const distractors = distractorIndices
    .map(i => otherProcedures[i]?.data.name)
    .filter((name): name is string => !!name)

  // Randomize the position of the correct answer
  const correctAnswerIndex = Math.floor(Math.random() * 4)
  const options = [...distractors.slice(0, correctAnswerIndex), procedure.data.name, ...distractors.slice(correctAnswerIndex)]

  return {
    procedureId: procedure.id,
    procedureName: procedure.data.name,
    image: procedure.data.image,
    question: `Którą procedurę przedstawia poniższy obraz?`,
    options: options.slice(0, 4),
    correctAnswer: correctAnswerIndex,
  }
}

/**
 * Generate spot the error challenge with categorized errors
 */
export async function generateSpotErrorChallenge(procedure: Procedure): Promise<SpotErrorChallenge> {
  const algorithm = procedure.data.algorithm
  const steps: Array<{
    id: string
    step: string
    isCorrect: boolean
    errorCategory?: ErrorCategory
    explanation?: string
  }> = algorithm.map((step, index) => ({
    id: `step-${index}`,
    step: step.step,
    isCorrect: true,
  }))

  // Introduce 2-3 errors by modifying random steps
  // For longer procedures, introduce more errors
  const numErrors = Math.min(4, Math.max(2, Math.floor(algorithm.length / 5)))
  const errorIndices = getRandomIndices(algorithm.length, numErrors)

  errorIndices.forEach((index) => {
    const step = steps[index]
    const algorithmStep = algorithm[index]
    if (!step || !algorithmStep) return

    const errorResult = introduceError(step.step)
    step.isCorrect = false
    step.step = errorResult.modifiedStep
    step.errorCategory = errorResult.category
    step.explanation = `Błąd: To nie jest prawidłowy krok. Powinno być: "${algorithmStep.step}"`
  })

  return {
    procedureId: procedure.id,
    procedureName: procedure.data.name,
    steps,
  }
}

/**
 * Generate scenario-based challenge with realistic clinical situations
 */
export async function generateScenarioChallenge(procedure: Procedure): Promise<ScenarioChallenge> {
  const algorithm = procedure.data.algorithm

  // Scenario templates for variety and realism
  const scenarioTemplates = [
    {
      scenario: `Jesteś na nocnym dyżurze. Pacjent wymaga pilnego wykonania procedury: "${procedure.data.name}". Przygotowałeś wszystkie niezbędne materiały i znajdujesz się przy łóżku pacjenta. Pacjent jest nieco zaniepokojony.`,
      stepRange: 'early', // Focus on early steps
    },
    {
      scenario: `Jesteś w trakcie wykonywania procedury "${procedure.data.name}". Pacjent jest współpracujący i wszystko przebiega zgodnie z planem. Właśnie ukończyłeś wstępne przygotowania.`,
      stepRange: 'middle', // Focus on middle steps
    },
    {
      scenario: `Wykonujesz procedurę "${procedure.data.name}". Jesteś w kluczowym momencie procedury, który wymaga szczególnej uwagi i precyzji.`,
      stepRange: 'critical', // Focus on critical middle steps
    },
    {
      scenario: `Zbliżasz się do końca procedury "${procedure.data.name}". Pacjent czuje się dobrze i współpracuje. Co powinieneś zrobić, aby prawidłowo zakończyć procedurę?`,
      stepRange: 'late', // Focus on ending steps
    },
  ]

  // Select random scenario template
  const template = scenarioTemplates[Math.floor(Math.random() * scenarioTemplates.length)]
  if (!template) throw new Error('No scenario template found')

  // Select step based on scenario type
  let criticalStepIndex: number
  switch (template.stepRange) {
    case 'early':
      criticalStepIndex = Math.floor(algorithm.length * 0.25) // First quarter
      break
    case 'middle':
      criticalStepIndex = Math.floor(algorithm.length * 0.5) // Middle
      break
    case 'critical':
      criticalStepIndex = Math.floor(algorithm.length * 0.6) // Slightly past middle
      break
    case 'late':
      criticalStepIndex = Math.floor(algorithm.length * 0.75) // Last quarter
      break
    default:
      criticalStepIndex = Math.floor(algorithm.length / 2)
  }

  const criticalStep = algorithm[criticalStepIndex]
  if (!criticalStep) throw new Error('No critical step found')
  const correctStep = criticalStep.step

  // Generate more realistic wrong options
  const wrongOptions: string[] = []

  // Add a step from before (common mistake - doing things out of order)
  if (criticalStepIndex > 0) {
    const prevStep = algorithm[criticalStepIndex - 2]
    if (prevStep) wrongOptions.push(prevStep.step)
  }

  // Add a step from after (another sequencing mistake)
  if (criticalStepIndex < algorithm.length - 1) {
    const nextStep = algorithm[criticalStepIndex + 2]
    if (nextStep) wrongOptions.push(nextStep.step)
  }

  // Add contextual wrong options
  const contextualWrongOptions = [
    'Poproś kolegę o pomoc i poczekaj',
    'Przerwij procedurę i skonsultuj się z lekarzem',
    'Pomiń ten krok i przejdź do następnego',
    'Zmodyfikuj procedurę według własnego uznania',
  ]

  // Fill remaining slots with contextual wrong options
  while (wrongOptions.length < 3) {
    const randomWrong = contextualWrongOptions[Math.floor(Math.random() * contextualWrongOptions.length)]
    if (randomWrong && !wrongOptions.includes(randomWrong)) {
      wrongOptions.push(randomWrong)
    }
  }

  // Randomize correct answer position
  const correctAnswerIndex = Math.floor(Math.random() * 4)
  const options = [...wrongOptions.slice(0, correctAnswerIndex), correctStep, ...wrongOptions.slice(correctAnswerIndex)]

  return {
    procedureId: procedure.id,
    procedureName: procedure.data.name,
    scenario: template.scenario,
    question: `Co powinieneś zrobić w tym momencie?`,
    options: options.slice(0, 4),
    correctAnswer: correctAnswerIndex,
    explanation: `Prawidłowa odpowiedź: "${correctStep}". W tym momencie procedury to działanie jest kluczowe dla bezpieczeństwa pacjenta i prawidłowego wykonania "${procedure.data.name}".`,
  }
}

// Helper functions

/**
 * Get random unique indices from an array
 */
function getRandomIndices(arrayLength: number, count: number): number[] {
  const indices = Array.from({ length: arrayLength }, (_, i) => i)
  const selected: number[] = []

  for (let i = 0; i < count && indices.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * indices.length)
    const selectedIndex = indices[randomIndex]
    if (selectedIndex !== undefined) {
      selected.push(selectedIndex)
    }
    indices.splice(randomIndex, 1)
  }

  return selected.sort((a, b) => a - b)
}

/**
 * Generate wrong options for quiz questions
 */
function generateWrongOptions(algorithm: { step: string }[], correctIndex: number, count: number): string[] {
  const options: string[] = []
  const usedIndices = new Set([correctIndex])

  while (options.length < count && usedIndices.size < algorithm.length) {
    const randomIndex = Math.floor(Math.random() * algorithm.length)

    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex)
      const step = algorithm[randomIndex]
      if (step) {
        options.push(step.step)
      }
    }
  }

  // If we don't have enough unique steps, add generic wrong options
  while (options.length < count) {
    options.push(`Krok niepowiązany z procedurą (opcja ${options.length + 1})`)
  }

  return options
}

/**
 * Introduce a medically meaningful error into a step
 * Returns both the modified step and the error category for educational feedback
 */
function introduceError(step: string): { modifiedStep: string; category: ErrorCategory } {
  const lowerStep = step.toLowerCase()

  // SAFETY VIOLATIONS - Most critical errors
  if (lowerStep.includes('zdezynfekuj') || lowerStep.includes('umyj') || lowerStep.includes('myj')) {
    return {
      modifiedStep: step.replace(/zdezynfekuj|umyj|myj/gi, 'pomiń dezynfekcję'),
      category: ErrorCategory.SAFETY
    }
  }

  if (lowerStep.includes('tożsamość') || lowerStep.includes('sprawdź tożsamość')) {
    return {
      modifiedStep: step.replace(/sprawdź tożsamość pacjenta/gi, 'zakładamy znajomość pacjenta'),
      category: ErrorCategory.SAFETY
    }
  }

  if (lowerStep.includes('zgodę pacjenta') || lowerStep.includes('uzyskaj zgodę')) {
    return {
      modifiedStep: step.replace(/uzyskaj zgodę/gi, 'pomiń pozyskanie zgody'),
      category: ErrorCategory.SAFETY
    }
  }

  if (lowerStep.includes('rękawiczki')) {
    if (lowerStep.includes('zdejmij')) {
      // Don't modify removal steps
      return {
        modifiedStep: step + ' (można pozostawić na ręku)',
        category: ErrorCategory.SAFETY
      }
    }
    return {
      modifiedStep: step.replace(/rękawiczki/gi, 'ręce bez rękawiczek'),
      category: ErrorCategory.SAFETY
    }
  }

  // SEQUENCE ERRORS - Wrong order or timing
  if (lowerStep.includes('od góry ku dołowi')) {
    return {
      modifiedStep: step.replace(/od góry ku dołowi/gi, 'od dołu ku górze'),
      category: ErrorCategory.SEQUENCE
    }
  }

  if (lowerStep.includes('od dołu ku górze')) {
    return {
      modifiedStep: step.replace(/od dołu ku górze/gi, 'od góry ku dołowi'),
      category: ErrorCategory.SEQUENCE
    }
  }

  if (lowerStep.includes('przed') && !lowerStep.includes('przed zabrudzeniem')) {
    return {
      modifiedStep: step.replace(/przed/gi, 'po'),
      category: ErrorCategory.SEQUENCE
    }
  }

  if (lowerStep.includes('najpierw') || lowerStep.includes('w pierwszej kolejności')) {
    return {
      modifiedStep: step.replace(/najpierw|w pierwszej kolejności/gi, 'na końcu'),
      category: ErrorCategory.SEQUENCE
    }
  }

  // TECHNIQUE ERRORS - Wrong technique
  if (lowerStep.includes('delikatnie')) {
    return {
      modifiedStep: step.replace(/delikatnie/gi, 'energicznie i szybko'),
      category: ErrorCategory.TECHNIQUE
    }
  }

  if (lowerStep.includes('lekko') && lowerStep.includes('dociskając')) {
    return {
      modifiedStep: step.replace(/lekko dociskając/gi, 'mocno naciskając'),
      category: ErrorCategory.TECHNIQUE
    }
  }

  if (lowerStep.includes('ciepłą') || lowerStep.includes('ciepła')) {
    return {
      modifiedStep: step.replace(/ciepłą|ciepła/gi, 'zimną'),
      category: ErrorCategory.TECHNIQUE
    }
  }

  if (lowerStep.includes('osusz')) {
    return {
      modifiedStep: step.replace(/osusz/gi, 'pozostaw mokrą'),
      category: ErrorCategory.TECHNIQUE
    }
  }

  // MEASUREMENT ERRORS - Wrong sizes, amounts, times
  if (lowerStep.match(/\d+-\d+ mm/)) {
    return {
      modifiedStep: step.replace(/(\d+)-(\d+) mm/g, (match, p1, p2) => {
        const num1 = parseInt(p1)
        const num2 = parseInt(p2)
        return `${num1 + 5}-${num2 + 5} mm`
      }),
      category: ErrorCategory.MEASUREMENT
    }
  }

  if (lowerStep.match(/\d+-\d+ (godzin|minut|sekund)/)) {
    return {
      modifiedStep: step.replace(/(\d+)-(\d+)/g, (match, p1, p2) => {
        const num1 = parseInt(p1)
        return `${num1 * 2}-${num1 * 3}`
      }),
      category: ErrorCategory.MEASUREMENT
    }
  }

  if (lowerStep.match(/\d+ ml/)) {
    return {
      modifiedStep: step.replace(/(\d+) ml/g, (match, p1) => {
        const num = parseInt(p1)
        return `${num * 2} ml`
      }),
      category: ErrorCategory.MEASUREMENT
    }
  }

  // CRITICAL OMISSIONS - Skipping important parts
  if (lowerStep.includes('upewnij się') || lowerStep.includes('sprawdź')) {
    return {
      modifiedStep: step.replace(/upewnij się|sprawdź/gi, 'pomiń sprawdzenie'),
      category: ErrorCategory.OMISSION
    }
  }

  if (lowerStep.includes('uporządkuj') || lowerStep.includes('posprzątaj')) {
    return {
      modifiedStep: step + ' (można posprzątać później)',
      category: ErrorCategory.OMISSION
    }
  }

  if (lowerStep.includes('odnotuj') || lowerStep.includes('zapisz')) {
    return {
      modifiedStep: step.replace(/odnotuj|zapisz/gi, 'zapamiętaj'),
      category: ErrorCategory.OMISSION
    }
  }

  // CONTRAINDICATED ACTIONS - Explicitly wrong procedures
  if (lowerStep.includes('nie wolno') || lowerStep.includes('nie należy')) {
    return {
      modifiedStep: step.replace(/nie wolno|nie należy/gi, 'można bezpiecznie'),
      category: ErrorCategory.SAFETY
    }
  }

  if (lowerStep.includes('pamiętaj') && lowerStep.includes(':')) {
    return {
      modifiedStep: step.replace(/pamiętaj:/gi, 'opcjonalnie:'),
      category: ErrorCategory.OMISSION
    }
  }

  // Generic fallback errors - use TECHNIQUE as default category
  const genericErrors = [
    () => ({ modifiedStep: step + ' (jeśli jest czas)', category: ErrorCategory.OMISSION }),
    () => ({ modifiedStep: step.replace(/należy/gi, 'opcjonalnie należy'), category: ErrorCategory.OMISSION }),
    () => ({ modifiedStep: step + ' Można pominąć w razie potrzeby.', category: ErrorCategory.OMISSION }),
    () => ({ modifiedStep: step.replace(/zawsze/gi, 'czasami'), category: ErrorCategory.TECHNIQUE }),
    () => ({ modifiedStep: step.replace(/nigdy/gi, 'czasami'), category: ErrorCategory.TECHNIQUE }),
  ]

  const randomError = genericErrors[Math.floor(Math.random() * genericErrors.length)]
  return randomError ? randomError() : { modifiedStep: step + ' (opcjonalnie)', category: ErrorCategory.OMISSION }
}
