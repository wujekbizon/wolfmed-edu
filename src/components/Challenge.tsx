import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import toast from 'react-hot-toast'
import ChallengeButton from '@/components/ChallengeButton'
import { SortableItem } from '@/components/SortableItem'
import { useProceduresStore } from '@/store/useProceduresStore'
import { useChallengeStore } from '@/store/useChallengeStore'
import { calculateScore } from '@/utils/challengeUtils'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'

export default function Challenge() {
  const { currentProcedure, setCurrentProcedure, setScore, setSteps, steps } = useProceduresStore()
  const { setActiveChallenge, isLocked, setIsLocked } = useChallengeStore()
  const { sensors, activeId, handleDragStart, handleDragEnd } = useDragAndDrop()

  function submitAnswer() {
    if (currentProcedure) {
      const newScore = calculateScore(currentProcedure.data.algorithm, steps)
      setScore(newScore)
      setIsLocked(true)
      toast.success(`Twój wynik: ${newScore}%`, {
        duration: 3000,
        position: 'bottom-center',
        style: {
          background: '#ffffff',
          color: '#ff7a7a',
        },
      })
    }
  }

  function handleEndChallenge() {
    setActiveChallenge(null)
    setCurrentProcedure(null)
    setSteps([])
    setScore(0)
    setIsLocked(false)
  }

  return (
    <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] bg-zinc-100 p-6 rounded-lg shadow-md overflow-y-auto scrollbar-webkit touch-pan-y">
      <h2 className="text-xl font-semibold mb-6 text-zinc-800">{currentProcedure?.data.name}</h2>
      <div className="mb-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          autoScroll={{
            threshold: {
              x: 0,
              y: 0.2, // Start scrolling when within 20% of the edge
            },

            acceleration: 10,
          }}
        >
          <SortableContext items={steps.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col space-y-4 touch-pan-y">
              {steps.map((item) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  step={item.step}
                  isLocked={isLocked}
                  isActive={item.id === activeId}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <SortableItem
                id={activeId}
                step={steps.find((item) => item.id === activeId)?.step || ''}
                isLocked={false}
                isActive={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <ChallengeButton onClick={submitAnswer} disabled={isLocked}>
          {isLocked ? 'Odpowiedź zatwierdzona' : 'Zatwierdź Odpowiedź'}
        </ChallengeButton>
        <ChallengeButton onClick={handleEndChallenge}>Zakończ Wyzwanie</ChallengeButton>
      </div>
    </div>
  )
}
