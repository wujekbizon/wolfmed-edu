import BlogIcon from '@/components/icons/BlogIcon'
import DashboardIcon from '@/components/icons/DashboardIcon'
import ForumIcon from '@/components/icons/ForumIcon'
import HomeIcon from '@/components/icons/HomeIcon'
import InnovationIcon from '@/components/icons/InnovationIcon'

export const navLinks = [
  {
    id: '1',
    linkUrl: '/',
    label: 'Start',
    icon: <HomeIcon />,
    title: "Strona Główna"
  },
    {
    id: '2',
    linkUrl: '/kierunki',
    label: 'Kieurnki',
    icon: <InnovationIcon />,
    title: "Kierunki Edukacyjne"
  },
  {
    id: '3',
    linkUrl: '/testy-opiekun',
    label: 'Panel',
    icon: <DashboardIcon />,
    title: "Panel Użytkownika"
  },
  {
    id: '4',
    linkUrl: '/forum',
    label: 'Forum',
    icon: <ForumIcon />,
    title: "Forum Dyskusyjne"
  },
  {
    id: '5',
    linkUrl: '/blog',
    label: 'Blog',
    icon: <BlogIcon />,
    title: "Blog Edukacyjny"
  },
]
