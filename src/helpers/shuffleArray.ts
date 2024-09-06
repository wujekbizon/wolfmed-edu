export function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = [...array] // Create a shallow copy of the array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // Perform swap using a temporary variable
    const temp = shuffledArray[i]!
    shuffledArray[i] = shuffledArray[j]!
    shuffledArray[j] = temp
  }
  return shuffledArray
}
