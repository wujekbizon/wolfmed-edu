import { getUserCustomTests } from "@/server/queries"
import CustomTestsList from "./CustomTestsList"

interface ManageTabProps {
  userId: string
}

export default async function ManageTab({ userId }: ManageTabProps) {
  const userTests = await getUserCustomTests(userId)

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-zinc-200/60 shadow-md p-6 hover:shadow-lg transition-all duration-300">
      <CustomTestsList tests={userTests} />
    </div>
  )
}
