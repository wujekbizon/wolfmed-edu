import { currentUser } from '@clerk/nextjs/server'
import HeroButton from '@/components/HeroButton'

export default async function HeroCallToActionButtons() {
  const user = await currentUser()
  const isSignedIn = !!user

  return (
    <>
      {isSignedIn ? (
        <HeroButton link="/panel/nauka">Rozpocznij naukę</HeroButton>
      ) : (
        <HeroButton link="/sign-up">Zarejestruj się</HeroButton>
      )}
    </>
  )
}
