import ContactForm from './ContactForm'

export default async function Contact() {
  return (
    <section id='contact' className='w-full px-4 sm:px-6 md:px-8 py-8 md:py-12'>
      <div className='bg-transparent rounded-3xl pt-16 sm:pt-24 pb-20 sm:pb-20'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-12'>
              <span className='mb-3 sm:mb-4 inline-flex items-center gap-1.5 rounded-full border border-red-300/50 bg-white/60 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-500 backdrop-blur-sm'>
                <span className='h-1.5 w-1.5 rounded-full bg-red-400' />
                Kontakt
              </span>
              <h2 className='text-3xl sm:text-4xl font-bold text-zinc-800 mb-4'>
                Skontaktuj się z nami
              </h2>
              <p className='text-zinc-600 max-w-2xl mx-auto'>
                Niezależnie od tego, czy masz pytanie, sugestię czy potrzebujesz
                pomocy, nasz zespół jest gotowy, aby Ci pomóc.
              </p>
            </div>
            <div className='max-w-2xl mx-auto'>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
