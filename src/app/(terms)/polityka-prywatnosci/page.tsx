import Policy from '@/app/_components/Policy'
import TermsHeader from '@/components/TermsHeader'

export const instant = true

export default function PolitykaPrywatnosciPage() {
  return (
    <>
      <TermsHeader title="Polityka prywatności" />
      <Policy />
    </>
  )
}
