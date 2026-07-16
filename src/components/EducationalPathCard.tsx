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
          } ${ className || ""} flex items-center flex-col w-full h-full p-4 sm:p-8 xl:p-4 2xl:p-14 gap-8 sm:gap-16 transition-all duration-800 ease-in-out`}
        >
          <div className="w-full flex flex-col items-center justify-center gap-10 flex-1/2 py-8 md:py-12">
            <div className="w-full flex flex-col items-center gap-10">
              <div className="pt-8">
                <Title title={title} className="max-w-full text-center" />
                <p className="text-zinc-400 font-medium text-lg sm:text-xl leading-8 text-center">
                  {description}
                </p>
              </div>
              <div className="flex flex-row flex-wrap justify-center items-center gap-8 sm:gap-12 md:gap-20">
                {customDescriptions?.map((item) => (
                  <FeatureCard {...item} key={item.id} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <ExploreLink text={text} url={url} />
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={ref}
          className={`${
            inView ? "opacity-100" : "opacity-0"
          } flex items-center flex-col lg:flex-row w-full h-full p-4 sm:p-8 xl:p-4 2xl:p-14 gap-10 2xl:gap-16 transition-all duration-800 ease-in-out ${
            className || ""
          }`}
        >
          <div className="w-full flex flex-col items-center justify-center gap-6 flex-1/2 py-6 md:py-10">
            <div className="w-full flex flex-col items-start gap-6 lg:gap-8">
              <Title title={title} />
              <p className="max-w-2xl text-zinc-400 font-medium text-base sm:text-lg lg:text-xl leading-7 xl:leading-9 text-left">
                {description}
              </p>
              <ExploreLink text={text} url={url} />
            </div>
          </div>
          <div className="relative flex-1/2 w-full">
            {/* Colored glow halo — the image floats off the dark surface */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-gradient-to-tr from-red-500/25 via-fuchsia-500/10 to-transparent blur-2xl"
            />
            {/* Offset panel behind — stacked-card depth */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-2xl border border-white/5 bg-zinc-800/50"
            />
            {/* Image frame */}
            <div className="relative w-full flex items-center rounded-2xl max-h-[42vh] border border-[#585858]/60 shadow-xl shadow-black/50 backdrop-blur-sm overflow-hidden">
              <Image
                src={imgSrc}
                alt={title}
                className="w-full h-full object-cover"
                width={1024}
                height={1024}
                priority
              />
              {/* Scrim + inner ring for on-image depth */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"
              />
            </div>
          </div>

        </div>
      )}
    </>
  );
};

export default EducationalPathCard;
