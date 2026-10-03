'use client'

import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import LearningPaginationControls from '@/components/LearningPaginationControls'
import PracticeQuestionCard from '@/components/PracticeQuestionCard'
import PracticeCompanion from '@/components/learning/PracticeCompanion'
import PracticeTutor from '@/components/learning/PracticeTutor'
import LearningDeckHeader from '@/components/learning/LearningDeckHeader'
import WolfekDock from '@/components/learning/WolfekDock'
import WolfekVisitProvider from '@/components/wolfek/WolfekVisitProvider'
import LearningCardFilters from '@/components/learning/LearningCardFilters'
import ResetLearningProgressButton from '@/components/learning/ResetLearningProgressButton'
import { useLearningDeck } from '@/hooks/useLearningDeck'
import { useSettingsStore } from '@/store/useSettingsStore'
import type { LearningDeckProps } from '@/types/learningUiTypes'

export default function AllTests(props: LearningDeckProps) {
  const deck = useLearningDeck(props)
  const wolfekHidden = useSettingsStore((state) => state.practiceCompanionHidden[props.userId] ?? false)
  if (!deck.authorized) return <p>Zaloguj się ponownie, aby kontynuować.</p>
  return <WolfekVisitProvider><section className="w-full max-w-[1500px] space-y-6 pb-24 xl:pb-4">
    <LearningDeckHeader count={props.questions.length} actions={deck.session &&
      <ResetLearningProgressButton userId={props.userId} category={props.category}
        session={deck.session} onReset={(view) => { deck.update(view); deck.changeFilter('all') }} />} />
    {deck.error && <p role="alert">Nie udało się odświeżyć postępu. Sprawdź połączenie lub dostęp.</p>}
    <div id="learning-card-feed" className={`relative min-w-0 scroll-mt-6 space-y-4 ${wolfekHidden ? 'xl:pr-24' : 'xl:pr-[380px]'}`}>
      <div className="learning-card-toolbar">
        <LearningCardFilters value={deck.filter} counts={deck.filterCounts} onChange={deck.changeFilter} />
        <div className="learning-search-field">
          <Label htmlFor="learning-search" label="Szukaj w kartach" className="sr-only" />
          <Input id="learning-search" type="search" value={deck.search.searchTerm}
            onChangeHandler={(event) => deck.search.setSearchTerm(event.target.value)}
            placeholder="Szukaj w pytaniach i odpowiedziach…" className="learning-search-input" />
        </div>
      </div>
      {!deck.total && <p className="rounded-2xl border border-dashed p-8 text-center text-zinc-500">Brak kart pasujących do wyszukiwania.</p>}
      {deck.pageQuestions.map((question) => <PracticeQuestionCard key={question.id}
        userId={props.userId} category={props.category} question={question}
        number={props.questions.findIndex((q) => q.id === question.id) + 1} session={deck.session}
        progress={deck.session?.cards.find((card) => card.id === question.id && card.revision === question.revision)}
        active={deck.question?.id === question.id} comparing={deck.compareId === question.id}
        onFocus={() => deck.focus(question.id)} onSaved={deck.update} onAnswered={deck.onAnswered} />)}
      <LearningPaginationControls totalPages={deck.totalPages} currentPage={deck.page} setCurrentPage={deck.changePage} />
    </div>
    <WolfekDock userId={props.userId} questionId={deck.question?.id} session={deck.companion} reaction={deck.reaction}>
      {(minimize, smallTalkIndex) => <>
        <PracticeCompanion key={deck.question?.id ?? 'welcome'} userId={props.userId} category={props.category}
          session={deck.companion} premium={props.premium} onSaved={deck.update} onAskTutor={deck.askTutor}
          onCompare={() => deck.compare(deck.question?.id ?? null)} onContinue={deck.continueToNextCard}
          onReview={deck.reviewRevealedCard}
          canContinue={deck.canContinue}
          onMinimize={minimize} smallTalkIndex={smallTalkIndex} reaction={deck.reaction} />
        {deck.tutor && <div className="wolfek-conversation">
          <PracticeTutor key={`${deck.tutor.sessionId}:${deck.tutor.questionId}`}
            reference={deck.tutor} category={props.category} onClose={() => deck.setTutor(null)} />
        </div>}
      </>}
    </WolfekDock>
  </section></WolfekVisitProvider>
}
