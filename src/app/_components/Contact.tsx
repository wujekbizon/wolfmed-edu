import ContactForm from './ContactForm'

export default async function Contact() {
  return (
    <section id="contact" className="w-full px-4 sm:px-6 md:px-8 py-8 md:py-12">
      <div className="bg-transparent rounded-3xl pt-16 sm:pt-24 pb-20 sm:pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="mb-3 inline-block rounded-full bg-red-500/40 px-4 py-1.5 text-sm font-medium text-white">
              Kontakt
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-800 mb-4">Skontaktuj się z nami</h2>
            <p className="text-zinc-600 max-w-2xl mx-auto">
              Niezależnie od tego, czy masz pytanie, sugestię czy potrzebujesz pomocy, nasz zespół jest gotowy, aby Ci
              pomóc.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
