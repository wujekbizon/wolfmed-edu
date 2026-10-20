import Link from 'next/link'

export default function PracticeSignInRequired() {
  return <div role="alert" className="space-y-2">
    <p>Zaloguj się ponownie, aby kontynuować naukę.</p>
    <Link href="/sign-in" className="underline">Zaloguj się ponownie</Link>
  </div>
}
