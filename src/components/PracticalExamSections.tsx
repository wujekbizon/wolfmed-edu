import ExamFormCard from '@/components/ExamFormCard'
import PracticalExamTask from '@/components/PracticalExamTask'
import PracticalExamValidationErrors from '@/components/PracticalExamValidationErrors'
import type { PracticalExamSectionsProps } from '@/types/practicalExamWorkspaceTypes'

export default function PracticalExamSections({ exam, session, active, formRef }: PracticalExamSectionsProps) {
  return (
    <form ref={formRef} id='exam-form' action={session.action} onSubmitCapture={session.handleSubmitCapture} className='mx-auto w-full max-w-5xl'>
      <input type='hidden' name='examId' value={exam.id} />
      <input type='hidden' name='answers' value={JSON.stringify(session.answers)} />
      <input type='hidden' name='timeSpent' defaultValue='0' />
      <PracticalExamValidationErrors formState={session.formState} />
      {exam.assessedTasks.map((task, index) => (
        <div key={`task-${index}`} id={`practical-exam-panel-${index}`} role='tabpanel' aria-labelledby={`practical-exam-tab-${index}`} tabIndex={0} hidden={active !== index} className='focus-visible:outline-2 focus-visible:outline-rose-400'>
          <PracticalExamTask task={task} onOrderChange={(order) => session.handleOrderChange(index, order)} />
        </div>
      ))}
      {exam.forms.map((form, index) => (
        <div key={form.id} id={`practical-exam-panel-${exam.assessedTasks.length + index}`} role='tabpanel' aria-labelledby={`practical-exam-tab-${exam.assessedTasks.length + index}`} tabIndex={0} hidden={active !== exam.assessedTasks.length + index} className='focus-visible:outline-2 focus-visible:outline-rose-400'>
          <ExamFormCard exam={exam} form={form} index={index} formState={session.formState} answers={session.answers} onValueChange={session.handleValueChange} onListLineChange={session.handleListLineChange} onChoiceToggle={session.handleChoiceToggle} />
        </div>
      ))}
      {session.noScriptFallback}
    </form>
  )
}
