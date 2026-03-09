import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "embla-carousel";

interface UseCarouselProps {
  options?: EmblaOptionsType;
  autoplayDelay?: number;
}

const DEFAULT_OPTIONS: EmblaOptionsType = {
  loop: true,
  align: "center",
  skipSnaps: false,
  duration: 20,
  startIndex: 0,
  containScroll: "trimSnaps",
};

export const useCarousel = ({
  options = DEFAULT_OPTIONS,
  autoplayDelay = 3000,
}: UseCarouselProps = {}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [selected, setSelected] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    setSelected(emblaApi?.selectedScrollSnap() ?? 0);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const handlePointerDown = () => setIsPlaying(false);

    emblaApi.on("select", onSelect);
    emblaApi.on("pointerDown", handlePointerDown);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("pointerDown", handlePointerDown);
    };
  }, [emblaApi, onSelect]);

  // Use a ref so the interval never needs to re-register when emblaApi stabilises
  const emblaApiRef = useRef(emblaApi);
  useEffect(() => {
    emblaApiRef.current = emblaApi;
  }, [emblaApi]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => emblaApiRef.current?.scrollNext(), autoplayDelay);
    return () => clearInterval(id);
  }, [isPlaying, autoplayDelay]);

  return {
    emblaRef,
    selected,
    isPlaying,
    scrollTo,
    scrollPrev,
    scrollNext,
    setIsPlaying,
  };
};
