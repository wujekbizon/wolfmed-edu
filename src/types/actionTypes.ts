export type FormState = {
  status: 'UNSET' | 'SUCCESS' | 'ERROR'
  message: string
  fieldErrors: Record<string, string[] | undefined>
  timestamp: number
  values?: Record<string, string>
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
