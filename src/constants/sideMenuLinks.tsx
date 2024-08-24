import DashboardIcon from '@/components/icons/DashboardIcon'
import FeadbackIcon from '@/components/icons/FeadbackIcon'
import LearnIcon from '@/components/icons/LearnIcon'
import ProgressIcon from '@/components/icons/ProgressIcon'

export const sideMenuNavigationLinks = [
  {
    url: '/testy-opiekun',
    label: 'Testy',
    icon: <DashboardIcon width={26} height={26} />,
  },
  {
    url: '/testy-opiekun/nauka',
    label: 'Nauka',
    icon: <LearnIcon />,
  },
  {
    url: '/testy-opiekun/wyniki',
    label: 'Wyniki',
    icon: <ProgressIcon />,
  },
  {
    url: '/testy-opiekun/opinie',
    label: 'Opinie',
    icon: <FeadbackIcon />,
  },
]
