import type { AuthMode } from '@/types/authTypes'

export default function AuthFormSkeleton({ mode }: { mode: AuthMode }) {
  const isSignUp = mode === 'sign-up'

  return (
    <div role="status" aria-label="Wczytywanie formularza" className="space-y-6">
      <span className="sr-only">Wczytywanie formularza</span>
      <div className="space-y-3">
        <div className="auth-skeleton-shimmer h-10 w-3/5 rounded-xl" />
        <div className="auth-skeleton-shimmer h-4 w-4/5 rounded-md" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="auth-skeleton-shimmer h-12 rounded-[14px]" />
        <div className="auth-skeleton-shimmer h-12 rounded-[14px]" />
      </div>
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-200/80" />
        <div className="auth-skeleton-shimmer h-4 w-8 rounded-md" />
        <div className="h-px flex-1 bg-zinc-200/80" />
      </div>
      <div className="space-y-2">
        <div className="auth-skeleton-shimmer h-4 w-24 rounded-md" />
        <div className="auth-skeleton-shimmer h-12 rounded-[14px]" />
      </div>
      {isSignUp && (
        <div className="space-y-2">
          <div className="auth-skeleton-shimmer h-4 w-16 rounded-md" />
          <div className="auth-skeleton-shimmer h-12 rounded-[14px]" />
        </div>
      )}
      <div className="auth-skeleton-shimmer h-12 rounded-[14px]" />
      <div className="auth-skeleton-shimmer h-24 rounded-b-[14px]" />
    </div>
  )
}
