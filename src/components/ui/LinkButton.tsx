import Link from 'next/link'
import type { ComponentProps } from 'react'
import {
  BUTTON_BASE,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  type ButtonSize,
  type ButtonVariant,
} from '@/constants/buttonStyles'

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export default function LinkButton({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
      {...props}
    />
  )
}
