"use client";

import React from "react";
import { ArrowDown, ArrowUp, Copy, Eye, PencilLineIcon, Plus, Trash2, Upload } from "lucide-react";
import {
  BlockType,
  ChapterContentBlock,
  CircuitOverviewBlock,
  ExperienceBlock,
  ExpertQuoteBlock,
  HeroVideoBlock,
  TelemetryDashboardBlock,
} from "@/app/_models/experience";
import OutlinedCard from "@/app/_components/ui/Cards/OutlinedCard";
import FormInput from "@/app/_components/ui/Forms/FormInput";
import FormTextarea from "@/app/_components/ui/Forms/FormTextarea";
import FilledButton from "@/app/_components/ui/Buttons/FilledButton";
import OutlinedButton from "@/app/_components/ui/Buttons/OutlinedButton";
import ExperienceRenderer from "@/app/_components/experience/ExperienceRenderer";

function getRandomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createBlock(type: BlockType, order: number): ExperienceBlock {
  const base = { id: getRandomId(), type, order };

  switch (type) {
    case BlockType.HERO_VIDEO:
      return {
        ...base,
        type: BlockType.HERO_VIDEO,
        videoUrl: "",
        headline: "",
        subheadline: "",
      };
    case BlockType.EXPERT_QUOTE:
      return {
        ...base,
        type: BlockType.EXPERT_QUOTE,
        pilotName: "",
        pilotRole: "",
        quote: "",
        circuitName: "",
        avatarUrl: "",
      };
    case BlockType.TELEMETRY_DASHBOARD:
      return {
        ...base,
        type: BlockType.TELEMETRY_DASHBOARD,
        trackMapImage: "",
        metrics: [{ label: "", value: "", icon: "" }],
        technicalFeedback: "",
      };
    case BlockType.CHAPTER_CONTENT:
      return {
        ...base,
        type: BlockType.CHAPTER_CONTENT,
        title: "",
        contentMarkdown: "",
        imageUrl: "",
        imagePosition: "right",
      };
    case BlockType.CIRCUIT_OVERVIEW:
      return {
        ...base,
        type: BlockType.CIRCUIT_OVERVIEW,
        circuitTitle: "",
        mapImageUrl: "",
        stats: [{ label: "", value: "" }],
      };
    default:
      return {
        ...base,
        type: BlockType.HERO_VIDEO,
        videoUrl: "",
        headline: "",
        subheadline: "",
      };
  }
}

function normalizeOrders(blocks: ExperienceBlock[]): ExperienceBlock[] {
  return blocks.map((block, index) => ({ ...block, order: index }));
}

interface ExperienceBlocksEditorProps {
  blocks: ExperienceBlock[];
  onChange: (blocks: ExperienceBlock[]) => void;
  onUploadImage: (
    blockId: string,
    field: "avatarUrl" | "trackMapImage" | "imageUrl" | "mapImageUrl",
    file: File,
  ) => Promise<void>;
  disabled?: boolean;
}

