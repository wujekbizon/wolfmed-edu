'use client'

import { useActionState } from 'react'
import { signup } from '@/actions/actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import Input from '@/components/Input'
import Label from '@/components/Label'
import { Inputs } from '@/constants/signupInputs'

export default function SignUpForm() {
  const [formState, action] = useActionState(signup, EMPTY_FORM_STATE)

  return (
    <form
      action={action}
      className="flex flex-col w-full sm:w-2/3 gap-4 lg:w-1/2 xl:w-1/3 border rounded-2xl border-red-200/60 bg-[#ffb1b1] shadow-md shadow-zinc-500 p-8"
    >
      {Inputs.map(({ id, label, name, placeholder, type }) => (
        <Label htmlFor={id} label={label} className="flex flex-col text-sm gap-1">
          <Input
            type={type}
            name={name}
            required
            id={id}
            placeholder={placeholder}
            className="h-10 w-full rounded-md border border-red-100/80 bg-[#ffc5c5] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 shadow-sm shadow-zinc-400 focus:border-zinc-700/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </Label>
      ))}

      <button>Zarejestruj się</button>
    </form>
  )
}
