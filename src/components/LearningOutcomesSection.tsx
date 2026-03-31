interface LearningOutcome {
  code: string
  desc: string
}

interface LearningOutcomesSectionProps {
  knowledge: LearningOutcome[]
  skills: LearningOutcome[]
  competencies?: LearningOutcome[]
}

export default function LearningOutcomesSection({
  knowledge,
  skills,
  competencies,
}: LearningOutcomesSectionProps) {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 md:p-8 mb-6'>
      <h2 className='text-2xl font-bold mb-6'>Czego się nauczysz?</h2>

      {knowledge.length > 0 && (
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-zinc-700 mb-3'>Wiedza</h3>
          <div className='space-y-3'>
            {knowledge.map((item, idx) => (
              <div
                key={idx}
                className='flex gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200'
              >
                <span className='font-mono text-sm font-bold text-zinc-700 shrink-0'>
                  {item.code}
                </span>
                <p className='text-gray-700 text-sm'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-slate-700 mb-3'>Umiejętności</h3>
          <div className='space-y-3'>
            {skills.map((item, idx) => (
              <div
                key={idx}
                className='flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200'
              >
                <span className='font-mono text-sm font-bold text-slate-700 shrink-0'>
                  {item.code}
                </span>
                <p className='text-gray-700 text-sm'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {competencies && competencies.length > 0 && (
        <div>
          <h3 className='text-lg font-semibold text-zinc-700 mb-3'>
            Kompetencje społeczne
          </h3>
          <div className='space-y-3'>
            {competencies.map((item, idx) => (
              <div
                key={idx}
                className='flex gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200'
              >
                <span className='font-mono text-sm font-bold text-zinc-700 shrink-0'>
                  {item.code}
                </span>
                <p className='text-gray-700 text-sm'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
