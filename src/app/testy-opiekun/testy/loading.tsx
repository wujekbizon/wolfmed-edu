import TestsLevelMenu from '@/components/TestsLevelMenu'

export default function Loading() {
  return (
    <section className="flex w-full flex-col items-center p-0 sm:p-4">
      <div className="w-full h-full flex items-center justify-center">
        <TestsLevelMenu isLoading />
      </div>
    </section>
  )
}
