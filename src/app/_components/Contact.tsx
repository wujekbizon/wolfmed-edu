import ContactForm from './ContactForm'

export default async function Contact() {
  return (
    <section id="contact" className="w-full bg-gradient-to-b from-[#0d0b0b] to-zinc-900 pt-16 sm:pt-24 pb-20 sm:pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="mb-3 inline-block rounded-full bg-zinc-800 px-4 py-1.5 text-sm font-medium text-zinc-200">
              Kontakt
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Skontaktuj się z nami</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Niezależnie od tego, czy masz pytanie, sugestię czy potrzebujesz pomocy, nasz zespół jest gotowy, aby Ci
              pomóc.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}
