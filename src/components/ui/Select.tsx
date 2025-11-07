import { PopulatedCategories } from "@/types/categoryType";
import Label from "./Label";

export default function Select(props: {
  categories: PopulatedCategories[];
  label: string;
}) {
  return (
    <div className="flex w-full flex-col">
      <Label label={props.label} htmlFor="category" />
      <select
        name="category"
        id="category"
        className="h-10 cursor-pointer rounded border border-border/40 bg-neutral-900 px-2 text-sm focus:border-amber-200/10 focus-visible:outline-none"
      >
        {props.categories.map((item,index) => (
          <option key={`${item.value}/${index}`} value={item.value}>
            {item.value}
          </option>
        ))}
      </select>
    </div>
  );
}
