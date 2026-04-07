import { create } from 'zustand';
import type { ToolType } from '@/types/canvas.types';

interface UIState {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  activeModule: string | null;
  zoom: number;
  panX: number;
  panY: number;
  activeTool: ToolType;
  showGrid: boolean;
  showRulers: boolean;
  showGuides: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  darkMode: boolean;

  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setActiveModule: (module: string | null) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setActiveTool: (tool: ToolType) => void;
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleGuides: () => void;
  toggleSnapToGrid: () => void;
  toggleSnapToObjects: () => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  activeModule: null,
  zoom: 100,
  panX: 0,
  panY: 0,
  activeTool: 'select',
  showGrid: false,
  showRulers: true,
  showGuides: true,
  snapToGrid: true,
  snapToObjects: true,
  darkMode: true,

  toggleLeftSidebar: () =>
    set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),

  toggleRightSidebar: () =>
    set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),

  setActiveModule: (module) =>
    set({ activeModule: module }),

  setZoom: (zoom) =>
    set({ zoom: Math.min(6400, Math.max(10, zoom)) }),

  setPan: (x, y) =>
    set({ panX: x, panY: y }),

  setActiveTool: (tool) =>
    set({ activeTool: tool }),

  toggleGrid: () =>
    set((state) => ({ showGrid: !state.showGrid })),

  toggleRulers: () =>
    set((state) => ({ showRulers: !state.showRulers })),

  toggleGuides: () =>
    set((state) => ({ showGuides: !state.showGuides })),

  toggleSnapToGrid: () =>
    set((state) => ({ snapToGrid: !state.snapToGrid })),

  toggleSnapToObjects: () =>
    set((state) => ({ snapToObjects: !state.snapToObjects })),

  toggleDarkMode: () =>
    set((state) => ({ darkMode: !state.darkMode })),
}));
