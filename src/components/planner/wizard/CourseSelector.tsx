'use client'

import { GraduationCap } from 'lucide-react'
import WizardFieldLabel from './WizardFieldLabel'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

const SEG = 'px-4 py-2 rounded-lg text-sm font-medium border transition-colors'
const SEG_ON = 'bg-zinc-900 text-white border-zinc-900'
const SEG_OFF = 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'

export default function CourseSelector({
  courses,
  wizard,
}: {
  courses: { slug: string; name: string }[]
  wizard: PlanWizardController
}) {
  if (courses.length <= 1) return null

  return (
    <div>
      <WizardFieldLabel icon={GraduationCap}>Kurs</WizardFieldLabel>
      <div className="flex flex-wrap gap-2">
        {courses.map((course) => (
          <button
            key={course.slug}
            type="button"
            onClick={() => wizard.selectCourse(course.slug)}
            className={`${SEG} ${wizard.courseSlug === course.slug ? SEG_ON : SEG_OFF}`}
          >
            {course.name}
          </button>
        ))}
      </div>
    </div>
  )
}
