'use client'

import Input from '@/components/Input'
import SubmitButton from '@/components/SubmitButton'
import { useActionState } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import FieldError from '@/components/FieldError'
import { sendEmail } from '@/actions/actions'
import { useToastMessage } from '@/hooks/useToastMessage'
import Image from 'next/image'

export default function Contact() {
  const [state, action] = useActionState(sendEmail, EMPTY_FORM_STATE)

  const noScriptFallback = useToastMessage(state)

  return (
    <div id="contact" className="h-[75vh] bg-[#fed4d4] w-full ">
      <div className="flex h-full w-full items-end  bg-gradient-to-b from-zinc-900 to-zinc-950 relative">
        <Image
          src="/contact.jpg"
          alt="contact"
          className="absolute h-full w-full object-cover opacity-40"
          width={800}
          height={600}
          priority
        />
        <div className="ml-auto mr-auto flex gap-5 z-50 w-[95%] flex-col justify-between rounded-lg border border-red-200/40 shadow shadow-zinc-500 bg-zinc-50 p-8 mb-[60px] sm:w-[500px] md:ml-[20%]">
          <h2 className="text-3xl font-semibold text-zinc-800">Jak Możemy Ci Pomóc?</h2>
          <p className="text-base text-zinc-800">Napisz do nas, a nasi eksperci skontakytują się z Tobą.</p>

          <form className="flex w-full flex-col gap-2" action={action}>
            <Input
              type="text"
              name="email"
              placeholder="Podaj Email"
              id="email"
              className="flex h-10 w-full rounded-md border border-red-100/80 bg-[#ffc5c5] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 shadow-sm shadow-zinc-400 focus:border-zinc-700/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <FieldError name="email" formState={state} />
            <textarea
              name="message"
              id="message"
              placeholder="Twoja Wiadomość"
              className="h-24 w-full rounded-md border border-red-100/80 bg-[#ffc5c5] px-3 py-2 text-sm ring-offset-background resize-none scrollbar-webkit placeholder:text-zinc-500 shadow-sm shadow-zinc-400 focus:border-zinc-700/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            ></textarea>
            <FieldError name="message" formState={state} />
            <SubmitButton label="Wyślij" loading="Wysyłam..." />
            {noScriptFallback}
          </form>
        </div>
      </div>
    </div>
  )
}
