'use client'

import { useState } from 'react'
import { useScrollToTopOnChange } from '@/hooks/useScrollToTopOnChange'
import { useProcedureStepsStore } from '@/store/useProcedureStepsStore'
import type { Procedure } from '@/types/dataTypes'
import type { OpiekunReaderSection, ReaderDirection } from '@/types/procedureReaderTypes'
import OpiekunReaderSidebar from './OpiekunReaderSidebar'
import OpiekunReaderMobileHeader from './OpiekunReaderMobileHeader'
import OpiekunSectionContent from './OpiekunSectionContent'
import ReaderFooterNav from './ReaderFooterNav'

const EMPTY: number[] = []

export default function OpiekunProcedureReader({
  procedure,
  slug,
}: {
  procedure: Procedure
  slug: string
}) {
  const [currentSection, setCurrentSection] = useState(0)
  const [direction, setDirection] = useState<ReaderDirection>(1)
  const scrollRef = useScrollToTopOnChange(currentSection)

  const { name, procedure: description, algorithm } = procedure.data
  const markedSteps = useProcedureStepsStore((s) => s.marked[name] ?? EMPTY)
  const toggleStep = useProcedureStepsStore((s) => s.toggleStep)
  const clearProcedure = useProcedureStepsStore((s) => s.clearProcedure)

  const sections: OpiekunReaderSection[] = [
    { title: 'Czynności procedury', steps: algorithm.map((entry) => entry.step) },
    { title: 'Opis procedury', description },
  ]

  const totalSections = sections.length
  const isLastSection = currentSection === totalSections - 1

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setDirection(1)
      setCurrentSection((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setDirection(-1)
      setCurrentSection((prev) => prev - 1)
    }
  }

  const handleReset = () => {
    setDirection(1)
    setCurrentSection(0)
    clearProcedure(name)
  }

  return (
    <div className="flex w-full h-[calc(100vh-80px)] -my-10 overflow-hidden">
      <OpiekunReaderSidebar
        name={name}
        slug={slug}
        stepCount={algorithm.length}
        sections={sections}
        currentSection={currentSection}
      />
      <main className="flex flex-col flex-1 h-full overflow-hidden">
        <OpiekunReaderMobileHeader
          name={name}
          slug={slug}
          stepCount={algorithm.length}
          currentSection={currentSection}
          totalSections={totalSections}
        />
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-webkit">
          <div className="px-4 md:px-10 py-6 md:py-10 max-w-4xl w-full mx-auto">
            <OpiekunSectionContent
              section={sections[currentSection]!}
              sectionIndex={currentSection}
              totalSections={totalSections}
              direction={direction}
              markedSteps={markedSteps}
              onToggleStep={(stepNumber) => toggleStep(name, stepNumber)}
            />
          </div>
        </div>
        <ReaderFooterNav
          currentSection={currentSection}
          totalSections={totalSections}
          isLastSection={isLastSection}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onReset={handleReset}
        />
      </main>
    </div>
  )
}
