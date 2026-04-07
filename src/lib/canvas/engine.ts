import { Canvas, IText, Rect, Ellipse, Image, Line, Point, ActiveSelection, FabricObject, Text } from 'fabric';
import { eventBus, EVENTS } from '@/lib/event-bus';
import type { ToolType } from '@/types/canvas.types';

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  selection: boolean;
  preserveObjectStacking: boolean;
  enableRetinaScaling: boolean;
}

export interface CanvasEngine {
  canvas: Canvas | null;
  initialize: (element: HTMLCanvasElement, config: CanvasConfig) => void;
  destroy: () => void;
  setTool: (tool: ToolType) => void;
  addRectangle: (options?: Record<string, unknown>) => Rect;
  addEllipse: (options?: Record<string, unknown>) => Ellipse;
  addText: (text: string, options?: Record<string, unknown>) => IText;
  addImage: (url: string, options?: Record<string, unknown>) => Promise<Image>;
  addLine: (options?: { x1: number; y1: number; x2: number; y2: number }) => Line;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  zoomToPoint: (point: Point, zoom: number) => void;
  getZoom: () => number;
  getActiveObject: () => FabricObject | null;
  getActiveObjects: () => FabricObject[];
  deleteActiveObjects: () => void;
  duplicateActiveObjects: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  toJSON: () => string;
  loadFromJSON: (json: string) => Promise<void>;
  exportToPNG: (options?: { multiplier?: number }) => string;
  exportToSVG: () => string;
  clear: () => void;
  setBackgroundColor: (color: string) => void;
  setGridVisibility: (visible: boolean) => void;
  setSnapToGrid: (enabled: boolean) => void;
  resize: (width: number, height: number) => void;
}

class FabricCanvasEngine implements CanvasEngine {
  canvas: Canvas | null = null;
  private currentTool: ToolType = 'select';
  private snapToGridEnabled = false;
  private isDrawing = false;
  private isPanning = false;
  private lastPanPoint: { x: number; y: number } | null = null;
  private zoom = 1;
  private clipboard: FabricObject[] = [];

  initialize(element: HTMLCanvasElement, config: CanvasConfig): void {
    this.canvas = new Canvas(element, {
      width: config.width,
      height: config.height,
      backgroundColor: config.backgroundColor,
      selection: config.selection,
      preserveObjectStacking: config.preserveObjectStacking,
    });
    this.setupEventListeners();
  }

  destroy(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
  }

