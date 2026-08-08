'use client'

import { useFormStatus } from 'react-dom'
import {
  BUTTON_BASE,
  BUTTON_SHAPES,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  type ButtonShape,
  type ButtonSize,
  type ButtonVariant,
} from '@/constants/buttonStyles'

type SubmitButtonProps = {
  label: string
  loading: React.ReactNode
  disabled?: boolean
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
}

const SubmitButton = ({
  label,
  loading,
  disabled,
  className = '',
  variant = 'primary',
  size = 'submit',
  shape = 'soft',
}: SubmitButtonProps) => {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`${BUTTON_BASE} ${BUTTON_SHAPES[shape]} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} w-full ${className}`}
    >
      {pending ? loading : label}
    </button>
  )
}
export default SubmitButton
