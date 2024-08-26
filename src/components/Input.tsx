interface Input {
  onChangeHandler?: (value: React.ChangeEvent<HTMLInputElement>) => void
  value?: string | number | readonly string[] | undefined
  placeholder?: string | undefined
  className?: string
  type?: React.HTMLInputTypeAttribute | undefined
  id?: string | undefined
}

export default function Input({ onChangeHandler, value, placeholder, className, type }: Input) {
  return (
    <input
      id="input"
      type={type}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={onChangeHandler}
    />
  )
}
