export function determineLectureStatus(date: string, duration: number = 90) {
  const lectureStart = new Date(date)
  const lectureEnd = new Date(lectureStart.getTime() + duration * 60000) // duration in minutes
  const now = new Date()

  if (now < lectureStart) {
    return 'scheduled'
  } else if (now >= lectureStart && now <= lectureEnd) {
    return 'in-progress'
  } else {
    return 'completed'
  }
}
