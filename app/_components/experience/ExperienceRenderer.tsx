import React from "react";
import {
  BlockType,
  ChapterContentBlock,
  CircuitOverviewBlock,
  ExperienceBlock,
  ExpertQuoteBlock,
  HeroVideoBlock,
  TelemetryDashboardBlock,
} from "@/app/_models/experience";
import { Row } from "../ui/Layout/Rows";

interface ExperienceRendererProps {
  blocks: ExperienceBlock[];
  editable?: boolean;
  className?: string;
}

function getEmbeddableVideoUrl(videoUrl: string): string {
  const trimmed = videoUrl.trim();
  if (!trimmed) return "";

  // Accept a raw YouTube video id for convenience in admin inputs.
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}`;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();

    const isYouTubeHost =
      host === "youtu.be" ||
      host === "www.youtu.be" ||
      host === "youtube.com" ||
      host === "www.youtube.com" ||
      host === "m.youtube.com";

    if (!isYouTubeHost) return trimmed;

    let videoId = "";

    if (host.includes("youtu.be")) {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (url.pathname.startsWith("/watch")) {
      videoId = url.searchParams.get("v") ?? "";
    } else if (url.pathname.startsWith("/embed/")) {
      videoId = url.pathname.split("/")[2] ?? "";
    } else if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/live/")) {
      videoId = url.pathname.split("/")[2] ?? "";
    }

    if (!videoId) return trimmed;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return trimmed;
  }
}

function blockWrapper(editable: boolean): string {
  return editable
    ? "rounded-xl border-2 border-dashed border-primary-color/40 bg-white p-5"
    : "rounded-xl rounded-tr-3xl md:rounded-tr-[4rem] border border-gray-200 bg-white p-6";
}

function HeroVideoView({ block, editable }: { block: HeroVideoBlock; editable: boolean }) {
  const embedUrl = getEmbeddableVideoUrl(block.videoUrl);

  return (
    <section className={blockWrapper(editable)}>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900">{block.headline}</h3>
        {block.subheadline && <p className="text-gray-600">{block.subheadline}</p>}
      </div>
      <div className="mt-4 aspect-video w-full relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={block.headline}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">Aucune vidéo configurée</div>
        )}
      </div>
    </section>
  );
}

function ExpertQuoteView({ block, editable }: { block: ExpertQuoteBlock; editable: boolean }) {
  return (
    <section className={blockWrapper(editable)}>
      <div className="flex items-start gap-4">
        {block.avatarUrl ? (
          <img src={block.avatarUrl} alt={block.pilotName} className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-500">
            Avatar
          </div>
        )}
        <div>
          <p className="text-sm text-gray-500">{block.circuitName}</p>
          <h3 className="text-lg font-bold text-gray-900">{block.pilotName}</h3>
          <p className="text-sm text-gray-500">{block.pilotRole}</p>
        </div>
      </div>
      <blockquote className="mt-4 text-lg font-medium leading-relaxed text-gray-800">“{block.quote}”</blockquote>
    </section>
  );
}

function TelemetryDashboardView({ block, editable }: { block: TelemetryDashboardBlock; editable: boolean }) {
  return (
    <section className={blockWrapper(editable)}>
      <div className="flex flex-col mt-4">
        <div className="overflow-hidden rounded-lg bg-gray-100">
          {block.trackMapImage ? (
            <img src={block.trackMapImage} alt="Carte circuit" className="h-full w-full object-cover" />
          ) : (
            <div className="flex min-h-44 items-center justify-center text-sm text-gray-500">
              Image du tracé non définie
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-3xl! mb-8! italic font-extralight! leading-9 text-slate-900">"{block.technicalFeedback}"</p>
          {block.metrics.map((metric, index) => (
            <div
              key={`${metric.label}-${index}`}
              className="rounded-lg h-fit border border-gray-200 bg-white px-3 py-2"
            >
              <Row className="gap-2">
                {metric.icon && (
                  <div
                    className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 p-1.5"
                    dangerouslySetInnerHTML={{ __html: metric.icon }}
                  ></div>
                )}
                <div>
                  <p className="text-xs! font-semibold uppercase text-gray-500">{metric.label}</p>
                  <p className="text-base! font-bold text-gray-900">{metric.value}</p>
                </div>
              </Row>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChapterContentView({ block, editable }: { block: ChapterContentBlock; editable: boolean }) {
  const image = (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
      {block.imageUrl ? (
        <img src={block.imageUrl} alt={block.title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex min-h-52 items-center justify-center text-sm text-gray-500">
          Image du chapitre non définie
        </div>
      )}
    </div>
  );

  return (
    <section className={blockWrapper(editable)}>
      <div className="grid gap-4 lg:grid-cols-2">
        {block.imagePosition === "left" && image}
        <div>
          <h3 className="text-xl font-bold text-gray-900">{block.title}</h3>
          <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">{block.contentMarkdown}</div>
        </div>
        {block.imagePosition === "right" && image}
      </div>
    </section>
  );
}

function CircuitOverviewView({ block, editable }: { block: CircuitOverviewBlock; editable: boolean }) {
  return (
    <section className={blockWrapper(editable)}>
      <h3 className="text-xl font-bold text-gray-900">{block.circuitTitle}</h3>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
          {block.mapImageUrl ? (
            <img src={block.mapImageUrl} alt={block.circuitTitle} className="h-full w-full object-cover" />
          ) : (
            <div className="flex min-h-52 items-center justify-center text-sm text-gray-500">
              Carte du circuit non définie
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 h-fit">
          {block.stats.map((stat, index) => (
            <div key={`${stat.label}-${index}`} className="rounded-lg border h-fit border-gray-200 bg-white px-3 py-2">
              <p className="text-xs! font-semibold uppercase text-gray-500">{stat.label}</p>
              <p className="text-base! font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderBlock(block: ExperienceBlock, editable: boolean) {
  switch (block.type) {
    case BlockType.HERO_VIDEO:
      return <HeroVideoView block={block} editable={editable} />;
    case BlockType.EXPERT_QUOTE:
      return <ExpertQuoteView block={block} editable={editable} />;
    case BlockType.TELEMETRY_DASHBOARD:
      return <TelemetryDashboardView block={block} editable={editable} />;
    case BlockType.CHAPTER_CONTENT:
      return <ChapterContentView block={block} editable={editable} />;
    case BlockType.CIRCUIT_OVERVIEW:
      return <CircuitOverviewView block={block} editable={editable} />;
    default:
      return null;
  }
}

export default function ExperienceRenderer({ blocks, editable = false, className = "" }: ExperienceRendererProps) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  if (!sorted.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
        Aucun bloc à afficher
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-5 gap-4 ${className}`}>
      {sorted.map((block) => (
        <div
          key={block.id}
          className={
            block.type === BlockType.HERO_VIDEO
              ? "col-span-3 row-span-2"
              : block.type === BlockType.TELEMETRY_DASHBOARD
                ? "col-span-2 row-span-3"
                : block.type === BlockType.CIRCUIT_OVERVIEW
                  ? "col-span-3 row-span-1"
                  : "col-span-2 row-span-1"
          }
        >
          {editable && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary-color">
              {block.type.replaceAll("_", " ")}
            </p>
          )}
          {renderBlock(block, editable)}
        </div>
      ))}
    </div>
  );
}
