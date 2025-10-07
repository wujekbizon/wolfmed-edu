import Input from "@/components/ui/Input"
import Label from "@/components/ui/Label"
import FieldError from "@/components/FieldError"

export function NoteMetaFields({ formState }: { formState: any }) {
  return (
    <>
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <Label htmlFor="title" label="Tytuł notatki" />
        <Input id="title" name="title" placeholder="Tytuł notatki" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-zinc-400 placeholder:text-sm" />
        <FieldError name="title" formState={formState} />
      </div>

      <div className="flex flex-col gap-1.5 sm:gap-2">
        <Label htmlFor="category" label="Kategoria" className="text-xs sm:text-sm text-zinc-700 font-medium" />
        <Input id="category" name="category" placeholder="np. Anatomia" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-zinc-400 placeholder:text-sm" />
        <FieldError name="category" formState={formState} />
      </div>
    </>
  )
}