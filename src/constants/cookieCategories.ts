export const COOKIE_CONSENT_KEY = 'wolfmed_cookie_consent'
export const COOKIE_CONSENT_DURATION_DAYS = 180

export type CookieCategory = 'necessary' | 'performance'

export interface CookieInfo {
  name: string
  provider: string
  expiration: string
  description: string
}

export interface CookieCategoryInfo {
  id: CookieCategory
  label: string
  description: string
  required: boolean
  cookies: CookieInfo[]
}

export const cookieCategories: CookieCategoryInfo[] = [
  {
    id: 'necessary',
    label: 'Ściśle niezbędne',
    description:
      'Te pliki cookie są niezbędne do prawidłowego funkcjonowania strony internetowej, takich jak logowanie użytkownika i zarządzanie kontem. Strona nie może działać poprawnie bez tych plików cookie.',
    required: true,
    cookies: [
      {
        name: '__session',
        provider: 'Clerk',
        expiration: '60 sekund',
        description: 'Token sesji do uwierzytelniania użytkownika',
      },
      {
        name: '__client',
        provider: 'Clerk',
        expiration: '7 dni',
        description: 'Token klienta do zarządzania stanem logowania',
      },
      {
        name: '__clerk_db_jwt',
        provider: 'Clerk',
        expiration: 'Sesja',
        description: 'Token JWT używany podczas uwierzytelniania',
      },
    ],
  },
  {
    id: 'performance',
    label: 'Wydajnościowe',
    description:
      'Te pliki cookie pozwalają nam analizować korzystanie ze strony, abyśmy mogli mierzyć i poprawiać jej wydajność. Wszystkie informacje zbierane przez te pliki cookie są agregowane i anonimowe.',
    required: false,
    cookies: [
      {
        name: '_ga',
        provider: 'Google Analytics',
        expiration: '2 lata',
        description: 'Rozróżnianie unikalnych użytkowników',
      },
      {
        name: '_gid',
        provider: 'Google Analytics',
        expiration: '24 godziny',
        description: 'Śledzenie sesji użytkownika',
      },
      {
        name: '_ga_<ID>',
        provider: 'Google Analytics',
        expiration: '2 lata',
        description: 'Utrzymanie stanu sesji Google Analytics',
      },
    ],
  },
]

export interface CookieConsent {
  necessary: boolean
  performance: boolean
  timestamp: number
}

export const defaultConsent: CookieConsent = {
  necessary: true,
  performance: false,
  timestamp: 0,
}
