import { FabricObject, Line, Rect, Text, Canvas } from 'fabric';

export interface GridOptions {
  gridSize: number;
  gridColor: string;
  gridOpacity: number;
  showGrid: boolean;
  snapToGrid: boolean;
}

export interface RulerOptions {
  showRulers: boolean;
  unit: 'px' | 'in' | 'mm';
  dpi: number;
}

export interface GuideOptions {
  showGuides: boolean;
  guides: Guide[];
  snapToGuides: boolean;
  guideThreshold: number;
}

export interface Guide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  color: string;
  locked: boolean;
}

export function drawGrid(canvas: Canvas, options: GridOptions): void {
  if (!options.showGrid) { removeGrid(canvas); return; }
  removeGrid(canvas);
  const width = canvas.getWidth();
  const height = canvas.getHeight();
  const zoom = canvas.getZoom();
  const gridSize = options.gridSize * zoom;
  if (gridSize < 5) return;

  for (let x = 0; x <= width; x += gridSize) {
    canvas.add(new Line([x, 0, x, height], { stroke: options.gridColor, strokeWidth: 1 / zoom, opacity: options.gridOpacity, selectable: false, evented: false, excludeFromExport: true }));
  }
  for (let y = 0; y <= height; y += gridSize) {
    canvas.add(new Line([0, y, width, y], { stroke: options.gridColor, strokeWidth: 1 / zoom, opacity: options.gridOpacity, selectable: false, evented: false, excludeFromExport: true }));
  }
  canvas.renderAll();
}

export function removeGrid(canvas: Canvas): void {
  canvas.getObjects().filter((obj) => obj.excludeFromExport).forEach((obj) => canvas.remove(obj));
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

export function applyGridSnapping(canvas: Canvas, gridSize: number, enabled: boolean): void {
  if (!enabled) return;
  canvas.on('object:moving', (e) => {
    if (!e.target) return;
    e.target.set({ left: snapToGrid(e.target.left ?? 0, gridSize), top: snapToGrid(e.target.top ?? 0, gridSize) });
    canvas.renderAll();
  });
}

export function drawRulers(canvas: Canvas, options: RulerOptions): void {
  if (!options.showRulers) { removeRulers(canvas); return; }
  removeRulers(canvas);
  const width = canvas.getWidth();
  const height = canvas.getHeight();
  const rulerSize = 20;
  const zoom = canvas.getZoom();

  canvas.add(new Rect({ left: rulerSize, top: 0, width: width - rulerSize, height: rulerSize, fill: '#141420', selectable: false, evented: false, excludeFromExport: true }));
  canvas.add(new Rect({ left: 0, top: rulerSize, width: rulerSize, height: height - rulerSize, fill: '#141420', selectable: false, evented: false, excludeFromExport: true }));
  canvas.add(new Rect({ left: 0, top: 0, width: rulerSize, height: rulerSize, fill: '#0A0A0F', selectable: false, evented: false, excludeFromExport: true }));

  const tickSpacing = 50 * zoom;
  const majorTickSpacing = 100 * zoom;

  for (let x = rulerSize; x < width; x += tickSpacing) {
    const isMajor = (x - rulerSize) % majorTickSpacing < 1;
    const tickHeight = isMajor ? 8 : 4;
    canvas.add(new Line([x, rulerSize - tickHeight, x, rulerSize], { stroke: '#2A2A3E', strokeWidth: 1, selectable: false, evented: false, excludeFromExport: true }));
    if (isMajor) {
      canvas.add(new Text(Math.round((x - rulerSize) / zoom).toString(), { left: x + 2, top: 2, fontSize: 8 / zoom, fill: '#9090A8', selectable: false, evented: false, excludeFromExport: true }));
    }
  }
  for (let y = rulerSize; y < height; y += tickSpacing) {
    const isMajor = (y - rulerSize) % majorTickSpacing < 1;
    const tickWidth = isMajor ? 8 : 4;
    canvas.add(new Line([rulerSize - tickWidth, y, rulerSize, y], { stroke: '#2A2A3E', strokeWidth: 1, selectable: false, evented: false, excludeFromExport: true }));
    if (isMajor) {
      canvas.add(new Text(Math.round((y - rulerSize) / zoom).toString(), { left: 2, top: y + 2, fontSize: 8 / zoom, fill: '#9090A8', selectable: false, evented: false, excludeFromExport: true, angle: -90 }));
    }
  }
  canvas.renderAll();
}

export function removeRulers(canvas: Canvas): void {
  canvas.getObjects().filter((obj) => obj.excludeFromExport).forEach((obj) => canvas.remove(obj));
}

export function addGuide(canvas: Canvas, guide: Guide): Line {
  const width = canvas.getWidth();
  const height = canvas.getHeight();
  const zoom = canvas.getZoom();
  let guideLine: Line;
  if (guide.type === 'horizontal') {
    guideLine = new Line([0, guide.position, width, guide.position], { stroke: guide.color, strokeWidth: 1 / zoom, selectable: !guide.locked, evented: !guide.locked, excludeFromExport: false });
  } else {
    guideLine = new Line([guide.position, 0, guide.position, height], { stroke: guide.color, strokeWidth: 1 / zoom, selectable: !guide.locked, evented: !guide.locked, excludeFromExport: false });
  }
  canvas.add(guideLine);
  canvas.renderAll();
  return guideLine;
}

export function removeGuide(canvas: Canvas, guideId: string): void {
  for (const obj of canvas.getObjects()) {
    if ((obj as FabricObject & { guideId?: string }).guideId === guideId) { canvas.remove(obj); break; }
  }
  canvas.renderAll();
}

export function setupGuideSnapping(canvas: Canvas, guides: Guide[], threshold: number): void {
  if (guides.length === 0) return;
  canvas.on('object:moving', (e) => {
    if (!e.target) return;
    const bounds = e.target.getBoundingRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    guides.forEach((guide) => {
      if (guide.type === 'horizontal' && Math.abs(centerY - guide.position) < threshold) e.target?.set('top', guide.position - bounds.height / 2);
      else if (Math.abs(centerX - guide.position) < threshold) e.target?.set('left', guide.position - bounds.width / 2);
    });
    canvas.renderAll();
  });
}

export function createSmartGuides(canvas: Canvas, target: FabricObject): Line[] {
  const guides: Line[] = [];
  const objects = canvas.getObjects().filter((obj) => obj !== target && obj.selectable && !obj.excludeFromExport);
  const targetBounds = target.getBoundingRect();
  const targetCenterX = targetBounds.left + targetBounds.width / 2;
  const targetCenterY = targetBounds.top + targetBounds.height / 2;
  const threshold = 5;

  objects.forEach((obj) => {
    const bounds = obj.getBoundingRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    if (Math.abs(targetCenterX - centerX) < threshold) {
      guides.push(new Line([centerX, 0, centerX, canvas.getHeight()], { stroke: '#7C3AED', strokeWidth: 1, strokeDashArray: [5, 5], selectable: false, evented: false, excludeFromExport: true }));
    }
    if (Math.abs(targetCenterY - centerY) < threshold) {
      guides.push(new Line([0, centerY, canvas.getWidth(), centerY], { stroke: '#7C3AED', strokeWidth: 1, strokeDashArray: [5, 5], selectable: false, evented: false, excludeFromExport: true }));
    }
  });
  return guides;
}

export function clearSmartGuides(canvas: Canvas): void {
  canvas.getObjects().filter((obj) => obj.excludeFromExport && obj.stroke === '#7C3AED').forEach((obj) => canvas.remove(obj));
}
