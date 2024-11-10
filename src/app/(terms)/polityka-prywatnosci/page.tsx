import Policy from '@/app/_components/Policy'
import TermsHeader from '@/components/TermsHeader'

export const dynamic = 'force-static'

export default function PolitykaPrywatnosciPage() {
  return (
    <>
      <TermsHeader title="Polityka prywatności" />
      <Policy />
    </>
  )
}
