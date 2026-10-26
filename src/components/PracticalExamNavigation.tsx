'use client'

import TabNavigation from '@/components/ui/TabNavigation'
import DropdownSelect from '@/components/ui/DropdownSelect'
import type { PracticalExamNavigationProps } from '@/types/practicalExamWorkspaceTypes'

export default function PracticalExamNavigation({ exam, active, onSelect }: PracticalExamNavigationProps) {
  const sections = [
    ...exam.assessedTasks.map((task, index) => ({ id: String(index), label: task.type === 'equipment' ? `Zestaw ${index + 1}` : `Czynności ${index + 1}`, title: task.title })),
    ...exam.forms.map((form, index) => ({ id: String(exam.assessedTasks.length + index), label: `Karta ${index + 1}`, title: form.title })),
  ]
  return (
    <nav aria-label='Sekcje arkusza' className='shrink-0 space-y-2 border-b border-zinc-200 bg-white px-4 py-3 lg:px-6'>
      <div className='md:hidden'>
        <DropdownSelect ariaLabel='Wybierz sekcję arkusza' value={String(active)} options={sections.map((section) => ({ value: section.id, label: `${section.label} · ${section.title}` }))} onSelect={(id) => onSelect(Number(id))} />
      </div>
      <div className='hidden overflow-x-auto md:block'>
        <div className='min-w-max'><TabNavigation id='practical-exam' label='Sekcje arkusza' options={sections} active={String(active)} onChange={(id) => onSelect(Number(id))} /></div>
      </div>
      <p className='text-xs text-zinc-500'>Sekcja {active + 1} z {sections.length}<span className='ml-3 hidden sm:inline'>{sections[active]?.title}</span></p>
    </nav>
  )
}
