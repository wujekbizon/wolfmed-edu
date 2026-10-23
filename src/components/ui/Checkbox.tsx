import type { CheckboxProps } from '@/types/checkboxTypes'

export default function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg px-3 py-3 transition-colors ${checked ? 'bg-rose-50' : 'hover:bg-zinc-50'}`}>
      <input type='checkbox' checked={checked} onChange={onChange} className='mt-0.5 size-5 shrink-0 accent-[#bd4256] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400' />
      <span className='text-sm leading-relaxed text-zinc-700'>{label}</span>
    </label>
  )
}
