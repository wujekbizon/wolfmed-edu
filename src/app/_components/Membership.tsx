import BasicMemberCard from '@/components/BasicMemberCard'
import CustomMemberCard from '@/components/CustomMemberCard'
import PremiumMemberCard from '@/components/PremiumMemberCard'

export default function Membership() {
  return (
    <section className="min-h-[calc(100vh_-_70px)] bg-[url('/member.jpg')] bg-top rounded-bl-[46px] bg-cover w-full flex flex-col items-center justify-center overflow-x-hidden">
      <div className="w-0 h-0 border-solid border-r-[calc(100vw_-_6px)] border-t-transparent border-r-transparent border-b-[5vw] border-b-zinc-100/70"></div>
      <div className="bg-zinc-100/70 min-h-2/3 w-full flex-col lg:flex-row flex justify-center items-center gap-6 p-2 sm:p-8">
        <BasicMemberCard />
        <PremiumMemberCard />
        <CustomMemberCard />
      </div>
      <div className="w-0 h-0 border-solid border-l-[calc(100vw_-_7px)] border-t-[5vw]  border-t-zinc-100/70 border-l-transparent"></div>
    </section>
  )
}
