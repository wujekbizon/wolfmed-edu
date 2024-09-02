interface Input {
  onChangeHandler?: (value: React.ChangeEvent<HTMLInputElement>) => void
  value?: string | number | readonly string[] | undefined
  placeholder?: string | undefined
  className?: string
  type?: React.HTMLInputTypeAttribute | undefined
  id?: string | undefined
  name?: string | undefined
  required?: boolean | undefined
}

export default function Input({ onChangeHandler, value, placeholder, className, type, name, required, id }: Input) {
  return (
    <input
      id={id}
      type={type}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={onChangeHandler}
      name={name}
      required={required}
    />
  )
}
