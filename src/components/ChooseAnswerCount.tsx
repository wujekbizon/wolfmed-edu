"use client";

import { useTestFormStore } from "@/store/useTestFormStore";
import Label from "./ui/Label";
import { NUMBER_OF_ANSWERS } from "@/constants/categoryOptions";


function ChooseAnswerCount() {
  const { answersNumber, setAnswersNumber } = useTestFormStore();
  return (
    <div className="flex w-full flex-col justify-end sm:flex-row lg:w-2/3">
      <div className="flex flex-col">
        <Label htmlFor="select" label="How many answers?" />
        <select
          id="select"
          className="h-10 cursor-pointer rounded-lg border border-border/40 bg-neutral-900 px-2 text-sm focus:border-amber-200/10 focus-visible:outline-none"
          value={answersNumber}
          onChange={(event) => setAnswersNumber(parseInt(event.target.value))}
        >
          {NUMBER_OF_ANSWERS.map((item) => (
            <option key={item.title} value={item.value}>
              {item.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
export default ChooseAnswerCount;
