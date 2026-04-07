import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface FeatureFlags {
  aiImageGeneration: boolean;
  aiVideoGeneration: boolean;
  aiBackgroundRemoval: boolean;
  aiImageEnhancement: boolean;
  aiBirthdayCard: boolean;
  aiPromptEnhancer: boolean;
  aiBrandKit: boolean;
  aiContentWriter: boolean;
  videoEditor: boolean;
  slideshowCreator: boolean;
  mockupGenerator: boolean;
  printSetup: boolean;
  collaboration: boolean;
  whiteLabel: boolean;
  printOnDemand: boolean;
  advancedShapes: boolean;
  vectorPenTool: boolean;
  photoRetouching: boolean;
  templateLibrary: boolean;
  brandKitModule: boolean;
  assetManager: boolean;
  ttsVoices: boolean;
}

interface FeatureFlagsState {
  flags: FeatureFlags;
  setFlag: (key: keyof FeatureFlags, value: boolean) => void;
  setFlags: (flags: Partial<FeatureFlags>) => void;
  isEnabled: (key: keyof FeatureFlags) => boolean;
  isModuleEnabled: (moduleName: string) => boolean;
}

const defaultFlags: FeatureFlags = {
  aiImageGeneration: true,
  aiVideoGeneration: true,
  aiBackgroundRemoval: true,
  aiImageEnhancement: true,
  aiBirthdayCard: true,
  aiPromptEnhancer: true,
  aiBrandKit: true,
  aiContentWriter: true,
  videoEditor: true,
  slideshowCreator: true,
  mockupGenerator: true,
  printSetup: true,
  collaboration: true,
  whiteLabel: false,
  printOnDemand: false,
  advancedShapes: true,
  vectorPenTool: true,
  photoRetouching: true,
  templateLibrary: true,
  brandKitModule: true,
  assetManager: true,
  ttsVoices: true,
};

export const useFeatureFlagsStore = create<FeatureFlagsState>()(
  subscribeWithSelector((set, get) => ({
    flags: defaultFlags,

    setFlag: (key, value) => {
      set((state) => ({
        flags: { ...state.flags, [key]: value },
      }));
    },

    setFlags: (newFlags) => {
      set((state) => ({
        flags: { ...state.flags, ...newFlags },
      }));
    },

    isEnabled: (key) => {
      return get().flags[key];
    },

    isModuleEnabled: (moduleName) => {
      const flagMap: Record<string, keyof FeatureFlags> = {
        'ai-studio': 'aiImageGeneration',
        'video-editor': 'videoEditor',
        'birthday-card': 'aiBirthdayCard',
        'mockup': 'mockupGenerator',
        'brand-kit': 'brandKitModule',
        'templates': 'templateLibrary',
        'assets': 'assetManager',
        'enhance': 'aiImageEnhancement',
        'slideshow': 'slideshowCreator',
        'print': 'printSetup',
      };
      const flag = flagMap[moduleName];
      return flag ? get().isEnabled(flag) : false;
    },
  }))
);

export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  return useFeatureFlagsStore((state) => state.flags[flag]);
}
