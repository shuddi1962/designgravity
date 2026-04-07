export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  category: string;
  variables: string[];
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  type: 'image' | 'video' | 'text' | 'speech';
  maxTokens?: number;
  supportsStyle?: boolean;
  supportsNegativePrompt?: boolean;
  defaultParams: Record<string, unknown>;
}

export const IMAGE_MODELS: ModelConfig[] = [
  {
    id: 'flux-1-schnell',
    name: 'Flux 1 Schnell',
    provider: 'Black Forest Labs',
    type: 'image',
    supportsStyle: true,
    supportsNegativePrompt: true,
    defaultParams: { width: 1024, height: 1024, steps: 4 },
  },
  {
    id: 'flux-1-dev',
    name: 'Flux 1 Dev',
    provider: 'Black Forest Labs',
    type: 'image',
    supportsStyle: true,
    supportsNegativePrompt: true,
    defaultParams: { width: 1024, height: 1024, steps: 20 },
  },
  {
    id: 'sd-xl',
    name: 'Stable Diffusion XL',
    provider: 'Stability AI',
    type: 'image',
    supportsStyle: true,
    supportsNegativePrompt: true,
    defaultParams: { width: 1024, height: 1024, steps: 30 },
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    type: 'image',
    supportsStyle: false,
    supportsNegativePrompt: false,
    defaultParams: { width: 1024, height: 1024, quality: 'hd' },
  },
];

export const VIDEO_MODELS: ModelConfig[] = [
  {
    id: 'runway-gen3',
    name: 'Runway Gen-3',
    provider: 'Runway',
    type: 'video',
    defaultParams: { duration: 5, resolution: '720p' },
  },
  {
    id: 'luma-dream-machine',
    name: 'Luma Dream Machine',
    provider: 'Luma AI',
    type: 'video',
    defaultParams: { duration: 5, resolution: '720p' },
  },
];

export const TEXT_MODELS: ModelConfig[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    type: 'text',
    maxTokens: 4096,
    defaultParams: { temperature: 0.7, maxTokens: 1024 },
  },
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet',
    provider: 'Anthropic',
    type: 'text',
    maxTokens: 8192,
    defaultParams: { temperature: 0.7, maxTokens: 1024 },
  },
];

export const SPEECH_MODELS: ModelConfig[] = [
  {
    id: 'elevenlabs-multilingual',
    name: 'ElevenLabs Multilingual',
    provider: 'ElevenLabs',
    type: 'speech',
    defaultParams: { stability: 0.5, similarity: 0.75 },
  },
  {
    id: 'openai-tts',
    name: 'OpenAI TTS',
    provider: 'OpenAI',
    type: 'speech',
    defaultParams: { voice: 'alloy', speed: 1.0 },
  },
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'photo-realistic',
    name: 'Photo Realistic',
    template: 'A photo of {subject}, {setting}, {lighting}, {style}, high quality, detailed',
    category: 'photography',
    variables: ['subject', 'setting', 'lighting', 'style'],
  },
  {
    id: 'illustration',
    name: 'Digital Illustration',
    template: 'Digital illustration of {subject}, {style}, {mood}, trending on artstation',
    category: 'illustration',
    variables: ['subject', 'style', 'mood'],
  },
  {
    id: 'logo-design',
    name: 'Logo Design',
    template: 'Minimalist logo for {brand}, {industry}, {style}, vector style, clean design',
    category: 'branding',
    variables: ['brand', 'industry', 'style'],
  },
  {
    id: 'social-media',
    name: 'Social Media Post',
    template: 'Social media post about {topic}, {style}, eye-catching, {brand} colors',
    category: 'social',
    variables: ['topic', 'style', 'brand'],
  },
  {
    id: 'birthday-card',
    name: 'Birthday Card',
    template: 'Joyful birthday card for {name}, turning {age}, {theme}, vibrant colors, celebratory, fun typography',
    category: 'greeting-cards',
    variables: ['name', 'age', 'theme'],
  },
  {
    id: 'product-photo',
    name: 'Product Photography',
    template: 'Professional product photo of {product}, {background}, studio lighting, {angle}, commercial photography',
    category: 'product',
    variables: ['product', 'background', 'angle'],
  },
];

export function buildPrompt(
  templateId: string,
  variables: Record<string, string>
): string {
  const template = PROMPT_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return '';

  let prompt = template.template;
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(`{${key}}`, value);
  }

  return prompt;
}

export function enhancePrompt(
  basePrompt: string,
  options?: {
    style?: string;
    quality?: string;
    lighting?: string;
    mood?: string;
  }
): string {
  const enhancements: string[] = [];

  if (options?.style) enhancements.push(options.style);
  if (options?.quality) enhancements.push(options.quality);
  if (options?.lighting) enhancements.push(options.lighting);
  if (options?.mood) enhancements.push(options.mood);

  if (enhancements.length === 0) {
    enhancements.push('high quality', 'detailed', 'professional');
  }

  return `${basePrompt}, ${enhancements.join(', ')}`;
}

export function generateNegativePrompt(
  options?: {
    noBlur?: boolean;
    noText?: boolean;
    noWatermark?: boolean;
    noDeformity?: boolean;
    custom?: string;
  }
): string {
  const negatives: string[] = [];

  if (options?.noBlur) negatives.push('blurry', 'low quality');
  if (options?.noText) negatives.push('text', 'watermark');
  if (options?.noWatermark) negatives.push('watermark', 'signature');
  if (options?.noDeformity) negatives.push('deformed', 'ugly', 'bad anatomy');
  if (options?.custom) negatives.push(options.custom);

  return negatives.join(', ');
}

export function getModelById(id: string): ModelConfig | undefined {
  return [...IMAGE_MODELS, ...VIDEO_MODELS, ...TEXT_MODELS, ...SPEECH_MODELS].find(
    (model) => model.id === id
  );
}

export function getModelsByType(type: ModelConfig['type']): ModelConfig[] {
  switch (type) {
    case 'image':
      return IMAGE_MODELS;
    case 'video':
      return VIDEO_MODELS;
    case 'text':
      return TEXT_MODELS;
    case 'speech':
      return SPEECH_MODELS;
  }
}
