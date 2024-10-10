import DashboardIcon from '@/components/icons/DashboardIcon'
import LearnIcon from '@/components/icons/LearnIcon'
import ProceduresIcon from '@/components/icons/ProceduresIcon'

export const dashboardLinks = [
  {
    text: 'Wszystkie pytania',
    link: '/testy-opiekun/nauka',
    icon: <LearnIcon color="#ff8c8c" width={30} height={30} />,
  },
  {
    text: 'Rozwiąż test',
    link: '/testy-opiekun/testy',
    icon: <DashboardIcon color="#ff8c8c" width={30} height={30} />,
  },
  {
    text: 'Sprawdz procedury',
    link: '/testy-opiekun/procedury',
    icon: <ProceduresIcon color="#ff8c8c" width={30} height={30} />,
  },
]
