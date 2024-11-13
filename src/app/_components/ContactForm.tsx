'use client'

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import Input from '@/components/Input'
import SubmitButton from '@/components/SubmitButton'
import { useActionState } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import FieldError from '@/components/FieldError'
import { sendEmail } from '@/actions/actions'
import { useToastMessage } from '@/hooks/useToastMessage'
import Label from '@/components/Label'
import Link from 'next/link'

export default function ContactForm() {
  const [state, action] = useActionState(sendEmail, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  return (
    <>
      <SignedIn>
        <div className="bg-white bg-opacity-90 rounded-lg shadow-xl p-4 xs:p-8">
          <form className="flex flex-col gap-4" action={action}>
            <div>
              <Label htmlFor="email" label="Email" className="text-zinc-600" />
              <Input
                type="text"
                name="email"
                placeholder="Twój adres email"
                id="email"
                className="w-full px-4 py-2 rounded-md border outline-none border-zinc-300 focus:ring focus:ring-red-200 transition"
                defaultValue={state.values?.email || ''}
                autoComplete="email"
              />
              <FieldError name="email" formState={state} />
            </div>
            <div>
              <Label htmlFor="message" label="Wiadomość" className="text-zinc-600" />
              <textarea
                name="message"
                id="message"
                placeholder="Twoja wiadomość"
                className="w-full px-4 py-2 rounded-md border outline-none border-zinc-300 focus:ring focus:ring-red-200 transition h-32 resize-none"
                defaultValue={state.values?.message || ''}
              ></textarea>
              <FieldError name="message" formState={state} />
            </div>
            <SubmitButton label="Wyślij wiadomość" loading="Wysyłanie..." />
            {noScriptFallback}
          </form>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="backdrop-blur-md bg-zinc-800 rounded-lg p-4 xs:p-8 mt-6">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <p className="text-zinc-400">Aby skontaktować się z nami, musisz być zalogowany do swojego konta</p>
            <SignInButton mode="modal">
              <button className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors">
                Zaloguj się
              </button>
            </SignInButton>
          </div>
          <p className="text-sm text-zinc-500 pt-8 text-center">
            Nie masz konta?{' '}
            <Link href="/sign-up" className="text-red-300 hover:underline hover:text-red-400">
              Zarejestruj się
            </Link>
          </p>
        </div>
      </SignedOut>
    </>
  )
}
