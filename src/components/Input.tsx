interface Input {
  onChangeHandler?: (value: React.ChangeEvent<HTMLInputElement>) => void
  value?: string | number | readonly string[] | undefined
  defaultValue?: string | number | readonly string[] | undefined // Add this line
  placeholder?: string | undefined
  className?: string
  type?: React.HTMLInputTypeAttribute | undefined
  id?: string | undefined
  name?: string | undefined
  required?: boolean | undefined
  autoComplete?: string | undefined
}

export default function Input({
  onChangeHandler,
  value,
  defaultValue, // Add this parameter
  placeholder,
  className,
  type,
  name,
  required,
  id,
  autoComplete,
}: Input) {
  return (
    <input
      id={id}
      type={type}
      className={className}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue} // Add this line
      onChange={onChangeHandler}
      name={name}
      required={required}
      autoComplete={autoComplete}
    />
  )
}
