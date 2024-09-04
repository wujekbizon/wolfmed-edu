'use client'

import { useActionState } from 'react'
import { signup } from '@/actions/actions'
import Input from '@/components/Input'
import Label from '@/components/Label'
import { Inputs } from '@/constants/signupInputs'
import SubmitButton from '@/components/SubmitButton'

const initialState = {
  errors: {
    name: [''],
    email: [''],
    password: [''],
  },
}

export default function SignUpForm() {
  const [state, action, pending] = useActionState(signup, initialState)

  return (
    <form
      action={action}
      className="flex flex-col w-full sm:w-2/3 gap-4 lg:w-1/2 xl:w-1/3 border rounded-2xl border-red-200/60 bg-[#ffb1b1] shadow-md shadow-zinc-500 p-8"
    >
      {Inputs.map(({ id, label, name, placeholder, type }) => (
        <div key={id} className="flex flex-col gap-1">
          <Label label={label} htmlFor={id} className="flex flex-col text-sm" />
          <Input
            type={type}
            name={name}
            id={id}
            placeholder={placeholder}
            className="h-10 w-full rounded-md border border-red-100/80 bg-[#ffc5c5] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 shadow-sm shadow-zinc-400 focus:border-zinc-700/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          {name === 'name' && state?.errors.name && <p className="text-red-500 text-xs">{state.errors.name}</p>}
          {name === 'email' && state?.errors.email && <p className="text-red-500 text-xs">{state.errors.email}</p>}
          {name === 'password' && state?.errors.password?.some((error) => error) && (
            <div className="text-xs text-red-500">
              <p>Hasło musi:</p>
              <ul>
                {state.errors.password.map((error) => (
                  <li key={error}>- {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      <SubmitButton label="Zarejestruj się" loading="Rejestracja trwa..."></SubmitButton>
    </form>
  )
}
