import React from 'react'
import {
  BUTTON_BASE,
  BUTTON_SHAPES,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  type ButtonShape,
  type ButtonSize,
  type ButtonVariant,
} from '@/constants/buttonStyles'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', shape = 'rounded', type = 'button', className = '', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={`${BUTTON_BASE} ${BUTTON_SHAPES[shape]} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export default Button
