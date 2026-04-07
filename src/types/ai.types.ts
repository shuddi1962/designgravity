export interface AIGenerationRequest {
  model: string;
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps?: number;
  seed?: number;
  style?: string;
}

export interface AIGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  jobId?: string;
}

export interface AIImageGenerationRequest extends AIGenerationRequest {
  stylePreset?: string;
  controlNetMode?: string;
  imageToImage?: boolean;
  initialImageUrl?: string;
  maskImageUrl?: string;
}

export interface AIEnhancementRequest {
  imageUrl: string;
  enhancementType: EnhancementType;
  strength?: number;
}

export type EnhancementType =
  | 'upscale-2x'
  | 'upscale-4x'
  | 'upscale-8x'
  | 'denoise'
  | 'sharpen'
  | 'face-restoration'
  | 'color-restoration'
  | 'hdr'
  | 'low-light';

export interface AIBirthdayCardRequest {
  personName: string;
  age?: number;
  occasionType: OccasionType;
  tone: BirthdayTone;
  customMessage?: string;
  senderName?: string;
  photoUrl?: string;
}

export type OccasionType =
  | 'birthday'
  | 'milestone-18'
  | 'milestone-21'
  | 'milestone-30'
  | 'milestone-40'
  | 'milestone-50'
  | 'milestone-60'
  | 'milestone-70'
  | 'milestone-80'
  | 'milestone-90'
  | 'milestone-100'
  | 'anniversary-birthday';

export type BirthdayTone =
  | 'funny'
  | 'warm'
  | 'elegant'
  | 'bold'
  | 'cute';

export interface AIBirthdayCardResponse {
  success: boolean;
  cardDesignUrl?: string;
  suggestedMessage?: string;
  suggestedFonts?: string[];
  suggestedColors?: string[];
  suggestedElements?: string[];
  error?: string;
}

export interface PromptEnhancementRequest {
  originalPrompt: string;
  style?: string;
  modifiers?: PromptModifier[];
}

export interface PromptModifier {
  category: 'style' | 'lighting' | 'color' | 'composition' | 'camera' | 'resolution';
  value: string;
}

export interface AIBrandKitRequest {
  companyName: string;
  industry: string;
  style?: string;
  colors?: string[];
}

export interface AILayoutReplicateRequest {
  referenceImageUrl: string;
  targetWidth: number;
  targetHeight: number;
}
