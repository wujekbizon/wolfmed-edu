import Label from './Label'
import Input from './Input'

export default function DateInput({ id, label, value, onChange }: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return <div className="grid gap-1">
    <Label htmlFor={id} label={label} className="text-xs font-medium text-zinc-600" />
    <Input id={id} type="date" value={value} onChangeHandler={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-800 focus:outline-rose-300" />
  </div>
}
