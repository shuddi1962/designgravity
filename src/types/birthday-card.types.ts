export interface BirthdayCard {
  id: string;
  personName: string;
  age?: number;
  occasionType: string;
  tone: string;
  message?: string;
  senderName?: string;
  photoUrl?: string;
  templateId?: string;
  colorTheme?: string[];
  fontCombo?: FontCombo;
  elements?: DecorativeElement[];
  designUrl?: string;
  status: 'draft' | 'approved' | 'exported';
  createdAt: string;
  updatedAt: string;
}

export interface FontCombo {
  heading: string;
  body: string;
}

export interface DecorativeElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color?: string;
  scale?: number;
}

export type ElementType =
  | 'balloon'
  | 'confetti'
  | 'star'
  | 'cake'
  | 'gift'
  | 'flower'
  | 'ribbon'
  | 'number'
  | 'crown'
  | 'streamer';

export interface BirthdayTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  style: string;
  thumbnail: string;
  colorThemes: ColorTheme[];
  elements: string[];
 适用于: 'portrait' | 'landscape' | 'square';
}

export type TemplateCategory =
  | 'floral'
  | 'balloons'
  | 'gold-luxury'
  | 'pastel'
  | 'bold-colorful'
  | 'minimal'
  | 'illustration'
  | 'photo-forward'
  | 'age-milestone';

export interface ColorTheme {
  id: string;
  name: string;
  colors: string[];
}

export interface BirthdayMessage {
  id: string;
  text: string;
  tone: string;
  isCustom: boolean;
}

export type PhotoFilter =
  | 'none'
  | 'warm-glow'
  | 'vibrant-pop'
  | 'soft-pastel'
  | 'golden-hour'
  | 'birthday-glow';

export interface PhotoEnhancement {
  backgroundRemoved: boolean;
  faceEnhanced: boolean;
  upscaled: boolean;
  cropped: boolean;
  filter: PhotoFilter;
}
