"use client";
import React, { useRef, useState } from "react";
import FilledButton from "./ui/Buttons/FilledButton";

type Item = {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  button?: string;
};

export default function Slider({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const maxSteps = items.length;

  const handleNext = () => setActive((s) => Math.min(maxSteps - 1, s + 1));
  const handleBack = () => setActive((s) => Math.max(0, s - 1));

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 40) handleBack();
    else if (dx < -40) handleNext();
    touchStartX.current = null;
  };

  return (
    <div className="w-full">
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="overflow-hidden w-full"
      >
        <div
          className="flex transition-transform duration-300 ease-out w-full"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {items.map((it) => (
            <div key={it.id} className="flex-[0_0_100%] w-full">
              <div
                className="relative min-h-[600px] w-full shadow overflow-hidden bg-cover bg-center"
                style={{
                  backgroundImage: it.image ? `url(${it.image})` : "none",
                  backgroundColor: it.image ? "transparent" : "#eeeeee",
                }}
              >
                <div
                  className="absolute inset-0 bg-black/50"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"
                  aria-hidden="true"
                />

                <button
                  onClick={handleBack}
                  aria-label="Précédent"
                  className="absolute top-1/2 left-2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full text-white bg-[var(--color-primary)] hover:opacity-90"
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Suivant"
                  className="absolute top-1/2 right-2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full text-white bg-[var(--color-primary)] hover:opacity-90"
                >
                  ›
                </button>

                <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-20">
                  <div className="flex flex-col justify-center items-center text-white">
                    <h1 className="!text-6xl text-align-center">{it.title}</h1>
                    <div
                      className="w-24 h-1 rounded mt-4 mb-4"
                      style={{
                        backgroundColor: "var(--color-secondary, #FCE500)",
                      }}
                      aria-hidden="true"
                    />
                    {it.subtitle && <p className="!text-3xl">{it.subtitle}</p>}
                    {it.description && (
                      <p className="max-w-xl mt-4 text-center mb-8">
                        {it.description}
                      </p>
                    )}
                    {it.button && (
                      <FilledButton className="">{it.button}</FilledButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
