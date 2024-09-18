import BasicMemberCard from '@/components/BasicMemberCard'
import CustomMemberCard from '@/components/CustomMemberCard'
import PremiumMemberCard from '@/components/PremiumMemberCard'

export default function Membership() {
  return (
    <section className="bg-gradient-to-b from-zinc-50 to-[#ffafaf] w-full h-full py-8">
      <div className=" w-full flex items-center justify-center">
        <h1 className="text-3xl sm:text-4xl py-4 text-center">Spróbuj jednego z naszych dostępnych planów.</h1>
      </div>
      <div className="min-h-3/4 w-full flex-col md:flex-row flex-wrap flex justify-center items-center gap-4 xl:gap-12 p-2 sm:p-8">
        <BasicMemberCard />
        <PremiumMemberCard />
        <CustomMemberCard />
      </div>
    </section>
  )
}
