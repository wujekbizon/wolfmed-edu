import Input from '@/components/Input'
import SubmitButton from '@/components/SubmitButton'

export default function Contact() {
  return (
    <div className="h-[60vh] w-full bg-transparent">
      <div className="flex h-3/4 w-full items-end bg-zinc-800 bg-[url('/contact.jpg')] bg-cover bg-center bg-blend-color-dodge">
        <div className="mb-[-170px] ml-auto mr-auto flex h-[350px] w-[95%] flex-col justify-between rounded-md border border-red-200/40 bg-[#ff5b5b] p-8 sm:mb-[-100px] sm:w-[550px] md:ml-[20%]">
          <p className="cursor-pointer text-base text-zinc-300 underline hover:text-zinc-900">
            Zadzwoń: <a href="callto:1234567890">123-456-7890</a>
          </p>
          <h2 className="text-4xl font-semibold text-zinc-900">Jak Możemy Pomóc?</h2>
          <p className="text-base text-zinc-900">Podaj swój adres e-mail, a nasi eksperci skontakytują się z Tobą.</p>
          <form className="flex w-full flex-col gap-6" action="">
            <Input
              type="text"
              placeholder="Enter Your Email"
              id="input"
              className="flex h-10 w-full rounded-md border border-red-100/80 bg-[#ffc5c5] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 shadow-sm shadow-zinc-400 focus:border-zinc-700/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <SubmitButton label="Send" loading="Sending..." />
          </form>
        </div>
      </div>
    </div>
  )
}
