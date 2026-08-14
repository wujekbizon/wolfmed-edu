import { plPL } from '@clerk/localizations'

export const clerkLocalization = {
  ...plPL,
  userProfile: {
    ...plPL.userProfile,
    deletePage: {
      ...plPL.userProfile?.deletePage,
      messageLine1:
        'Usunięcie konta trwale odbiera dostęp do wszystkich zakupionych kursów, także dożywotnich.',
      messageLine2:
        'Zakupy nie zostaną przywrócone po ponownej rejestracji.',
    },
  },
}
