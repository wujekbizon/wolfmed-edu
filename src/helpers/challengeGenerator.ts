import type { Procedure } from '@/types/dataTypes'
import type {
  QuizChallenge,
  VisualRecognitionChallenge,
  SpotErrorChallenge,
  ScenarioChallenge,
  QuizQuestion,
} from '@/types/challengeTypes'

/**
 * Generate quiz questions from procedure algorithm steps
 */
export function generateQuizChallenge(procedure: Procedure): QuizChallenge {
  const algorithm = procedure.data.algorithm
  const questions: QuizQuestion[] = []

  // Generate questions from algorithm steps
  // We'll create 5-10 questions based on the steps
  const numQuestions = Math.min(10, Math.max(5, algorithm.length))
  const stepIndices = getRandomIndices(algorithm.length, numQuestions)

  stepIndices.forEach((index, questionIndex) => {
    const currentStep = algorithm[index]
    const correctStepText = currentStep.step

    // Generate wrong options by using other steps or variations
    const wrongOptions = generateWrongOptions(algorithm, index, 3)

    // Randomize the position of the correct answer
    const correctAnswerIndex = Math.floor(Math.random() * 4)
    const options = [...wrongOptions.slice(0, correctAnswerIndex), correctStepText, ...wrongOptions.slice(correctAnswerIndex)]

    questions.push({
      id: `quiz-${questionIndex}`,
      question: `Co należy zrobić w kroku ${index + 1} procedury "${procedure.data.name}"?`,
      options: options.slice(0, 4),
      correctAnswer: correctAnswerIndex,
      explanation: `Prawidłowa odpowiedź: ${correctStepText}`,
    })
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
export function generateVisualRecognitionChallenge(procedure: Procedure): VisualRecognitionChallenge {
  // Use the procedure's image for visual recognition
  return {
    procedureId: procedure.id,
    procedureName: procedure.data.name,
    image: procedure.data.image,
    question: `Którą procedurę przedstawia poniższy obraz?`,
    options: [procedure.data.name, 'Inna procedura 1', 'Inna procedura 2', 'Inna procedura 3'],
    correctAnswer: 0,
  }
}

/**
 * Generate spot the error challenge
 */
export function generateSpotErrorChallenge(procedure: Procedure): SpotErrorChallenge {
  const algorithm = procedure.data.algorithm
  const steps = algorithm.map((step, index) => ({
    id: `step-${index}`,
    step: step.step,
    isCorrect: true,
    explanation: undefined,
  }))

  // Introduce 2-3 errors by modifying random steps
  const numErrors = Math.min(3, Math.max(2, Math.floor(algorithm.length / 5)))
  const errorIndices = getRandomIndices(algorithm.length, numErrors)

  errorIndices.forEach((index) => {
    steps[index].isCorrect = false
    steps[index].step = introduceError(steps[index].step)
    steps[index].explanation = `Błąd: To nie jest prawidłowy krok. Powinno być: ${algorithm[index].step}`
  })

  return {
    procedureId: procedure.id,
    procedureName: procedure.data.name,
    steps,
  }
}

/**
 * Generate scenario-based challenge
 */
export function generateScenarioChallenge(procedure: Procedure): ScenarioChallenge {
  const algorithm = procedure.data.algorithm

  // Create a clinical scenario
  const scenario = `Pacjent wymaga wykonania procedury: "${procedure.data.name}". Przygotowałeś wszystkie niezbędne materiały i znajdujesz się przy łóżku pacjenta.`

  // Pick a random critical step from the middle of the algorithm
  const criticalStepIndex = Math.floor(algorithm.length / 2)
  const correctStep = algorithm[criticalStepIndex].step

  // Generate plausible but incorrect options
  const wrongOptions = [
    algorithm[Math.max(0, criticalStepIndex - 2)]?.step || 'Rozpocznij od końca procedury',
    algorithm[Math.min(algorithm.length - 1, criticalStepIndex + 2)]?.step || 'Pomiń ten krok',
    'Zapytaj innego pracownika o opinię',
  ]

  const correctAnswerIndex = Math.floor(Math.random() * 4)
  const options = [...wrongOptions.slice(0, correctAnswerIndex), correctStep, ...wrongOptions.slice(correctAnswerIndex)]

  return {
    procedureId: procedure.id,
    procedureName: procedure.data.name,
    scenario,
    question: `Co powinieneś zrobić w tym momencie?`,
    options: options.slice(0, 4),
    correctAnswer: correctAnswerIndex,
    explanation: `Prawidłowa odpowiedź: ${correctStep}`,
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
    selected.push(indices[randomIndex])
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
      options.push(algorithm[randomIndex].step)
    }
  }

  // If we don't have enough unique steps, add generic wrong options
  while (options.length < count) {
    options.push(`Krok niepowiązany z procedurą (opcja ${options.length + 1})`)
  }

  return options
}

/**
 * Introduce an error into a step (for spot-the-error challenge)
 */
function introduceError(step: string): string {
  const errorTypes = [
    () => step.replace(/prawidłow/gi, 'nieprawidłow'),
    () => step.replace(/należy/gi, 'nie należy'),
    () => step.replace(/przed/gi, 'po'),
    () => step.replace(/po/gi, 'przed'),
    () => `${step} (bez mycia rąk)`,
    () => step.replace(/delikatnie/gi, 'gwałtownie'),
    () => step.replace(/ciepłą/gi, 'zimną'),
    () => step + ' Pomiń ten krok jeśli jest to możliwe.',
  ]

  const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)]
  return errorType()
}
