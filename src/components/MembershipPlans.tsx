import BasicMemberCard from './BasicMemberCard'
import CustomMemberCard from './CustomMemberCard'
import PremiumMemberCard from './PremiumMemberCard'

export default function MembershipPlans() {
  return (
    <>
      <div className=" w-full flex items-center justify-center">
        <h1 className="text-3xl sm:text-4xl py-8 text-center font-bold">
          Spróbuj jednego z naszych dostępnych planów.
        </h1>
      </div>
      <div className="min-h-3/4 w-full flex-col md:flex-row flex-wrap flex justify-center items-center gap-4 md:gap-8 xl:gap-12 p-2 sm:p-8">
        <BasicMemberCard />
        <PremiumMemberCard />
        <CustomMemberCard />
      </div>
    </>
  )
}
