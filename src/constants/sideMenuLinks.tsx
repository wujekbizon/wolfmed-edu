import DashboardIcon from '@/components/icons/DashboardIcon'
import FeadbackIcon from '@/components/icons/FeadbackIcon'
import LearnIcon from '@/components/icons/LearnIcon'
import ProceduresIcon from '@/components/icons/ProceduresIcon'
import ProgressIcon from '@/components/icons/ProgressIcon'
import UserProfileIcon from '@/components/icons/UserProfileIcon'

export const sideMenuNavigationLinks = [
  {
    url: '/testy-opiekun',
    label: 'Ogólne',
    icon: <UserProfileIcon width={26} height={26} />,
  },
  {
    url: '/testy-opiekun/testy',
    label: 'Testy',
    icon: <DashboardIcon width={26} height={26} />,
  },
  {
    url: '/testy-opiekun/nauka',
    label: 'Nauka',
    icon: <LearnIcon width={26} height={26} />,
  },
  {
    url: '/testy-opiekun/procedury',
    label: 'Procedury',
    icon: <ProceduresIcon width={26} height={26} />,
  },
  {
    url: '/testy-opiekun/wyniki',
    label: 'Wyniki',
    icon: <ProgressIcon width={26} height={26} />,
  },
  {
    url: '/#contact',
    label: 'Kontakt',
    icon: <FeadbackIcon width={26} height={26} />,
  },
]
