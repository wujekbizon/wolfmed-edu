import { FormState } from '@/types/actionTypes'

type FieldErrorProps = {
  formState: FormState
  name: string
}

const FieldError = ({ formState, name }: FieldErrorProps) => {
  const message = formState.status === 'ERROR'
    ? formState.fieldErrors[name]?.[0]
    : undefined

  return (
    <div className={`${message ? 'bg-black/5' : ''} flex min-h-5 w-full items-center bg-transparent`}>
      <p className="text-xs text-red-500">{message}</p>
    </div>
  )
}

export default FieldError
