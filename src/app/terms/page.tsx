import HomeButton from '@/components/HomeButton'
import Terms from '../_components/Terms'
import LegalCompliance from '../_components/LegalCompliance'
import Policy from '../_components/Policy'
export const dynamic = 'force-static'

export default function TermsPage() {
  return (
    <section className="w-[95%] lg:w-3/4 xl:w-2/3 mx-auto  min-h-[calc(100vh_-_70px)] py-4 flex flex-col justify-center gap-8">
      <Terms />
      <Policy />
      <LegalCompliance />
      <HomeButton title="Powrót do strony głównej" />
    </section>
  )
}
