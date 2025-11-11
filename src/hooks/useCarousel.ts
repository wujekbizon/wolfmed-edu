import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "embla-carousel";


interface UseCarouselProps {
  options?: EmblaOptionsType;
  autoplayDelay?: number;
}

export const useCarousel = ({ 
  options = { 
    loop: true, 
    align: "center",
    skipSnaps: false,
    duration: 20,
    startIndex: 0,
    containScroll: "trimSnaps"
  },
  autoplayDelay = 3000 
}: UseCarouselProps = {}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [selected, setSelected] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
    setSelected(index);
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    setSelected(emblaApi?.selectedScrollSnap() || 0);
  }, [emblaApi]);

  // Set up the autoplay functionality
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("pointerDown", () => setIsPlaying(false));
  }, [emblaApi, onSelect]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPlaying) {
      intervalId = setInterval(() => {
        scrollNext();
      }, autoplayDelay);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, scrollNext, autoplayDelay]);

  return {
    emblaRef,
    selected,
    isPlaying,
    scrollTo,
    setIsPlaying
  };
};
