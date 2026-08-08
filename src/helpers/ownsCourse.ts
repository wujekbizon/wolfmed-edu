export function ownsCourse(courseSlug: string, ownedCourses: string[]): boolean {
  return (
    ownedCourses.includes(`${courseSlug}-basic`) ||
    ownedCourses.includes(`${courseSlug}-premium`)
  )
}
