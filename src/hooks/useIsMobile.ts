import { useEffect } from 'react'
import { useMobileStore } from '@/store/useMobileStore'

export const useIsMobile = (breakpoint: number = 1024) => {
  const { setIsMobile } = useMobileStore()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint, setIsMobile])

  return useMobileStore((state) => state.isMobile)
}
