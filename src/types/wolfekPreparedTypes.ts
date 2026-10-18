export type WolfekPreparedQuestion = { id: string; prompt: string }
export type WolfekPreparedQuestionButtonProps = {
  question: WolfekPreparedQuestion; pending: boolean; onSelect: (id: string) => void; active?: boolean
}
