import Input from "@/components/ui/Input"
import Label from "@/components/ui/Label"
import FieldError from "@/components/FieldError"

export function NoteMetaFields({ formState }: { formState: any }) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="relative w-full">
        <Input
          id="title"
          name="title"
          placeholder="Wpisz tytuł"
          className="peer w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-transparent" />
        <Label
          htmlFor="title"
          label="Tytuł notatki"
          className="absolute left-3 top-2.5 text-sm text-zinc-400 pointer-events-none transition-all duration-300 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-zinc-400 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#f6aaaa]"
        />
        <FieldError name="title" formState={formState} />
      </div>
      <div className="relative w-full">
        <Input
          id="category"
          name="category"
          placeholder="np. Anatomia"
          className="peer w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-transparent" />
        <Label
          htmlFor="category"
          label="Kategoria"
          className="absolute left-3 top-2.5 text-sm text-zinc-400 pointer-events-none transition-all duration-300 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-zinc-400 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#f6aaaa]" />
        <FieldError name="category" formState={formState} />
      </div>
    </div>
  )
}