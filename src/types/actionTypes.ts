export type FormState = {
  status: 'UNSET' | 'SUCCESS' | 'ERROR'
  message: string
  fieldErrors: Record<string, string[] | undefined>
  timestamp: number
  // Structured payloads (retrieved sources, tool results) travel here too, so
  // the bag admits plain objects and lists of them alongside the scalars.
  values?: Record<
    string,
    string | number | boolean | string[] | Array<Record<string, unknown>> | undefined | null
  >
}

export type FormStateSignup =
  | {
      errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
      }
      message?: string
    }
  | undefined