export default function ExperienceBlocksEditor({
  blocks,
  onChange,
  onUploadImage,
  disabled = false,
}: ExperienceBlocksEditorProps) {
  const [previewByBlockId, setPreviewByBlockId] = React.useState<Record<string, boolean>>({});

  const isPreview = (blockId: string) => !!previewByBlockId[blockId];

  const togglePreview = (blockId: string) => {
    setPreviewByBlockId((prev) => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  const updateBlock = (blockId: string, updater: (block: ExperienceBlock) => ExperienceBlock) => {
    const next = blocks.map((block) => (block.id === blockId ? updater(block) : block));
    onChange(normalizeOrders(next));
  };

  const removeBlock = (blockId: string) => {
    onChange(normalizeOrders(blocks.filter((block) => block.id !== blockId)));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;

    const next = [...blocks];
    const current = next[index];
    next[index] = next[target];
    next[target] = current;
    onChange(normalizeOrders(next));
  };

  const duplicateBlock = (index: number) => {
    const block = blocks[index];
    const copy: ExperienceBlock = { ...block, id: getRandomId() };
    const next = [...blocks.slice(0, index + 1), copy, ...blocks.slice(index + 1)];
    onChange(normalizeOrders(next));
  };

  const addBlock = (type: BlockType) => {
    onChange([...blocks, createBlock(type, blocks.length)]);
  };

  const uploadForBlock = async (
    event: React.ChangeEvent<HTMLInputElement>,
    blockId: string,
    field: "avatarUrl" | "trackMapImage" | "imageUrl" | "mapImageUrl",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await onUploadImage(blockId, field, file);
    event.target.value = "";
  };

  return (
    <div className="space-y-4">
      {!blocks.length && (
        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
          Aucun bloc. Ajoute un bloc pour commencer.
        </div>
      )}

      {blocks.map((block, index) => (
        <div key={block.id} style={{ perspective: "1400px" }}>
          <div
            className="relative transition-transform duration-500 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: isPreview(block.id) ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div
              className={"backface-hidden " + (isPreview(block.id) ? "absolute" : "")}
              style={{ backfaceVisibility: "hidden" }}
              aria-hidden={isPreview(block.id)}
            >
              <OutlinedCard className="p-4 space-y-4 h-fit!">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="">
                    <span className="text-xs! font-semibold text-primary-color">{block.type.replaceAll("_", " ")}</span>
                    <p className="text-base! font-semibold text-gray-800">Bloc #{index + 1}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <OutlinedButton
                      type="button"
                      disabled={disabled}
                      onClick={() => togglePreview(block.id)}
                      className="p-2! pl-2.5 pr-3.5! gap-1! text-xs!"
                    >
                      {isPreview(block.id) ? <PencilLineIcon className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {isPreview(block.id) ? "Edit" : "Preview"}
                    </OutlinedButton>
                    <OutlinedButton
                      type="button"
                      disabled={disabled || index === 0}
                      onClick={() => moveBlock(index, -1)}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </OutlinedButton>
                    <OutlinedButton
                      type="button"
                      disabled={disabled || index === blocks.length - 1}
                      onClick={() => moveBlock(index, 1)}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </OutlinedButton>
                    <OutlinedButton type="button" disabled={disabled} onClick={() => duplicateBlock(index)}>
                      <Copy className="w-4 h-4" />
                    </OutlinedButton>
                    <OutlinedButton type="button" disabled={disabled} onClick={() => removeBlock(block.id)}>
                      <Trash2 className="w-4 h-4" />
                    </OutlinedButton>
                  </div>
                </div>

                {block.type === BlockType.HERO_VIDEO && (
                  <HeroVideoEditor
                    block={block}
                    disabled={disabled}
                    onChange={(next) => updateBlock(block.id, () => next)}
                  />
                )}

                {block.type === BlockType.EXPERT_QUOTE && (
                  <ExpertQuoteEditor
                    block={block}
                    disabled={disabled}
                    onChange={(next) => updateBlock(block.id, () => next)}
                    onUpload={(event) => uploadForBlock(event, block.id, "avatarUrl")}
                  />
                )}

                {block.type === BlockType.TELEMETRY_DASHBOARD && (
                  <TelemetryEditor
                    block={block}
                    disabled={disabled}
                    onChange={(next) => updateBlock(block.id, () => next)}
                    onUpload={(event) => uploadForBlock(event, block.id, "trackMapImage")}
                  />
                )}

                {block.type === BlockType.CHAPTER_CONTENT && (
                  <ChapterEditor
                    block={block}
                    disabled={disabled}
                    onChange={(next) => updateBlock(block.id, () => next)}
                    onUpload={(event) => uploadForBlock(event, block.id, "imageUrl")}
                  />
                )}

                {block.type === BlockType.CIRCUIT_OVERVIEW && (
                  <CircuitOverviewEditor
                    block={block}
                    disabled={disabled}
                    onChange={(next) => updateBlock(block.id, () => next)}
                    onUpload={(event) => uploadForBlock(event, block.id, "mapImageUrl")}
                  />
                )}
              </OutlinedCard>
            </div>

            <div
              className={"inset-0 backface-hidden" + (isPreview(block.id) ? "" : " absolute")}
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              aria-hidden={!isPreview(block.id)}
            >
              <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-700">Bloc #{index + 1}</p>
                  <span className="rounded-full bg-primary-color/10 px-2 py-1 text-xs font-semibold text-primary-color">
                    Preview
                  </span>
                </div>
                <OutlinedButton
                  type="button"
                  disabled={disabled}
                  onClick={() => togglePreview(block.id)}
                  className="p-2! pl-2.5 pr-3.5! gap-1! text-xs!"
                >
                  <PencilLineIcon className="w-4 h-4" />
                  <span>Revenir en édition</span>
                </OutlinedButton>
              </div>

              <ExperienceRenderer blocks={[block]} />
            </div>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {Object.values(BlockType).map((type) => (
          <OutlinedButton
            key={type}
            className="p-2! pl-2.5 pr-3.5!  gap-1! text-xs!"
            type="button"
            disabled={disabled}
            onClick={() => addBlock(type as BlockType)}
          >
            <Plus className="w-4 h-4" />
            {type.replaceAll("_", " ")}
          </OutlinedButton>
        ))}
      </div>
    </div>
  );
}

function HeroVideoEditor({
  block,
  onChange,
  disabled,
}: {
  block: HeroVideoBlock;
  onChange: (next: HeroVideoBlock) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormInput
        title="Titre"
        className="w-full"
        value={block.headline}
        setValue={(v) => onChange({ ...block, headline: String(v) })}
        disabled={disabled}
      />
      <FormInput
        title="Sous-titre"
        className="w-full"
        value={block.subheadline ?? ""}
        setValue={(v) => onChange({ ...block, subheadline: String(v) })}
        disabled={disabled}
      />
      <FormInput
        title="URL vidéo"
        className="w-full col-span-2"
        value={block.videoUrl}
        setValue={(v) => onChange({ ...block, videoUrl: String(v) })}
        disabled={disabled}
      />
    </div>
  );
}

function ExpertQuoteEditor({
  block,
  onChange,
  onUpload,
  disabled,
}: {
  block: ExpertQuoteBlock;
  onChange: (next: ExpertQuoteBlock) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          title="Nom pilote"
          value={block.pilotName}
          setValue={(v) => onChange({ ...block, pilotName: String(v) })}
          disabled={disabled}
        />
        <FormInput
          title="Rôle"
          value={block.pilotRole}
          setValue={(v) => onChange({ ...block, pilotRole: String(v) })}
          disabled={disabled}
        />
        <FormInput
          title="Circuit"
          value={block.circuitName}
          setValue={(v) => onChange({ ...block, circuitName: String(v) })}
          disabled={disabled}
        />
        <FormInput
          title="Avatar URL"
          value={block.avatarUrl ?? ""}
          setValue={(v) => onChange({ ...block, avatarUrl: String(v) })}
          disabled={disabled}
        />
      </div>
      <FormTextarea
        title="Citation"
        value={block.quote}
        setValue={(v) => onChange({ ...block, quote: v })}
        disabled={disabled}
        rows={4}
      />
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
        <Upload className="w-4 h-4" />
        Upload avatar
        <input type="file" accept="image/*" className="hidden" disabled={disabled} onChange={onUpload} />
      </label>
    </div>
  );
}

function TelemetryEditor({
  block,
  onChange,
  onUpload,
  disabled,
}: {
  block: TelemetryDashboardBlock;
  onChange: (next: TelemetryDashboardBlock) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) {
  const updateMetric = (metricIndex: number, key: "label" | "value" | "icon", value: string) => {
    const metrics = block.metrics.map((metric, index) =>
      index === metricIndex ? { ...metric, [key]: value } : metric,
    );
    onChange({ ...block, metrics });
  };

  const removeMetric = (metricIndex: number) => {
    onChange({ ...block, metrics: block.metrics.filter((_, index) => index !== metricIndex) });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          title="Image tracé (URL)"
          value={block.trackMapImage}
          setValue={(v) => onChange({ ...block, trackMapImage: String(v) })}
          disabled={disabled}
        />
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
        <Upload className="w-4 h-4" />
        Upload image tracé
        <input type="file" accept="image/*" className="hidden" disabled={disabled} onChange={onUpload} />
      </label>

      <FormTextarea
        title="Feedback technique"
        value={block.technicalFeedback}
        setValue={(v) => onChange({ ...block, technicalFeedback: v })}
        disabled={disabled}
        rows={4}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Métriques</p>
          <FilledButton
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...block, metrics: [...block.metrics, { label: "", value: "", icon: "" }] })}
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </FilledButton>
        </div>

        {block.metrics.map((metric, metricIndex) => (
          <div
            key={metricIndex}
            className="grid gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <FormInput
              title="Label"
              value={metric.label}
              setValue={(v) => updateMetric(metricIndex, "label", String(v))}
              disabled={disabled}
            />
            <FormInput
              title="Valeur"
              value={metric.value}
              setValue={(v) => updateMetric(metricIndex, "value", String(v))}
              disabled={disabled}
            />
            <FormInput
              title="Icône (optionnel)"
              value={metric.icon ?? ""}
              setValue={(v) => updateMetric(metricIndex, "icon", String(v))}
              disabled={disabled}
            />
            <OutlinedButton type="button" disabled={disabled} onClick={() => removeMetric(metricIndex)}>
              <Trash2 className="w-4 h-4" />
            </OutlinedButton>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChapterEditor({
  block,
  onChange,
  onUpload,
  disabled,
}: {
  block: ChapterContentBlock;
  onChange: (next: ChapterContentBlock) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          title="Titre"
          value={block.title}
          setValue={(v) => onChange({ ...block, title: String(v) })}
          disabled={disabled}
        />
        <FormInput
          title="Image URL"
          value={block.imageUrl}
          setValue={(v) => onChange({ ...block, imageUrl: String(v) })}
          disabled={disabled}
        />
      </div>

      <div className="flex gap-2">
        <OutlinedButton
          type="button"
          disabled={disabled}
          onClick={() => onChange({ ...block, imagePosition: "left" })}
          className={block.imagePosition === "left" ? "bg-primary-color/10" : ""}
        >
          Image à gauche
        </OutlinedButton>
        <OutlinedButton
          type="button"
          disabled={disabled}
          onClick={() => onChange({ ...block, imagePosition: "right" })}
          className={block.imagePosition === "right" ? "bg-primary-color/10" : ""}
        >
          Image à droite
        </OutlinedButton>
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
        <Upload className="w-4 h-4" />
        Upload image chapitre
        <input type="file" accept="image/*" className="hidden" disabled={disabled} onChange={onUpload} />
      </label>

      <FormTextarea
        title="Contenu"
        value={block.contentMarkdown}
        setValue={(v) => onChange({ ...block, contentMarkdown: v })}
        disabled={disabled}
        rows={6}
      />
    </div>
  );
}

function CircuitOverviewEditor({
  block,
  onChange,
  onUpload,
  disabled,
}: {
  block: CircuitOverviewBlock;
  onChange: (next: CircuitOverviewBlock) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) {
  const updateStat = (statIndex: number, key: "label" | "value", value: string) => {
    const stats = block.stats.map((stat, index) => (index === statIndex ? { ...stat, [key]: value } : stat));
    onChange({ ...block, stats });
  };

  const removeStat = (statIndex: number) => {
    onChange({ ...block, stats: block.stats.filter((_, index) => index !== statIndex) });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          title="Titre du circuit"
          value={block.circuitTitle}
          setValue={(v) => onChange({ ...block, circuitTitle: String(v) })}
          disabled={disabled}
        />
        <FormInput
          title="Carte URL"
          value={block.mapImageUrl}
          setValue={(v) => onChange({ ...block, mapImageUrl: String(v) })}
          disabled={disabled}
        />
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
        <Upload className="w-4 h-4" />
        Upload carte
        <input type="file" accept="image/*" className="hidden" disabled={disabled} onChange={onUpload} />
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Stats</p>
          <FilledButton
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...block, stats: [...block.stats, { label: "", value: "" }] })}
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </FilledButton>
        </div>

        {block.stats.map((stat, statIndex) => (
          <div key={statIndex} className="grid gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-[1fr_1fr_auto]">
            <FormInput
              title="Label"
              value={stat.label}
              setValue={(v) => updateStat(statIndex, "label", String(v))}
              disabled={disabled}
            />
            <FormInput
              title="Valeur"
              value={stat.value}
              setValue={(v) => updateStat(statIndex, "value", String(v))}
              disabled={disabled}
            />
            <OutlinedButton type="button" disabled={disabled} onClick={() => removeStat(statIndex)}>
              <Trash2 className="w-4 h-4" />
            </OutlinedButton>
          </div>
        ))}
      </div>
    </div>
  );
}
