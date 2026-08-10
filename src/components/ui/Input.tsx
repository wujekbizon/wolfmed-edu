interface Input {
  onChangeHandler?: (value: React.ChangeEvent<HTMLInputElement>) => void
  value?: string | number | readonly string[] | undefined
  defaultValue?: string | number | readonly string[] | undefined
  defaultChecked?: boolean | undefined
  placeholder?: string | undefined
  className?: string
  type?: React.HTMLInputTypeAttribute | undefined
  id?: string | undefined
  name?: string | undefined
  required?: boolean | undefined
  disabled?: boolean | undefined
  autoComplete?: string | undefined
  min?: number | undefined
  max?: number | undefined
  step?: number | string | undefined
  minLength?: number | undefined
  maxLength?: number | undefined
  ariaLabel?: string | undefined
}

export default function Input({
  onChangeHandler,
  value,
  defaultValue,
  defaultChecked,
  placeholder,
  className,
  type,
  name,
  required,
  disabled,
  id,
  autoComplete,
  min,
  max,
  step,
  minLength,
  maxLength,
  ariaLabel
}: Input) {
  return (
    <input
      id={id}
      type={type}
      className={className}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      defaultChecked={defaultChecked}
      onChange={onChangeHandler}
      name={name}
      required={required}
      disabled={disabled}
      autoComplete={autoComplete}
      min={min}
      max={max}
      step={step}
      minLength={minLength}
      maxLength={maxLength}
      aria-label={ariaLabel}
    />
  )
}
