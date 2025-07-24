interface FeatureCardPropsInterface {
    id: number
    title: string
    description: string
    icon?: React.JSX.Element
  }

const FeatureCard: React.FC<FeatureCardPropsInterface> = ({ title, description, icon}) => {

    return (
      <div className="w-full min-h-[420px] flex flex-col items-center justify-around rounded-[20px] mt-[30px] p-6 bg-[#18181c] border border-[#585858] md:w-[350px]">
        <div className="w-[90px] h-[90px] flex justify-center items-center p-[11px] rounded-[15px] bg-[#3b3b42] transition-all duration-1000 ease-in-out hover:bg-gradient-to-r hover:from-red-400 hover:to-red-500">
          {icon}
        </div>
        <h2 className="text-white text-xl font-normal">{title}</h2>
        <p className="text-[#9e9e9e] text-base font-normal text-center">{description}</p>
      </div>
    )
  }
  export default FeatureCard