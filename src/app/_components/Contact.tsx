import Input from '@/components/Input'
import SubmitButton from '@/components/SubmitButton'

export default function Contact() {
  return (
    <div id="contact" className="h-[75vh] w-full rounded-3xl px-4 sm:px-6 pt-2 pb-2.5 sm:pt-4">
      <div className="flex h-3/4 w-full items-end bg-[] bg-[url('/contact.jpg')] bg-cover bg-top rounded-3xl border shadow-lg shadow-zinc-400">
        <div className="mb-[-170px] ml-auto mr-auto flex gap-5 w-[95%] flex-col justify-between rounded-md border border-red-200/40 bg-[#ff6868] p-8 sm:mb-[-100px] sm:w-[500px] md:ml-[20%]">
          <p className="cursor-pointer text-sm text-zinc-300 underline hover:text-zinc-900">
            Zadzwoń: <a href="callto:1234567890">123-456-7890</a>
          </p>
          <h2 className="text-4xl font-semibold text-zinc-900">Jak Możemy Ci Pomóc?</h2>
          <p className="text-base text-zinc-900">Napisz do nas, a nasi eksperci skontakytują się z Tobą.</p>
          <form className="flex w-full flex-col gap-6" action="">
            <Input
              type="text"
              name="email"
              placeholder="Podaj Email"
              id="email"
              className="flex h-10 w-full rounded-md border border-red-100/80 bg-[#ffc5c5] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 shadow-sm shadow-zinc-400 focus:border-zinc-700/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <textarea
              name="message"
              id="message"
              placeholder="Twoja Wiadomość"
              className="h-24 w-full rounded-md border border-red-100/80 bg-[#ffc5c5] px-3 py-2 text-sm ring-offset-background resize-none scrollbar-webkit placeholder:text-zinc-400 shadow-sm shadow-zinc-400 focus:border-zinc-700/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            ></textarea>
            <SubmitButton label="Send" loading="Sending..." />
          </form>
        </div>
      </div>
    </div>
  )
}
