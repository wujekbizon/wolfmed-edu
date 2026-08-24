import Terms from '@/app/_components/Terms'
import TermsHeader from '@/components/TermsHeader'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function WarunkiPage() {
  return (
    <>
      <TermsHeader title="Warunki użytkowania" />
      <Terms />
    </>
  )
}
