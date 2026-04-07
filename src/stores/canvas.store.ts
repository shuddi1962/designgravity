import { create } from 'zustand';
import type { CanvasObject } from '@/types/project.types';
import { nanoid } from 'nanoid';
import type { HistoryEntry } from '@/types/canvas.types';

interface CanvasState {
  objects: CanvasObject[];
  selectedIds: string[];
  activePageId: string | null;
  zoom: number;
  panX: number;
  panY: number;
  isDrawing: boolean;
  isDragging: boolean;
  history: HistoryEntry[];
  historyIndex: number;
  clipboard: CanvasObject[];

  addObject: (object: Omit<CanvasObject, 'id'>) => CanvasObject;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  removeObject: (id: string) => void;
  removeSelectedObjects: () => void;
  setSelectedIds: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  setActivePage: (pageId: string) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setIsDragging: (isDragging: boolean) => void;
  pushHistory: (action: string) => void;
  undo: () => void;
  redo: () => void;
  copy: () => void;
  paste: () => void;
  duplicate: () => void;
  getSelectedObjects: () => CanvasObject[];
  setObjects: (objects: CanvasObject[]) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  objects: [],
  selectedIds: [],
  activePageId: null,
  zoom: 100,
  panX: 0,
  panY: 0,
  isDrawing: false,
  isDragging: false,
  history: [],
  historyIndex: -1,
  clipboard: [],

  addObject: (objectData) => {
    const newObject: CanvasObject = {
      ...objectData,
      id: nanoid(),
    };

    set((state) => ({
      objects: [...state.objects, newObject],
    }));

    get().pushHistory(`Added ${objectData.type}`);
    return newObject;
  },

  updateObject: (id, updates) => {
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...updates } : obj
      ),
    }));
  },

  removeObject: (id) => {
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    }));
    get().pushHistory('Removed object');
  },

  removeSelectedObjects: () => {
    const { selectedIds } = get();
    set((state) => ({
      objects: state.objects.filter((obj) => !selectedIds.includes(obj.id)),
      selectedIds: [],
    }));
    get().pushHistory('Deleted objects');
  },

  setSelectedIds: (ids) => {
    set({ selectedIds: ids });
  },

  addToSelection: (id) => {
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds
        : [...state.selectedIds, id],
    }));
  },

  removeFromSelection: (id) => {
    set((state) => ({
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    }));
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  selectAll: () => {
    set((state) => ({
      selectedIds: state.objects.map((obj) => obj.id),
    }));
  },

  setActivePage: (pageId) => {
    set({ activePageId: pageId, objects: [], selectedIds: [] });
  },

  setZoom: (zoom) => {
    set({ zoom: Math.min(6400, Math.max(10, zoom)) });
  },

  setPan: (x, y) => {
    set({ panX: x, panY: y });
  },

  setIsDrawing: (isDrawing) => {
    set({ isDrawing });
  },

  setIsDragging: (isDragging) => {
    set({ isDragging });
  },

  pushHistory: (action) => {
    const { objects, history, historyIndex } = get();
    const newEntry: HistoryEntry = {
      id: nanoid(),
      action,
      timestamp: Date.now(),
      state: JSON.stringify(objects),
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newEntry);

    if (newHistory.length > 100) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const previousState = JSON.parse(history[historyIndex - 1].state);
      set({
        objects: previousState,
        historyIndex: historyIndex - 1,
        selectedIds: [],
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = JSON.parse(history[historyIndex + 1].state);
      set({
        objects: nextState,
        historyIndex: historyIndex + 1,
        selectedIds: [],
      });
    }
  },

  copy: () => {
    const { objects, selectedIds } = get();
    const selected = objects.filter((obj) => selectedIds.includes(obj.id));
    set({ clipboard: selected });
  },

  paste: () => {
    const { clipboard, objects } = get();
    if (clipboard.length === 0) return;

    const newObjects = clipboard.map((obj) => ({
      ...obj,
      id: nanoid(),
      x: obj.x + 20,
      y: obj.y + 20,
    }));

    set({
      objects: [...objects, ...newObjects],
      selectedIds: newObjects.map((obj) => obj.id),
    });

    get().pushHistory('Pasted objects');
  },

  duplicate: () => {
    const { objects, selectedIds } = get();
    const selected = objects.filter((obj) => selectedIds.includes(obj.id));
    const newObjects = selected.map((obj) => ({
      ...obj,
      id: nanoid(),
      x: obj.x + 20,
      y: obj.y + 20,
    }));

    set({
      objects: [...objects, ...newObjects],
      selectedIds: newObjects.map((obj) => obj.id),
    });

    get().pushHistory('Duplicated objects');
  },

  getSelectedObjects: () => {
    const { objects, selectedIds } = get();
    return objects.filter((obj) => selectedIds.includes(obj.id));
  },

  setObjects: (objects) => {
    set({ objects });
  },
}));
