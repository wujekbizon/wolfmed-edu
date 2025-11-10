"use client";

import { useTestFormStore } from "@/store/useTestFormStore";
import Label from "./ui/Label";
import { NUMBER_OF_ANSWERS } from "@/constants/categoryOptions";


function ChooseAnswerCount() {
  const { answersNumber, setAnswersNumber } = useTestFormStore();
  return (
    <div className="w-48">
      <div className="flex flex-col">
        <Label htmlFor="select" label="Ile odpowiedzi?" className="text-xs sm:text-sm text-zinc-700 font-medium" />
        <select
          id="select"
          className="px-4 py-2.5 cursor-pointer rounded-lg border border-zinc-200 bg-white/80 backdrop-blur-sm text-zinc-700 text-sm focus:ring-2 focus:ring-[#ff9898]/50 focus:border-transparent outline-none transition-all duration-300"
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
