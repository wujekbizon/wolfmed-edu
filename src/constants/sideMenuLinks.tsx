import DashboardIcon from '@/components/icons/DashboardIcon'
import FeadbackIcon from '@/components/icons/FeadbackIcon'
import LearnIcon from '@/components/icons/LearnIcon'
import ProceduresIcon from '@/components/icons/ProceduresIcon'
import ProgressIcon from '@/components/icons/ProgressIcon'
import SelectedIcon from '@/components/icons/SelectedIcon'
import UserProfileIcon from '@/components/icons/UserProfileIcon'

export const sideMenuNavigationLinks = [
  {
    url: '/panel',
    label: 'Panel Użytkownika',
    icon: <UserProfileIcon width={26} height={26} />,
  },
  {
    url: '/panel/testy',
    label: 'Testy i Egzaminy',
    icon: <DashboardIcon width={26} height={26} />,
  },
  {
    url: '/panel/wybrane-pytania',
    label: 'Wybrane',
    icon: <SelectedIcon width={26} height={26} />,
  },
  {
    url: '/panel/dodaj-test',
    label: 'Dodaj Test',
    icon: <FeadbackIcon width={26} height={26} />,
    requiresSupporter: true, // Premium feature
  },
  {
    url: '/panel/nauka',
    label: 'Centrum Nauki',
    icon: <LearnIcon width={26} height={26} />,
  },
  {
    url: '/panel/procedury',
    label: 'Procedury',
    icon: <ProceduresIcon width={26} height={26} />,
  },
  {
    url: '/panel/wyniki',
    label: 'Wyniki',
    icon: <ProgressIcon width={26} height={26} />,
  }
]

