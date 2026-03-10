import { useEffect } from 'react'
import { useMobileStore } from '@/store/useMobileStore'

export const useIsMobile = (breakpoint: number = 1024) => {
  useEffect(() => {
    // Access setter imperatively so we don't create a store subscription just
    // for a stable setter reference, and can keep breakpoint as the only dep.
    const checkMobile = () => {
      useMobileStore.getState().setIsMobile(window.innerWidth < breakpoint)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  return useMobileStore((state) => state.isMobile)
}
