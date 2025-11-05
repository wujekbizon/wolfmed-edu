import { CardProps } from "@/constants/educationalPathCards";
import Image from "next/image";
import Link from "next/link";

const SimplePathCard = ({
  title,
  description,
  imgSrc,
  text,
  url,
}: CardProps) => {
  return (
    <div className="w-full @container bg-red-50/40 border border-zinc-900/20 backdrop-blur-md rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow" >
      <div className="h-full flex flex-col @md:flex-row flex-1 gap-4">
        {imgSrc && (
          <div className="w-full @md:w-1/3">
            <Image
              src={imgSrc}
              alt={title}
              width={600}
              height={300}
              className="rounded h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-col justify-between flex-1">
          <h3 className="text-xl @lg:text-2xl font-semibold text-zinc-800 text-center md:text-left mb-2">{title}</h3>
          <p className="text-base @md:text-lg text-zinc-700 text-center md:text-left">{description}</p>
          {text && url && (
            <Link href={url} className="mt-4 text-sm text-red-400 hover:text-red-500 animate-pulse transition-colors text-center md:text-left">
              {text} 
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimplePathCard; 