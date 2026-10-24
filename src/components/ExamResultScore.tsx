import { CheckCircle2, CircleMinus, CircleHelp, CircleX } from 'lucide-react'
import { getExamResultScoreStatus } from '@/helpers/getExamResultScoreStatus'
import { EXAM_RESULT_SCORE_STYLES } from '@/constants/practicalExamResults'
import type { ExamResultScoreProps } from '@/types/practicalExamResultTypes'

export default function ExamResultScore({ earned, max }: ExamResultScoreProps) {
  const status = getExamResultScoreStatus(earned, max)
  const style = EXAM_RESULT_SCORE_STYLES[status]
  const Icon = status === 'full' ? CheckCircle2 : status === 'partial' ? CircleMinus : status === 'none' ? CircleX : CircleHelp
  return <span className={`inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${style.className}`}><Icon size={15} className='shrink-0' />{style.label} · {earned}/{max} pkt</span>
}
