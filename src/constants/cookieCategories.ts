export type CookieCategory = 'necessary' | 'performance' | 'marketing'

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
        name: '__client_uat',
        provider: 'Clerk',
        expiration: '7 dni',
        description: 'Token uwierzytelniania użytkownika',
      },
      {
        name: '__cf_bm',
        provider: 'Cloudflare',
        expiration: '30 minut',
        description: 'Ochrona przed botami i zapewnienie bezpieczeństwa',
      },
      {
        name: '__cfuvid',
        provider: 'Cloudflare',
        expiration: 'Sesja',
        description: 'Identyfikator sesji dla ochrony przed botami',
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
  {
    id: 'marketing',
    label: 'Marketingowe',
    description:
      'Te pliki cookie służą do śledzenia skuteczności kampanii reklamowych i personalizacji reklam. Mogą być używane przez nas lub naszych partnerów reklamowych do wyświetlania odpowiednich treści.',
    required: false,
    cookies: [
      {
        name: '_gcl_au',
        provider: 'Google Ads',
        expiration: '90 dni',
        description: 'Śledzenie konwersji reklamowych i mierzenie skuteczności kampanii',
      },
    ],
  },
]