  private setupEventListeners(): void {
    if (!this.canvas) return;
    this.canvas.on('selection:created', () => {
      const activeObject = this.canvas?.getActiveObject();
      if (activeObject) eventBus.emit(EVENTS.OBJECT_SELECTED, { id: String(Date.now()) });
    });
    this.canvas.on('selection:updated', () => {
      const activeObject = this.canvas?.getActiveObject();
      if (activeObject) eventBus.emit(EVENTS.OBJECT_SELECTED, { id: String(Date.now()) });
    });
    this.canvas.on('selection:cleared', () => eventBus.emit(EVENTS.OBJECT_DESELECTED));
    this.canvas.on('object:added', () => eventBus.emit(EVENTS.OBJECT_ADDED, { id: String(Date.now()) }));
    this.canvas.on('object:removed', () => eventBus.emit(EVENTS.OBJECT_REMOVED, { id: String(Date.now()) }));
    this.canvas.on('object:modified', () => eventBus.emit(EVENTS.OBJECT_UPDATED, { id: String(Date.now()) }));
    this.canvas.on('mouse:wheel', (opt) => {
      const e = opt.e;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY;
        let newZoom = this.zoom * (1 - delta / 500);
        newZoom = Math.min(64, Math.max(0.1, newZoom));
        this.zoom = newZoom;
      }
    });
  }

  setTool(tool: ToolType): void {
    this.currentTool = tool;
    if (!this.canvas) return;
    switch (tool) {
      case 'select':
        this.canvas.selection = true;
        this.canvas.defaultCursor = 'default';
        break;
      case 'hand':
        this.canvas.selection = false;
        this.canvas.defaultCursor = 'grab';
        break;
      case 'text':
        this.canvas.selection = false;
        this.canvas.defaultCursor = 'text';
        break;
      default:
        this.canvas.selection = false;
        this.canvas.defaultCursor = 'crosshair';
    }
    eventBus.emit(EVENTS.TOOL_CHANGED, { tool });
  }

  addRectangle(options?: Record<string, unknown>): Rect {
    if (!this.canvas) throw new Error('Canvas not initialized');
    const rect = new Rect({
      left: (options?.left as number) ?? 100,
      top: (options?.top as number) ?? 100,
      width: (options?.width as number) ?? 200,
      height: (options?.height as number) ?? 200,
      fill: (options?.fill as string) ?? '#7C3AED',
    });
    this.canvas.add(rect);
    this.canvas.setActiveObject(rect);
    this.canvas.renderAll();
    return rect;
  }

  addEllipse(options?: Record<string, unknown>): Ellipse {
    if (!this.canvas) throw new Error('Canvas not initialized');
    const ellipse = new Ellipse({
      left: (options?.left as number) ?? 100,
      top: (options?.top as number) ?? 100,
      rx: (options?.rx as number) ?? 100,
      ry: (options?.ry as number) ?? 100,
      fill: (options?.fill as string) ?? '#7C3AED',
    });
    this.canvas.add(ellipse);
    this.canvas.setActiveObject(ellipse);
    this.canvas.renderAll();
    return ellipse;
  }

  addText(text: string, options?: Record<string, unknown>): IText {
    if (!this.canvas) throw new Error('Canvas not initialized');
    const textObj = new IText(text, {
      left: (options?.left as number) ?? 100,
      top: (options?.top as number) ?? 100,
      fill: (options?.fill as string) ?? '#F8F8FC',
      fontSize: (options?.fontSize as number) ?? 24,
      fontFamily: (options?.fontFamily as string) ?? 'DM Sans',
    });
    this.canvas.add(textObj);
    this.canvas.renderAll();
    return textObj;
  }

  async addImage(url: string, options?: Record<string, unknown>): Promise<Image> {
    if (!this.canvas) throw new Error('Canvas not initialized');
    return new Promise((resolve, reject) => {
      Image.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
        if (!img) { reject(new Error('Failed to load image')); return; }
        const canvasWidth = this.canvas?.getWidth() ?? 1080;
        const canvasHeight = this.canvas?.getHeight() ?? 1080;
        img.scale(Math.min(canvasWidth / (img.width || 1), canvasHeight / (img.height || 1), 1));
        img.set({
          left: (options?.left as number) ?? canvasWidth / 2 - img.getScaledWidth() / 2,
          top: (options?.top as number) ?? canvasHeight / 2 - img.getScaledHeight() / 2,
        });
        this.canvas?.add(img);
        this.canvas?.setActiveObject(img);
        this.canvas?.renderAll();
        resolve(img);
      }).catch(reject);
    });
  }

  addLine(options?: { x1: number; y1: number; x2: number; y2: number }): Line {
    if (!this.canvas) throw new Error('Canvas not initialized');
    const line = new Line(
      [options?.x1 ?? 100, options?.y1 ?? 100, options?.x2 ?? 300, options?.y2 ?? 300],
      { stroke: '#F8F8FC', strokeWidth: 2 }
    );
    this.canvas.add(line);
    this.canvas.setActiveObject(line);
    this.canvas.renderAll();
    return line;
  }

  setZoom(zoom: number): void {
    if (!this.canvas) return;
    const clampedZoom = Math.min(64, Math.max(0.1, zoom / 100));
    this.canvas.setZoom(clampedZoom);
    this.zoom = clampedZoom;
  }

  setPan(x: number, y: number): void {
    if (!this.canvas?.viewportTransform) return;
    this.canvas.viewportTransform[4] = x;
    this.canvas.viewportTransform[5] = y;
    this.canvas.requestRenderAll();
  }

  zoomToPoint(point: Point, zoom: number): void {
    if (!this.canvas) return;
    this.canvas.zoomToPoint(point, Math.min(64, Math.max(0.1, zoom)));
  }

  getZoom(): number { return this.canvas?.getZoom() ?? 1; }

  getActiveObject(): FabricObject | null { return this.canvas?.getActiveObject() ?? null; }

  getActiveObjects(): FabricObject[] {
    const activeObject = this.canvas?.getActiveObject();
    if (!activeObject) return [];
    if (activeObject.type === 'activeSelection' && 'getObjects' in activeObject) {
      return (activeObject as ActiveSelection).getObjects();
    }
    return [activeObject];
  }

  deleteActiveObjects(): void {
    if (!this.canvas) return;
    const activeObjects = this.getActiveObjects();
    if (activeObjects.length === 0) return;
    activeObjects.forEach((obj) => this.canvas?.remove(obj));
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }

  duplicateActiveObjects(): void {
    if (!this.canvas) return;
    const activeObjects = this.getActiveObjects();
    if (activeObjects.length === 0) return;
    const newObjects: FabricObject[] = [];
    activeObjects.forEach((obj) => {
      obj.clone().then((cloned) => {
        cloned.set({ left: (cloned.left ?? 0) + 20, top: (cloned.top ?? 0) + 20, evented: true });
        this.canvas?.add(cloned);
        newObjects.push(cloned);
        if (newObjects.length === activeObjects.length && this.canvas) {
          this.canvas.setActiveObject(new ActiveSelection(newObjects, { canvas: this.canvas }));
          this.canvas.renderAll();
        }
      });
    });
  }

  bringForward(): void {
    const obj = this.canvas?.getActiveObject();
    if (obj) this.canvas?.bringObjectForward(obj);
  }

  sendBackward(): void {
    const obj = this.canvas?.getActiveObject();
    if (obj) this.canvas?.sendObjectBackwards(obj);
  }

  bringToFront(): void {
    const obj = this.canvas?.getActiveObject();
    if (obj) this.canvas?.bringObjectToFront(obj);
  }

  sendToBack(): void {
    const obj = this.canvas?.getActiveObject();
    if (obj) this.canvas?.sendObjectToBack(obj);
  }

  toJSON(): string {
    if (!this.canvas) return '';
    return JSON.stringify(this.canvas.toJSON());
  }

  async loadFromJSON(json: string): Promise<void> {
    if (!this.canvas) return;
    await this.canvas.loadFromJSON(json);
    this.canvas.renderAll();
  }

  exportToPNG(options?: { multiplier?: number }): string {
    if (!this.canvas) return '';
    return this.canvas.toDataURL({ format: 'png', quality: 1, multiplier: options?.multiplier ?? 1 });
  }

  exportToSVG(): string {
    if (!this.canvas) return '';
    return this.canvas.toSVG();
  }

  clear(): void {
    if (!this.canvas) return;
    this.canvas.clear();
    this.canvas.backgroundColor = '#0A0A0F';
    this.canvas.renderAll();
  }

  setBackgroundColor(color: string): void {
    if (!this.canvas) return;
    this.canvas.backgroundColor = color;
    this.canvas.renderAll();
  }

  setGridVisibility(_visible: boolean): void {
    if (!this.canvas) return;
    this.canvas.renderAll();
  }

  setSnapToGrid(enabled: boolean): void { this.snapToGridEnabled = enabled; }

  resize(width: number, height: number): void {
    if (!this.canvas) return;
    this.canvas.setDimensions({ width, height });
    this.canvas.renderAll();
  }
}

export const fabricEngine = new FabricCanvasEngine();
