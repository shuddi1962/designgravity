export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: DimensionUnit;
  pages: Page[];
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  status: ProjectStatus;
  brandKitId?: string;
  settings: ProjectSettings;
}

export interface Page {
  id: string;
  name: string;
  objects: CanvasObject[];
  background: Background;
}

export interface CanvasObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  blendMode: BlendMode;
  fill?: Fill;
  stroke?: Stroke;
  shadow?: Shadow;
  properties: Record<string, unknown>;
}

export type ObjectType =
  | 'text'
  | 'image'
  | 'shape'
  | 'vector'
  | 'line'
  | 'group'
  | 'frame'
  | 'chart'
  | 'qrcode'
  | 'barcode';

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'color-dodge'
  | 'color-burn'
  | 'difference'
  | 'exclusion';

export type DimensionUnit = 'px' | 'in' | 'mm' | 'cm' | 'ft' | 'pt' | 'pc';

export type ProjectStatus = 'draft' | 'published' | 'archived';

export interface Fill {
  type: 'solid' | 'linear-gradient' | 'radial-gradient' | 'pattern' | 'image';
  color?: string;
  colors?: string[];
  stops?: number[];
  angle?: number;
  imageUrl?: string;
  patternId?: string;
}

export interface Stroke {
  color: string;
  width: number;
  dash?: number[];
  cap: 'butt' | 'round' | 'square';
  join: 'miter' | 'round' | 'bevel';
}

export interface Shadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

export interface Background {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: number;
  };
  imageUrl?: string;
}

export interface ProjectSettings {
  colorMode: ColorMode;
  resolution: number;
  bleed: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  showGrid: boolean;
  snapToGrid: boolean;
  showRulers: boolean;
}

export type ColorMode = 'RGB' | 'CMYK' | 'Grayscale' | 'Spot';

export interface DocumentPreset {
  id: string;
  name: string;
  category: PresetCategory;
  width: number;
  height: number;
  unit: DimensionUnit;
}

export type PresetCategory =
  | 'social-media'
  | 'print'
  | 'web'
  | 'video'
  | 'greeting-cards'
  | 'custom';
