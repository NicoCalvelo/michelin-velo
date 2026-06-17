"use client";
import useEmblaCarousel from "embla-carousel-react";
import { Bike, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const tireCategories = [
  { title: "VTT", image: "/demo.jpg" },
  { title: "Gravel et Cross", image: "/demo.jpg" },
  { title: "Vélo de course", image: "/demo.jpg" },
  { title: "Tour et ville", image: "/demo.jpg" },
];

export default function TireSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: false,
    containScroll: "trimSnaps",
  });

  const [progress, setProgress] = useState(0);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  // 👉 progression réelle
  useEffect(() => {
    if (!emblaApi) return;

    const updateProgress = () => {
      const snaps = emblaApi.scrollSnapList();
      const index = emblaApi.selectedScrollSnap();

      const value = snaps.length > 1 ? index / (snaps.length - 1) : 0;
      setProgress(value);
    };

    updateProgress();

    emblaApi.on("select", updateProgress);
    emblaApi.on("scroll", updateProgress);

    return () => {
      emblaApi.off("select", updateProgress);
      emblaApi.off("scroll", updateProgress);
    };
  }, [emblaApi]);

  return (
    <section className="site-container py-20">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Colonne gauche */}
        <div className="lg:w-1/3 flex flex-col justify-center gap-4">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary-color">
              <Bike size={32} strokeWidth={2} className="text-primary-dark" />
            </div>

            <h1>Nos pneus</h1>
          </div>

          <p className="max-w-md">
            Découvrez la gamme de pneus Michelin conçue pour offrir performance,
            adhérence et durabilité sur tous les terrains.
          </p>
        </div>

        {/* Colonne droite */}
        <div className="lg:w-2/3">
          {/* Navigation */}
          <div className="flex justify-end gap-3 mb-6">
            <button onClick={scrollPrev} className="michelin-slider-arrow">
              <ChevronLeft size={18} />
            </button>

            <button onClick={scrollNext} className="michelin-slider-arrow">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Slider */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-5">
              {tireCategories.map((item) => (
                <div
                  key={item.title}
                  className="flex-[0_0_80%] md:flex-[0_0_55%]"
                >
                  <div className="tire-card group relative border">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-black/35 transition-all duration-500 group-hover:bg-black/10" />

                    {/* animation fond */}
                    <div className="tire-card__bg" />

                    <div className="relative z-10 flex h-full flex-col justify-end p-8">
                      <h3 className="tire-card__title text-white">
                        {item.title}
                      </h3>

                      <div className="tire-card__line" />

                      <Link
                        href="/product#catalogue"
                        className="tire-card__link text-white"
                      >
                        En savoir plus
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BARRE PROGRESSION DYNAMIQUE */}
          <div className="mt-8 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary-color transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
