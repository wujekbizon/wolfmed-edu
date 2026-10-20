export class PracticeProgressError extends Error {
  constructor(public readonly status: number) {
    super('Nie udało się odświeżyć postępu.')
  }
}
