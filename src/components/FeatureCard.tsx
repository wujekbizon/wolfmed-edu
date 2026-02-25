interface FeatureCardPropsInterface {
    id: number
    title: string
    description: string
    icon?: React.JSX.Element
  }

const FeatureCard: React.FC<FeatureCardPropsInterface> = ({ title, description, icon}) => {

    return (
      <div className="w-full lg:w-[350px] min-h-[420px] flex flex-col items-center justify-around rounded-[20px] p-6 bg-[#18181c]/90 border border-[#585858]/60 shadow-xl shadow-black/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-black/70 hover:border-zinc-500/70">
        <div className="w-[90px] h-[90px] flex justify-center items-center p-[11px] rounded-[15px] bg-[#3b3b42] shadow-md shadow-black/40 transition-all duration-500 ease-in-out hover:bg-gradient-to-r hover:from-red-400 hover:to-red-500 hover:shadow-red-500/30">
          {icon}
        </div>
        <h2 className="text-white text-xl font-normal">{title}</h2>
        <p className="text-[#9e9e9e] text-base font-normal text-center">{description}</p>
      </div>
    )
  }
  export default FeatureCard