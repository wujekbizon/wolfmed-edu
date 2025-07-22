import { useInView } from "react-intersection-observer";

import TitleButton from "./TitleButton";
import Title from "./Title";
import ExploreLink from "./ExploreLink";
import { CardProps } from "@/constants/educationalPathCards";
import Image from "next/image";
import NurseIcon from "./icons/NurseIcon";
import CaregiverIcon from "./icons/CaregiverIcon";
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
          } flex items-center flex-col w-full h-full p-4 xs:p-8 sm:p-14 gap-8 sm:gap-24 transition-all duration-800 ease-in-out ${
            className || ""
          }`}
        >
          <div className="w-full h-[65vh] flex flex-col items-center justify-center gap-4 md:gap-14 flex-1/2">
            <div className="w-full flex flex-col items-center gap-16">
              <div className="pt-8">
                <Title title={title} className="max-w-full text-center" />
                <p className="text-zinc-400 font-medium text-lg sm:text-xl leading-8 text-center">
                  {description}
                </p>
              </div>
              <div className="flex flex-row flex-wrap justify-center items-center gap-12">
                {customDescriptions?.map((item) => (
                  <FeatureCard {...item} key={item.id} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <ExploreLink text={text} url={url} />
            </div>
          </div>
          <div className="w-full flex-1/2">
            <Image
              src={imgSrc}
              alt={title}
              className="w-full h-[700px] object-cover rounded-[25px]"
            />
          </div>
        </div>
      ) : (
        <div
          ref={ref}
          className={`${
            inView ? "opacity-100" : "opacity-0"
          } flex items-center flex-col lg:flex-row w-full h-full p-4 xs:p-8 sm:p-14 gap-8 sm:gap-24 transition-all duration-800 ease-in-out ${
            className || ""
          }`}
        >
          <div className="w-full h-[65vh] flex flex-col items-center justify-center gap-4 md:gap-14 flex-1/2">
            {/* <TitleButton title={titleBtn} /> */}
            <div className="border border-zinc-800 bg-slate-900 rounded-4xl flex items-center justify-center">
              {icon === "nurse" && (
                <NurseIcon
                  width={110}
                  height={110}
                  primary="#c6dff7"
                  secondary="#ff8181"
                />
              )}
              {icon === "caregiver" && (
                <CaregiverIcon
                  width={110}
                  height={110}
                  primary="#c6dff7"
                  secondary="#ff8181"
                />
              )}
            </div>
            <div className="flex flex-col items-center gap-12">
              <Title title={title} />
              <p className="max-w-4xl text-zinc-400 font-medium text-lg sm:text-xl leading-8 text-center">
                {description}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <ExploreLink text={text} url={url} />
            </div>
          </div>
          <div className="w-full h-[65vh] flex-1/2">
            <Image
              src={imgSrc}
              alt={title}
              className="w-full h-full object-cover rounded-[25px]"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default EducationalPathCard;
