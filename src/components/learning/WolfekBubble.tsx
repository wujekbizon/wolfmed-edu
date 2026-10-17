import { X } from 'lucide-react'
import { Tooltip } from '@/components/Tooltip'
import Button from '@/components/ui/Button'
import { COMPANION_SUGGESTIONS } from '@/constants/learningCompanion'
import { getWolfekPreparedQuestion } from '@/helpers/getWolfekPreparedQuestion'
import { getPracticeWolfekQuestionId } from '@/helpers/getPracticeWolfekQuestionId'
import type { WolfekBubbleProps } from '@/types/learningUiTypes'
import WolfekAnswerText from '@/components/wolfek/WolfekAnswerText'

export default function WolfekBubble({ session, mode, premium, pending, answerText, onRecommend, onDismiss }: WolfekBubbleProps) {
  const question = session?.question
  const suggestion = question?.suggestedAction
  const text = pending ? 'Wolfek sprawdza…' : answerText ?? (mode === 'hint' ? question?.hint ?? 'Nie mam sprawdzonej wskazówki do tego pytania.'
    : mode === 'compare' ? 'Zaznaczyłem odpowiedzi na karcie. Porównaj ich sformułowania ze swoim wyborem.'
    : mode === 'chat' ? !premium ? 'Rozmowa z materiałami kursu jest dostępna w Premium.'
      : 'Najpierw sprawdź lub pokaż odpowiedź. Wtedy możemy omówić ją razem.'
    : suggestion ? COMPANION_SUGGESTIONS[suggestion]
    : question?.correct === true ? 'Dobra robota. Możesz iść dalej albo zapytać, dlaczego ta odpowiedź pasuje.'
    : question?.correct === false ? 'Przyjrzyjmy się temu spokojnie. Jestem obok, jeśli potrzebujesz pomocy.'
    : 'Cześć, jestem Wolfek. Spróbuj samodzielnie — w razie potrzeby pomogę Ci zrobić kolejny krok.')
  return <div className="wolfek-bubble" aria-live="polite">
    {!pending && answerText ? <WolfekAnswerText text={answerText} />
      : <p className={pending ? 'wolfek-loading-text' : 'text-sm leading-relaxed text-zinc-600'}>{text}</p>}
    {suggestion && !answerText && mode === 'welcome' && <div className="mt-3 flex flex-wrap items-center gap-2">
      <Button size="sm" variant="secondary" disabled={pending}
          onClick={onRecommend}>
          {getWolfekPreparedQuestion('learning.practice', getPracticeWolfekQuestionId(session))?.prompt}
        </Button>
      <Tooltip message="Nie teraz" position="top" className="shrink-0">
        <button type="button" className="wolfek-dismiss" onClick={onDismiss} aria-label="Odrzuć tę propozycję">
          <X size={15} />
        </button>
      </Tooltip>
    </div>}
  </div>
}
