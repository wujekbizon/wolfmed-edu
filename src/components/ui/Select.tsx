import { Categories } from "@/types/categoryType";
import Label from "./Label";

export default function Select(props: {
  categories: Categories[];
  label: string;
}) {
  return (
    <div className="flex w-full flex-col">
      <Label label={props.label} htmlFor="category" />
      <select
        name="category"
        id="category"
        className="h-10 cursor-pointer rounded border border-border/60 bg-neutral-900 px-2 text-sm  focus:border-amber-200/10 focus-visible:outline-none"
      >
        {props.categories.map((item) => (
          <option key={item.category} value={item.value}>
            {item.category}
          </option>
        ))}
      </select>
    </div>
  );
}
