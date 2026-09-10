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

interface NativeLinkButtonProps extends ComponentProps<'a'> {
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
}

export default function NativeLinkButton({
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  className = '',
  ...props
}: NativeLinkButtonProps) {
  return (
    <a
      className={`${BUTTON_BASE} ${BUTTON_SHAPES[shape]} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
      {...props}
    />
  )
}
