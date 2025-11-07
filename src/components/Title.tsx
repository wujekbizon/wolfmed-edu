
const Title = ({ title, className }: { title: string, className?:string }) => {
  return <h1 className={`${className} max-w-2xl text-xl sm:text-2xl md:text-3xl lg:text-2xl xl:text-4xl font-bold underline text-white`}>{title}</h1>
}
export default Title