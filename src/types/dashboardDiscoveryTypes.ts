import type { LucideIcon } from 'lucide-react'
import type { getUserEnrollmentsAction } from '@/actions/course-actions'

export type DashboardEnrollments = Awaited<ReturnType<typeof getUserEnrollmentsAction>>['enrollments']
export type DashboardDiscoveryProps = { enrollments: DashboardEnrollments; loading?: boolean }
export type DashboardTool = { icon: LucideIcon; label: string; description: string; href: string; premium: boolean; iconTone: 'lavender' | 'rose' }
export type DashboardToolProps = { tool: DashboardTool; hasPremium: boolean; upgradeHref: string; loading?: boolean }
export type DashboardCourse = { slug: string; title: string; description: string; subjects: string }
export type DashboardCourseProps = { course: DashboardCourse; hasAccess: boolean; loading?: boolean }
