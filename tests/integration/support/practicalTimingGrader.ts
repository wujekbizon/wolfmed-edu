export const probe = {
  submissions: 0,
  calls: [] as number[],
  studyMinutes: [] as number[],
  pending: [] as Array<(status: 'SUCCESS' | 'ERROR') => void>,
}

export async function gradePracticalExamAction(_previous: unknown, data: FormData) {
  const seconds = Number(data.get('timeSpent'))
  probe.calls.push(seconds)
  const status = await new Promise<'SUCCESS' | 'ERROR'>((resolve) => probe.pending.push(resolve))
  if (status === 'SUCCESS') probe.studyMinutes.push(Math.min(Math.max(1, Math.round(seconds / 60)), 120))
  return { status, message: '', timestamp: Date.now(), result: null }
}
