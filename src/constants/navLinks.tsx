import BlogIcon from '@/components/icons/BlogIcon'
import DashboardIcon from '@/components/icons/DashboardIcon'
import ForumIcon from '@/components/icons/ForumIcon'
import HomeIcon from '@/components/icons/HomeIcon'

export const navLinks = [
  {
    id: '1',
    linkUrl: '/',
    label: 'Strona główna',
    icon: <HomeIcon />,
  },
  {
    id: '2',
    linkUrl: '/testy-opiekun',
    label: 'Testy i Procedury',
    icon: <DashboardIcon />,
  },
  {
    id: '3',
    linkUrl: '/forum',
    label: 'Forum',
    icon: <ForumIcon />,
  },
  {
    id: '4',
    linkUrl: '/blog',
    label: 'Blog',
    icon: <BlogIcon />,
  },
]
