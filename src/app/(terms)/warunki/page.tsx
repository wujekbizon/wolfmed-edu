import Terms from '@/app/_components/Terms'
import TermsHeader from '@/components/TermsHeader'

export const dynamic = 'force-static'
export default function WarunkiPage() {
  return (
    <>
      <TermsHeader title="Warunki użytkowania" />
      <Terms />
    </>
  )
}
