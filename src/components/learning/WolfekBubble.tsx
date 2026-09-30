import { X } from 'lucide-react'
import { Tooltip } from '@/components/Tooltip'
import Button from '@/components/ui/Button'
import LinkButton from '@/components/ui/LinkButton'
import { COMPANION_SUGGESTIONS } from '@/constants/learningCompanion'
import type { WolfekBubbleProps } from '@/types/learningUiTypes'

export default function WolfekBubble({ session, mode, premium, pending, onRecommend, onDismiss, onNavigate }: WolfekBubbleProps) {
  const question = session?.question
  const suggestion = question?.suggestedAction
  const text = mode === 'hint' ? question?.hint ?? 'Przyjrzyj się słowom w pytaniu. Która odpowiedź najdokładniej opisuje to, o co pyta karta?'
    : mode === 'compare' ? 'Zaznaczyłem odpowiedzi na karcie. Porównaj ich sformułowania ze swoim wyborem.'
    : mode === 'chat' ? !premium ? 'Rozmowa z materiałami kursu jest dostępna w Premium.'
      : 'Najpierw sprawdź lub pokaż odpowiedź. Wtedy możemy omówić ją razem.'
    : suggestion ? COMPANION_SUGGESTIONS[suggestion]
    : question?.correct === true ? 'Dobra robota. Możesz iść dalej albo zapytać, dlaczego ta odpowiedź pasuje.'
    : question?.correct === false ? 'Przyjrzyjmy się temu spokojnie. Jestem obok, jeśli potrzebujesz pomocy.'
    : 'Cześć, jestem Wolfek. Spróbuj samodzielnie — w razie potrzeby pomogę Ci zrobić kolejny krok.'
  return <div className="wolfek-bubble" aria-live="polite">
    <p className="text-sm leading-relaxed text-zinc-600">{text}</p>
    {suggestion && mode === 'welcome' && <div className="mt-3 flex flex-wrap items-center gap-2">
      {question?.suggestedTarget && (suggestion === 'material' || suggestion === 'plan')
        ? <LinkButton href={question.suggestedTarget.href} size="sm" variant="secondary" onClick={onNavigate}>
          {suggestion === 'material' ? 'Otwórz materiał' : 'Otwórz plan'}
        </LinkButton>
        : <Button size="sm" variant="secondary" disabled={pending || (suggestion === 'tutor' && !premium)}
          onClick={onRecommend}>
          {suggestion === 'tutor' ? question?.correctIndex === null ? 'Ujawnij i zapytaj AI'
            : 'Zapytaj asystenta' : suggestion === 'continue' ? 'Dalej'
              : suggestion === 'review' ? 'Wróć do karty' : 'Skorzystaj'}
        </Button>}
      <Tooltip message="Nie teraz" position="top" className="shrink-0">
        <button type="button" className="wolfek-dismiss" onClick={onDismiss} aria-label="Odrzuć tę propozycję">
          <X size={15} />
        </button>
      </Tooltip>
    </div>}
  </div>
}
