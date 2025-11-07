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
      label: `Answer #${i}`,
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
              className="pb-1 text-sm text-muted-foreground"
              label={answer.label}
            />

            <Input id={answer.id} type="text" name={answer.name} />
            <FieldError formState={formState} name="answers" />
          </div>
          <div className="flex h-16 w-24 flex-col items-center justify-center gap-1">
            <Label
              htmlFor={`checkbox${answer.id}`}
              className="text-sm text-muted-foreground"
              label="Is correct?"
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
