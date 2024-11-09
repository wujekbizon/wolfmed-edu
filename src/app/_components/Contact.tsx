'use client'

import Input from '@/components/Input'
import SubmitButton from '@/components/SubmitButton'
import { useActionState } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import FieldError from '@/components/FieldError'
import { sendEmail } from '@/actions/actions'
import { useToastMessage } from '@/hooks/useToastMessage'
import Image from 'next/image'
import Label from '@/components/Label'
import { SignedIn } from '@clerk/nextjs'

export default function Contact() {
  const [state, action] = useActionState(sendEmail, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  return (
    <SignedIn>
      <div
        id="contact"
        className="relative h-screen xs:min-h-[80vh] w-full overflow-hidden bg-gradient-to-r from-zinc-800 to-zinc-950"
      >
        <Image
          src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5odaAfpvSLyQhzP6mdErKItkOUcXlTqiNMavY"
          alt="contact"
          className="absolute h-full w-full object-cover opacity-40"
          width={800}
          height={600}
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-60">
          <div className="container mx-auto h-full px-4 py-12 flex flex-col justify-center">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
              <div className="w-full lg:w-1/2 text-white">
                <h2 className="text-2xl xs:text-4xl font-bold text-white pb-6">
                  Skontaktuj się z nami <span className="text-red-500 animate-pulse text-2xl xs:text-4xl"> ✉︎</span>
                </h2>

                <p className="text-sm xs:text-lg text-zinc-300 font-semibold">
                  Niezależnie od tego, czy masz pytanie, sugestię czy potrzebujesz pomocy, nasz zespół jest gotowy, aby
                  Ci pomóc. Skontaktuj się z nami, a odpowiemy najszybciej jak to możliwe.
                </p>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="bg-white bg-opacity-90 rounded-lg shadow-xl  p-4 xs:p-8">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </SignedIn>
  )
}
