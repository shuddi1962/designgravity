import { create } from 'zustand';
import type {
  BirthdayCard,
  FontCombo,
  ColorTheme,
  BirthdayMessage,
  PhotoFilter,
} from '@/types/birthday-card.types';
import { nanoid } from 'nanoid';

interface BirthdayCardState {
  currentCard: BirthdayCard | null;
  cards: BirthdayCard[];
  selectedTemplateId: string | null;
  selectedFontCombo: FontCombo | null;
  selectedColorTheme: ColorTheme | null;
  selectedMessages: BirthdayMessage[];
  selectedFilter: PhotoFilter;
  uploadedPhotoUrl: string | null;
  enhancedPhotoUrl: string | null;
  isGenerating: boolean;
  isProcessingPhoto: boolean;

  createCard: (personName: string) => BirthdayCard;
  updateCard: (updates: Partial<BirthdayCard>) => void;
  deleteCard: (cardId: string) => void;
  setSelectedTemplate: (templateId: string | null) => void;
  setSelectedFontCombo: (combo: FontCombo | null) => void;
  setSelectedColorTheme: (theme: ColorTheme | null) => void;
  addSelectedMessage: (message: BirthdayMessage) => void;
  removeSelectedMessage: (messageId: string) => void;
  setSelectedFilter: (filter: PhotoFilter) => void;
  setUploadedPhoto: (url: string | null) => void;
  setEnhancedPhoto: (url: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setIsProcessingPhoto: (isProcessing: boolean) => void;
  resetCard: () => void;
}

export const useBirthdayCardStore = create<BirthdayCardState>((set, get) => ({
  currentCard: null,
  cards: [],
  selectedTemplateId: null,
  selectedFontCombo: null,
  selectedColorTheme: null,
  selectedMessages: [],
  selectedFilter: 'none',
  uploadedPhotoUrl: null,
  enhancedPhotoUrl: null,
  isGenerating: false,
  isProcessingPhoto: false,

  createCard: (personName) => {
    const card: BirthdayCard = {
      id: nanoid(),
      personName,
      tone: 'warm',
      occasionType: 'birthday',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      currentCard: card,
      cards: [...state.cards, card],
    }));

    return card;
  },

  updateCard: (updates) => {
    set((state) => {
      if (!state.currentCard) return state;

      const updated = {
        ...state.currentCard,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      return {
        currentCard: updated,
        cards: state.cards.map((c) => (c.id === updated.id ? updated : c)),
      };
    });
  },

  deleteCard: (cardId) => {
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== cardId),
      currentCard: state.currentCard?.id === cardId ? null : state.currentCard,
    }));
  },

  setSelectedTemplate: (templateId) => {
    set({ selectedTemplateId: templateId });
  },

  setSelectedFontCombo: (combo) => {
    set({ selectedFontCombo: combo });
  },

  setSelectedColorTheme: (theme) => {
    set({ selectedColorTheme: theme });
  },

  addSelectedMessage: (message) => {
    set((state) => ({
      selectedMessages: [...state.selectedMessages, message],
    }));
  },

  removeSelectedMessage: (messageId) => {
    set((state) => ({
      selectedMessages: state.selectedMessages.filter((m) => m.id !== messageId),
    }));
  },

  setSelectedFilter: (filter) => {
    set({ selectedFilter: filter });
  },

  setUploadedPhoto: (url) => {
    set({ uploadedPhotoUrl: url, enhancedPhotoUrl: null });
  },

  setEnhancedPhoto: (url) => {
    set({ enhancedPhotoUrl: url });
  },

  setIsGenerating: (isGenerating) => {
    set({ isGenerating });
  },

  setIsProcessingPhoto: (isProcessing) => {
    set({ isProcessingPhoto: isProcessing });
  },

  resetCard: () => {
    set({
      currentCard: null,
      selectedTemplateId: null,
      selectedFontCombo: null,
      selectedColorTheme: null,
      selectedMessages: [],
      selectedFilter: 'none',
      uploadedPhotoUrl: null,
      enhancedPhotoUrl: null,
      isGenerating: false,
      isProcessingPhoto: false,
    });
  },
}));
