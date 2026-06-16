import { Timestamp } from "firebase/firestore";

// Enum pour identifier le type de composant à rendre côté front
export enum BlockType {
  HERO_VIDEO = "HERO_VIDEO",
  EXPERT_QUOTE = "EXPERT_QUOTE",
  TELEMETRY_DASHBOARD = "TELEMETRY_DASHBOARD",
  CHAPTER_CONTENT = "CHAPTER_CONTENT",
  CIRCUIT_OVERVIEW = "CIRCUIT_OVERVIEW",
}

// Interface de base que tous les blocs doivent respecter
export interface BaseBlock {
  id: string; // UUID pour générer les clés (ex: React 'key')
  type: BlockType;
  order: number; // Pour ordonner l'affichage si le tableau Firestore perd son ordre
}

// Le bloc "Scrollytelling" avec vidéo
export interface HeroVideoBlock extends BaseBlock {
  type: BlockType.HERO_VIDEO;
  videoUrl: string;
  headline: string;
  subheadline?: string;
  ctaText?: string;
}

// Le bloc "Témoignage du pilote"
export interface ExpertQuoteBlock extends BaseBlock {
  type: BlockType.EXPERT_QUOTE;
  pilotName: string; // ex: "Jean-Pierre"
  pilotRole: string; // ex: "Pilote d'essai professionnel"
  quote: string;
  circuitName: string; // ex: "Circuit de Pau-Arnos"
  avatarUrl?: string;
}

// Le bloc "Dashboard de Télémétrie"
export interface TelemetryDashboardBlock extends BaseBlock {
  type: BlockType.TELEMETRY_DASHBOARD;
  trackMapImage: string;
  metrics: {
    label: string; // ex: "Adhérence latérale"
    value: string; // ex: "1.2 G"
    iconName?: string;
  }[];
  technicalFeedback: string;
}

// Le bloc "Chapitre Documentaire" (Texte + Image)
export interface ChapterContentBlock extends BaseBlock {
  type: BlockType.CHAPTER_CONTENT;
  title: string;
  contentMarkdown: string; // Supporte le texte riche
  imageUrl: string;
  imagePosition: "left" | "right";
}

export interface CircuitOverviewBlock extends BaseBlock {
  type: BlockType.CIRCUIT_OVERVIEW;
  circuitTitle: string; // ex: "Col du Tourmalet" ou "Circuit de Pau-Arnos"
  mapImageUrl: string; // L'URL de l'image (Google Maps statique ou capture stylisée)

  // Tableau de statistiques pour garder une flexibilité (2 ou 3 stats selon la page)
  stats: {
    label: string; // ex: "Distance", "Virages", "Dénivelé positif"
    value: string; // ex: "19 km", "14", "1 404 m"
  }[];
}

// L'Union Type qui regroupe tout (crucial pour le typage du tableau Firestore)
export type ExperienceBlock =
  | HeroVideoBlock
  | ExpertQuoteBlock
  | TelemetryDashboardBlock
  | ChapterContentBlock
  | CircuitOverviewBlock;

export default interface Experience {
  // L'ID du document Firestore devrait idéalement correspondre à l'ID du produit (SKU)
  productId: string;
  tireModel: string; // ex: "Michelin Pilot Sport 5"
  slug: string; // ex: "experience-pilot-sport-5-pyrenees"

  // SEO & Meta
  metaTitle: string;
  metaDescription: string;

  // Le cœur du système dynamique
  blocks: ExperienceBlock[];

  // Métadonnées Firestore
  isPublished: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ExperienceDocument extends Experience {
  id: string;
  path: string;
}

export type CreateExperienceData = Omit<Experience, "createdAt" | "updatedAt">;

export type UpdateExperienceData = Partial<Omit<Experience, "productId" | "createdAt">>;
