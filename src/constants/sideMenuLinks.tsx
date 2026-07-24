import CourseLibraryIcon from '@/components/icons/CoursesLibraryIcon'
import DashboardIcon from '@/components/icons/DashboardIcon'
import DiagnozyIcon from '@/components/icons/DiagnozyIcon'
import FeadbackIcon from '@/components/icons/FeadbackIcon'
import LearnIcon from '@/components/icons/LearnIcon'
import PlannerIcon from '@/components/icons/PlannerIcon'
import ProceduresIcon from '@/components/icons/ProceduresIcon'
import ProgressIcon from '@/components/icons/ProgressIcon'
import UserProfileIcon from '@/components/icons/UserProfileIcon'

export const sideMenuNavigationLinks = [
  {
    url: '/panel',
    label: 'Panel Użytkownika',
    icon: <UserProfileIcon width={26} height={26} />,
  },
  {
    url: '/panel/kursy',
    label: 'Dostępne Kursy',
    icon: <CourseLibraryIcon width={26} height={26} />,
  },
  {
    url: '/panel/testy-egzaminy',
    label: 'Testy i Egzaminy',
    icon: <DashboardIcon width={26} height={26} />,
  },
  {
    url: '/panel/dodaj-test',
    label: 'Dodaj Test',
    icon: <FeadbackIcon width={26} height={26} />,
    requiresSupporter: true,
  },
  {
    url: '/panel/nauka',
    label: 'Centrum Nauki',
    icon: <LearnIcon width={26} height={26} />,
  },
  {
    url: '/panel/plan',
    label: 'Plan Nauki',
    icon: <PlannerIcon width={26} height={26} />,
  },
  {
    url: '/panel/procedury',
    label: 'Procedury',
    icon: <ProceduresIcon width={26} height={26} />,
  },
  {
    url: '/panel/diagnozy',
    label: 'Diagnozy i Interwencje',
    icon: <DiagnozyIcon width={26} height={26} />,
    requiresCourse: 'pielegniarstwo',
  },
  {
    url: '/panel/wyniki',
    label: 'Wyniki',
    icon: <ProgressIcon width={26} height={26} />,
  }
]
