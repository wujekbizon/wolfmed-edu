import { FilePlus2 } from 'lucide-react'

export default function CreateTestHeader() {
  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff9898] to-red-500 text-white shadow-sm">
          <FilePlus2 className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Twoje testy</h1>
          <p className="text-sm text-zinc-500">
            Twórz własne pytania, generuj je z AI i przypisuj do przedmiotów, aby liczyły się do postępu nauki.
          </p>
        </div>
      </div>
    </div>
  )
}
