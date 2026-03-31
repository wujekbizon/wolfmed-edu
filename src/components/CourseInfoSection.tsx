interface CourseInfoSectionProps {
  ects: number
  semester: string
  objectives: string
  prerequisites: string
}

export default function CourseInfoSection({
  ects,
  semester,
  objectives,
  prerequisites,
}: CourseInfoSectionProps) {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 md:p-8 mb-6'>
      <div className='grid md:grid-cols-2 gap-6 mb-6'>
        <div>
          <h3 className='text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2'>
            Informacje o przedmiocie
          </h3>
          <div className='space-y-2'>
            <p className='text-gray-700'>
              <span className='font-semibold'>ECTS:</span> {ects}
            </p>
            <p className='text-gray-700'>
              <span className='font-semibold'>Semestr:</span> {semester}
            </p>
          </div>
        </div>
        <div>
          <h3 className='text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2'>
            Co powinieneś już wiedzieć?
          </h3>
          <p className='text-gray-700'>{prerequisites || 'Brak'}</p>
        </div>
      </div>

      <div>
        <h3 className='text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2'>
          O czym jest ten kurs?
        </h3>
        <p className='text-gray-700 leading-relaxed'>{objectives}</p>
      </div>
    </div>
  )
}
