import { useInView } from "react-intersection-observer";
import Title from "./Title";
import ExploreLink from "./ExploreLink";
import { CardProps } from "@/constants/educationalPathCards";
import Image from "next/image";
import FeatureCard from "./FeatureCard";

const EducationalPathCard = ({
  description,
  customDescriptions,
  title,
  titleBtn,
  imgSrc,
  text,
  url,
  className,
  icon,
  vertical,
}: CardProps) => {
  const { ref, inView } = useInView();

  return (
    <>
      {vertical ? (
        <div
          ref={ref}
          className={`${
            inView ? "opacity-100" : "opacity-0"
          } ${ className || ""} flex items-center flex-col w-full h-full p-4 sm:p-8 xl:p-4 2xl:p-14 gap-8 sm:gap-24 transition-all duration-800 ease-in-out`}
        >
          <div className="w-full h-[55vh] flex flex-col items-center justify-center gap-14 flex-1/2">
            <div className="w-full flex flex-col items-center gap-16">
              <div className="pt-8">
                <Title title={title} className="max-w-full text-center" />
                <p className="text-zinc-400 font-medium text-lg sm:text-xl leading-8 text-center">
                  {description}
                </p>
              </div>
              <div className="flex flex-row flex-wrap justify-center items-center gap-8 sm:gap-12 md:gap-24">
                {customDescriptions?.map((item) => (
                  <FeatureCard {...item} key={item.id} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <ExploreLink text={text} url={url} />
            </div>
          </div>
          {/* <div className="w-full hidden md:flex items-center h-[55vh] flex-1/2 justify-center">
            <Image
              src={imgSrc}
              alt={title}
              className="w-2/3 h-[600px] object-cover rounded-xl"
              width={1024}
              height={1024}
              priority
            />
          </div> */}
        </div>
      ) : (
        <div
          ref={ref}
          className={`${
            inView ? "opacity-100" : "opacity-0"
          } flex items-center flex-col lg:flex-row w-full h-full p-4 sm:p-8 xl:p-4 2xl:p-14 gap-12 2xl:gap-24 transition-all duration-800 ease-in-out ${
            className || ""
          }`}
        >
          <div className="w-full h-[55vh] flex flex-col items-center justify-center gap-4 md:gap-14 flex-1/2 ">
            <div className="h-full w-full flex flex-col items-start justify-evenly gap-6 lg:gap-0">
              <Title title={title} />
              <p className="max-w-2xl text-zinc-400 font-medium text-base sm:text-lg lg:text-xl leading-7 xl:leading-9 text-left">
                {description}
              </p>
              <ExploreLink text={text} url={url} />
            </div>
          </div>
          <div className="w-full flex items-center h-[55vh] flex-1/2 ">
            <Image
              src={imgSrc}
              alt={title}
              className="w-full h-full object-cover rounded-xl"
              width={1024}
              height={1024}
              priority
            />
          </div>

        </div>
      )}
    </>
  );
};

export default EducationalPathCard;
