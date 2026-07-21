import { PopulatedCategories } from '@/types/categoryType'
import Label from './ui/Label'

/**
 * Required select that ties a freshly named custom category to a real
 * curriculum subject the user has access to. The chosen subject drives the
 * planner's learning-curve attribution (see server/planner/progress.ts).
 */
export default function LinkedSubjectSelect(props: {
  categories: PopulatedCategories[]
}) {
  return (
    <div className="flex w-full flex-col">
      <Label
        label="Przypisz do przedmiotu:"
        htmlFor="linkedCategory"
        className="text-xs sm:text-sm text-zinc-700 font-medium"
      />
      <select
        name="linkedCategory"
        id="linkedCategory"
        required
        defaultValue=""
        className="h-10 w-full cursor-pointer rounded-lg border border-zinc-200 bg-white/90 px-3 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300"
      >
        <option value="" disabled>
          Wybierz przedmiot…
        </option>
        {props.categories.map((item, index) => (
          <option key={`${item.value}/${index}`} value={item.value}>
            {item.category}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-zinc-500">
        Twoje testy z tej kategorii wliczą się do postępu nauki wybranego przedmiotu.
      </p>
    </div>
  )
}
