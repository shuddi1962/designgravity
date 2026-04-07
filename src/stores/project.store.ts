import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Project, Page, CanvasObject } from '@/types/project.types';
import { nanoid } from 'nanoid';

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  createProject: (name: string, width: number, height: number) => Project;
  openProject: (projectId: string) => void;
  saveProject: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<Project | null>;

  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  fetchProjects: () => Promise<void>;

  addPage: (name?: string) => Page;
  removePage: (pageId: string) => void;
  setActivePage: (pageId: string) => void;
  getActivePage: () => Page | null;

  addObject: (object: Omit<CanvasObject, 'id'>) => CanvasObject;
  updateObject: (objectId: string, updates: Partial<CanvasObject>) => void;
  removeObject: (objectId: string) => void;
  getObject: (objectId: string) => CanvasObject | undefined;
}

async function saveProjectToBackend(project: Project): Promise<void> {
  const res = await fetch(`/api/projects/${project.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error('Failed to save project');
}

export const useProjectStore = create<ProjectState>()(
  subscribeWithSelector((set, get) => ({
    currentProject: null,
    projects: [],
    isLoading: false,
    error: null,

    createProject: (name, width, height) => {
      const project: Project = {
        id: nanoid(),
        name,
        width,
        height,
        unit: 'px',
        pages: [
          {
            id: nanoid(),
            name: 'Page 1',
            objects: [],
            background: { type: 'solid', color: '#FFFFFF' },
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        settings: {
          colorMode: 'RGB',
          resolution: 72,
          bleed: 0,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
          showGrid: false,
          snapToGrid: true,
          showRulers: true,
        },
      };

      set((state) => ({
        projects: [...state.projects, project],
        currentProject: project,
      }));

      saveProjectToBackend(project).catch(console.error);

      return project;
    },

    openProject: (projectId) => {
      const project = get().projects.find((p) => p.id === projectId);
      if (project) {
        set({ currentProject: project });
      }
    },

    saveProject: async () => {
      const { currentProject } = get();
      if (!currentProject) return;

      set({ isLoading: true, error: null });

      try {
        const updatedProject = {
          ...currentProject,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          currentProject: updatedProject,
          projects: state.projects.map((p) =>
            p.id === updatedProject.id ? updatedProject : p
          ),
          isLoading: false,
        }));

        await saveProjectToBackend(updatedProject);
      } catch (error) {
        set({ isLoading: false, error: (error as Error).message });
      }
    },

    deleteProject: async (projectId) => {
      try {
        await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
          currentProject:
            state.currentProject?.id === projectId ? null : state.currentProject,
        }));
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },

    duplicateProject: async (projectId) => {
      const original = get().projects.find((p) => p.id === projectId);
      if (!original) return null;

      const duplicate: Project = {
        ...JSON.parse(JSON.stringify(original)),
        id: nanoid(),
        name: `${original.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        projects: [...state.projects, duplicate],
      }));

      try {
        await saveProjectToBackend(duplicate);
      } catch {
      }

      return duplicate;
    },

    setCurrentProject: (project) => {
      set({ currentProject: project });
    },

    setProjects: (projects) => {
      set({ projects });
    },

    fetchProjects: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error('Failed to fetch projects');
        const projects = await res.json();
        set({ projects, isLoading: false });
      } catch (error) {
        set({ isLoading: false, error: (error as Error).message });
      }
    },

    addPage: (name) => {
      const { currentProject } = get();
      if (!currentProject) {
        throw new Error('No project open');
      }

      const page: Page = {
        id: nanoid(),
        name: name || `Page ${currentProject.pages.length + 1}`,
        objects: [],
        background: { type: 'solid', color: '#FFFFFF' },
      };

      set((state) => ({
        currentProject: state.currentProject
          ? {
              ...state.currentProject,
              pages: [...state.currentProject.pages, page],
              updatedAt: new Date().toISOString(),
            }
          : null,
      }));

      return page;
    },

    removePage: (pageId) => {
      set((state) => {
        if (!state.currentProject || state.currentProject.pages.length <= 1) {
          return state;
        }

        return {
          currentProject: {
            ...state.currentProject,
            pages: state.currentProject.pages.filter((p) => p.id !== pageId),
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },

    setActivePage: (pageId) => {
      set((state) => ({
        currentProject: state.currentProject
          ? { ...state.currentProject, activePageId: pageId as unknown as string }
          : null,
      }));
    },

    getActivePage: () => {
      const { currentProject } = get();
      if (!currentProject) return null;
      return currentProject.pages[0] || null;
    },

    addObject: (object) => {
      const newObject: CanvasObject = {
        ...object,
        id: nanoid(),
      };

      set((state) => {
        if (!state.currentProject) return state;

        const pages = state.currentProject.pages;
        if (pages.length === 0) return state;

        return {
          currentProject: {
            ...state.currentProject,
            pages: pages.map((page, index) =>
              index === 0
                ? { ...page, objects: [...page.objects, newObject] }
                : page
            ),
            updatedAt: new Date().toISOString(),
          },
        };
      });

      return newObject;
    },

    updateObject: (objectId, updates) => {
      set((state) => {
        if (!state.currentProject) return state;

        return {
          currentProject: {
            ...state.currentProject,
            pages: state.currentProject.pages.map((page) => ({
              ...page,
              objects: page.objects.map((obj) =>
                obj.id === objectId ? { ...obj, ...updates } : obj
              ),
            })),
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },

    removeObject: (objectId) => {
      set((state) => {
        if (!state.currentProject) return state;

        return {
          currentProject: {
            ...state.currentProject,
            pages: state.currentProject.pages.map((page) => ({
              ...page,
              objects: page.objects.filter((obj) => obj.id !== objectId),
            })),
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },

    getObject: (objectId) => {
      const { currentProject } = get();
      if (!currentProject) return undefined;

      for (const page of currentProject.pages) {
        const obj = page.objects.find((o) => o.id === objectId);
        if (obj) return obj;
      }
      return undefined;
    },
  }))
);
