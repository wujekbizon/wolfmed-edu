export type WolfekPreparedQuestion = { id: string; prompt: string }
export type WolfekPreparedQuestionButtonProps = {
  appearance?: 'floating' | 'straight'
  question: WolfekPreparedQuestion; pending: boolean; onSelect: (id: string) => void; active?: boolean
}
