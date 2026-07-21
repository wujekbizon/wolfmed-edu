import { Sparkles } from 'lucide-react'
import type { PopulatedCategories } from '@/types/categoryType'
import type { FormState } from '@/types/actionTypes'
import { Textarea } from '@/components/ui/Textarea'
import Label from '@/components/ui/Label'
import Input from '@/components/ui/Input'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'

const inputClass =
  'w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/90 text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700'

export default function AITestGenerateForm(props: {
  categories: PopulatedCategories[]
  action: (formData: FormData) => void
  state: FormState
}) {
  return (
    <form action={props.action} className="flex flex-col gap-4">
      <div className="flex flex-col">
        <Label htmlFor="topic" label="Temat lub problem medyczny:" className="text-xs sm:text-sm text-zinc-700 font-medium" />
        <Textarea
          id="topic"
          name="topic"
          placeholder="np. Powikłania cukrzycy typu 2, opieka nad pacjentem po udarze..."
          className={inputClass}
        />
        <FieldError name="topic" formState={props.state} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <Label htmlFor="categoryName" label="Nazwa Twojej kategorii:" className="text-xs sm:text-sm text-zinc-700 font-medium" />
          <Input type="text" id="categoryName" name="categoryName" placeholder="np. Moje pytania z cukrzycy" className={inputClass} />
          <FieldError name="categoryName" formState={props.state} />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="questionCount" label="Liczba pytań:" className="text-xs sm:text-sm text-zinc-700 font-medium" />
          <select id="questionCount" name="questionCount" defaultValue="5" className={`${inputClass} cursor-pointer`}>
            {[3, 5, 10, 15].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col">
        <Label htmlFor="linkedCategory" label="Przypisz do przedmiotu:" className="text-xs sm:text-sm text-zinc-700 font-medium" />
        <select id="linkedCategory" name="linkedCategory" required defaultValue="" className={`${inputClass} cursor-pointer`}>
          <option value="" disabled>Wybierz przedmiot…</option>
          {props.categories.map((c, i) => (
            <option key={`${c.value}/${i}`} value={c.value}>{c.category}</option>
          ))}
        </select>
        <FieldError name="linkedCategory" formState={props.state} />
        <p className="mt-1 text-xs text-zinc-500">Pytania wliczą się do postępu nauki wybranego przedmiotu.</p>
      </div>

      <div className="flex w-full sm:w-auto self-start">
        <SubmitButton
          label={<span className="inline-flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Generuj pytania</span>}
          loading="Generuję..."
        />
      </div>
    </form>
  )
}
