import ChooseAnswerCount from "./ChooseAnswerCount"
import CreateTestForm from "./CreateTestForm"
import UploadTestForm from "./UploadTestForm"
import { PopulatedCategories } from "@/types/categoryType"

interface CreateTabProps {
  categories: PopulatedCategories[]
  isAdmin?: boolean
}

export default function CreateTab({ categories, isAdmin }: CreateTabProps) {
  return (
    <div className="w-full bg-white/60 backdrop-blur-sm rounded-xl border border-zinc-200/60 shadow-md p-6 space-y-8 hover:shadow-lg transition-all duration-300">
      <ChooseAnswerCount />
      <CreateTestForm categories={categories} />
      {isAdmin && <UploadTestForm />}
    </div>
  )
}
