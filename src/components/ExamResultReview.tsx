import DropdownSelect from '@/components/ui/DropdownSelect'
import TabPanel from '@/components/ui/TabPanel'
import ExamResultForm from '@/components/ExamResultForm'
import ExamResultProcedure from '@/components/ExamResultProcedure'
import type { ExamResultReviewProps } from '@/types/practicalExamResultTypes'

export default function ExamResultReview({ result, answers, active, procedureId, formId, onProcedureChange, onFormChange }: ExamResultReviewProps) {
  const procedure = result.procedures.find((item) => String(item.taskIndex) === procedureId)
  const form = result.forms.find((item) => item.formId === formId)
  return (
    <>
      {result.procedures.length > 0 && <TabPanel id='exam-results' tabId='procedures' active={active === 'procedures'}>
        <div className='space-y-4'>
          {result.procedures.length > 1 && <DropdownSelect ariaLabel='Wybierz czynności do przeglądu' value={procedureId} onSelect={onProcedureChange} options={result.procedures.map((item) => ({ value: String(item.taskIndex), label: `${item.title} · ${item.earned}/${item.max} pkt` }))} />}
          {procedure && <ExamResultProcedure procedure={procedure} />}
        </div>
      </TabPanel>}
      {result.forms.length > 0 && <TabPanel id='exam-results' tabId='forms' active={active === 'forms'}>
        <div className='space-y-4'>
          {result.forms.length > 1 && <DropdownSelect ariaLabel='Wybierz dokument do przeglądu' value={formId} onSelect={onFormChange} options={result.forms.map((item) => ({ value: item.formId, label: `${item.title} · ${item.earned}/${item.max} pkt` }))} />}
          {form && <ExamResultForm form={form} answers={answers} />}
        </div>
      </TabPanel>}
    </>
  )
}
