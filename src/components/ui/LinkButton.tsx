import Link from 'next/link'
import type { ComponentProps } from 'react'
import {
  BUTTON_BASE,
  BUTTON_SHAPES,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  type ButtonShape,
  type ButtonSize,
  type ButtonVariant,
} from '@/constants/buttonStyles'

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
}

export default function LinkButton({
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  className = '',
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={`${BUTTON_BASE} ${BUTTON_SHAPES[shape]} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
      {...props}
    />
  )
}
