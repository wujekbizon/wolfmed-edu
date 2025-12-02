import type { FormState } from "@/types/actionTypes";
import Input from "./ui/Input";
import Label from "./ui/Label";
import FieldError from "./FieldError";
import { useTestFormStore } from "@/store/useTestFormStore";


interface Answer {
  id: string;
  label: string;
  name: string;
}

interface AnswersProps {
  formState: FormState;
}

const Answers: React.FC<AnswersProps> = ({ formState }) => {
  const answers: Answer[] = [];
  const { answersNumber } = useTestFormStore();

  for (let i = 1; i <= answersNumber; i++) {
    answers.push({
      id: `option${i}`,
      label: `Odpowiedź #${i}`,
      name: `option${i}`,
    });
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {answers.map((answer, index) => (
        <div
          key={answer.id}
          className="flex w-full items-center justify-between gap-4"
        >
          <div className="flex w-full flex-col">
            <Label
              htmlFor={answer.id}
              className="text-xs sm:text-sm text-zinc-700 font-medium"
              label={answer.label}
            />

            <Input
              id={answer.id}
              type="text"
              name={answer.name}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/90 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-zinc-400 placeholder:text-sm"
            />
            <FieldError formState={formState} name="answers" />
          </div>
          <div className="flex h-16 w-24 flex-col items-center justify-center gap-1">
            <Label
              htmlFor={`checkbox${answer.id}`}
              className="text-xs sm:text-sm text-zinc-700 font-medium"
              label="Czy poprawna?"
            />
            <Input
             type="checkbox"
              className="hover:bg-amber-400/40"
              id={`checkbox${answer.id}`}
              name={`checkbox${index + 1}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Answers;
