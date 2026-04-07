import { FabricObject, IText, Rect, Ellipse, Image, Line, Canvas, ActiveSelection, Shadow as FabricShadow, Gradient, FabricImage } from 'fabric';
import type { CanvasObject, Fill, Stroke, Shadow } from '@/types/project.types';

export function fabricToCanvasObject(fabricObject: FabricObject): CanvasObject {
  const bounds = fabricObject.getBoundingRect();

  return {
    id: (fabricObject as unknown as { id?: string }).id || crypto.randomUUID(),
    type: getObjectType(fabricObject),
    x: Math.round(fabricObject.left ?? 0),
    y: Math.round(fabricObject.top ?? 0),
    width: Math.round(bounds.width),
    height: Math.round(bounds.height),
    rotation: Math.round(fabricObject.angle ?? 0),
    opacity: fabricObject.opacity ?? 1,
    locked: !fabricObject.selectable,
    visible: fabricObject.visible ?? true,
    blendMode: 'normal',
    fill: getFill(fabricObject),
    stroke: getStroke(fabricObject),
    shadow: getShadow(fabricObject),
    properties: getProperties(fabricObject),
  };
}

export function canvasObjectToFabric(obj: CanvasObject): FabricObject {
  switch (obj.type) {
    case 'text': return createTextObject(obj);
    case 'shape': return createShapeObject(obj);
    case 'image': return createImageObject(obj);
    case 'line': return createLineObject(obj);
    default: return createShapeObject(obj);
  }
}

function getObjectType(fabricObject: FabricObject): CanvasObject['type'] {
  switch (fabricObject.type) {
    case 'i-text':
    case 'text':
    case 'textbox': return 'text';
    case 'image': return 'image';
    case 'rect':
    case 'ellipse':
    case 'polygon':
    case 'triangle': return 'shape';
    case 'line': return 'line';
    case 'path': return 'vector';
    case 'group': return 'group';
    default: return 'shape';
  }
}

function getFill(fabricObject: FabricObject): Fill | undefined {
  const fill = fabricObject.fill;
  if (!fill || typeof fill === 'string') {
    return fill && fill !== 'transparent' ? { type: 'solid', color: fill } : undefined;
  }
  if ('colorStops' in fill) {
    const gradientFill = fill as unknown as { type: string; colorStops: { offset: number; color: string }[] };
    return {
      type: gradientFill.type === 'linear' ? 'linear-gradient' : 'radial-gradient',
      colors: gradientFill.colorStops.map((stop) => stop.color),
      stops: gradientFill.colorStops.map((stop) => stop.offset),
      angle: 0,
    };
  }
  return undefined;
}

function getStroke(fabricObject: FabricObject): Stroke | undefined {
  if (!fabricObject.stroke) return undefined;
  return {
    color: fabricObject.stroke as string,
    width: fabricObject.strokeWidth ?? 1,
    cap: (fabricObject.strokeLineCap ?? 'butt') as 'butt' | 'round' | 'square',
    join: (fabricObject.strokeLineJoin ?? 'miter') as 'miter' | 'round' | 'bevel',
    dash: Array.isArray(fabricObject.strokeDashArray) ? fabricObject.strokeDashArray : undefined,
  };
}

function getShadow(fabricObject: FabricObject): Shadow | undefined {
  if (!fabricObject.shadow) return undefined;
  const shadow = fabricObject.shadow as FabricShadow;
  return {
    x: shadow.offsetX ?? 0,
    y: shadow.offsetY ?? 0,
    blur: shadow.blur ?? 0,
    spread: 0,
    color: (shadow.color as string) ?? '#000000',
    inset: false,
  };
}

function getProperties(fabricObject: FabricObject): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (fabricObject.type === 'i-text' || fabricObject.type === 'text' || fabricObject.type === 'textbox') {
    const textObj = fabricObject as IText;
    props.text = textObj.text;
    props.fontSize = textObj.fontSize;
    props.fontFamily = textObj.fontFamily;
    props.fontWeight = textObj.fontWeight;
    props.textAlign = textObj.textAlign;
  }
  if (fabricObject.type === 'image') {
    const imgObj = fabricObject as FabricImage;
    props.src = imgObj.getSrc?.();
    props.crossOrigin = imgObj.getCrossOrigin?.();
  }
  if (fabricObject.type === 'rect') {
    const rectObj = fabricObject as Rect;
    props.rx = rectObj.rx;
    props.ry = rectObj.ry;
  }
  if (fabricObject.type === 'ellipse') {
    const ellipseObj = fabricObject as Ellipse;
    props.rx = ellipseObj.rx;
    props.ry = ellipseObj.ry;
  }
  return props;
}

function createTextObject(obj: CanvasObject): IText {
  return new IText((obj.properties.text as string) || 'Text', {
    left: obj.x,
    top: obj.y,
    fill: obj.fill?.color ?? '#F8F8FC',
    fontSize: (obj.properties.fontSize as number) ?? 24,
    fontFamily: (obj.properties.fontFamily as string) ?? 'DM Sans',
    fontWeight: (obj.properties.fontWeight as string) ?? 'normal',
    textAlign: (obj.properties.textAlign as IText['textAlign']) ?? 'left',
    angle: obj.rotation,
    opacity: obj.opacity,
    selectable: !obj.locked,
    visible: obj.visible,
  });
}

function createShapeObject(obj: CanvasObject): Rect {
  return new Rect({
    left: obj.x,
    top: obj.y,
    width: obj.width,
    height: obj.height,
    fill: obj.fill?.color ?? '#7C3AED',
    stroke: obj.stroke?.color,
    strokeWidth: obj.stroke?.width ?? 0,
    angle: obj.rotation,
    opacity: obj.opacity,
    selectable: !obj.locked,
    visible: obj.visible,
    rx: (obj.properties.rx as number) ?? 0,
    ry: (obj.properties.ry as number) ?? 0,
  });
}

function createImageObject(obj: CanvasObject): Image {
  const imgEl = new globalThis.Image();
  const image = new FabricImage(imgEl, {
    left: obj.x,
    top: obj.y,
    angle: obj.rotation,
    opacity: obj.opacity,
    selectable: !obj.locked,
    visible: obj.visible,
  });
  if (obj.properties.src) {
    FabricImage.fromURL(obj.properties.src as string, {}, (img: FabricImage | null) => {
      if (img) {
        image.setElement(img.getElement());
        image.setCoords();
      }
    });
  }
  return image;
}

function createLineObject(obj: CanvasObject): Line {
  return new Line([obj.x, obj.y, obj.x + obj.width, obj.y + obj.height], {
    stroke: obj.stroke?.color ?? '#F8F8FC',
    strokeWidth: obj.stroke?.width ?? 2,
    angle: obj.rotation,
    opacity: obj.opacity,
    selectable: !obj.locked,
    visible: obj.visible,
  });
}

export function serializeCanvas(canvas: Canvas): string {
  return JSON.stringify(canvas.toJSON());
}

export async function deserializeCanvas(canvas: Canvas, json: string): Promise<void> {
  await canvas.loadFromJSON(json);
  canvas.renderAll();
}

export function getSelectionBounds(canvas: Canvas): { x: number; y: number; width: number; height: number } | null {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return null;
  const bounds = activeObject.getBoundingRect();
  return {
    x: Math.round(bounds.left),
    y: Math.round(bounds.top),
    width: Math.round(bounds.width),
    height: Math.round(bounds.height),
  };
}

export function alignObjects(canvas: Canvas, alignment: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom'): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();

  if (activeObject.type === 'activeSelection') {
    const selection = activeObject as ActiveSelection;
    const objects = selection.getObjects();
    objects.forEach((obj) => applyAlignment(obj, alignment, canvasWidth, canvasHeight, selection));
    canvas.renderAll();
    return;
  }
  applyAlignment(activeObject, alignment, canvasWidth, canvasHeight);
  canvas.renderAll();
}

function applyAlignment(obj: FabricObject, alignment: string, canvasWidth: number, canvasHeight: number, parent?: ActiveSelection): void {
  const bounds = obj.getBoundingRect();
  switch (alignment) {
    case 'left': obj.set('left', parent ? -canvasWidth / 2 : 0); break;
    case 'center-x': obj.set('left', (canvasWidth - bounds.width) / 2 - (parent ? canvasWidth / 2 : 0)); break;
    case 'right': obj.set('left', canvasWidth - bounds.width - (parent ? canvasWidth / 2 : 0)); break;
    case 'top': obj.set('top', parent ? -canvasHeight / 2 : 0); break;
    case 'center-y': obj.set('top', (canvasHeight - bounds.height) / 2 - (parent ? canvasHeight / 2 : 0)); break;
    case 'bottom': obj.set('top', canvasHeight - bounds.height - (parent ? canvasHeight / 2 : 0)); break;
  }
  obj.setCoords();
}

export function distributeObjects(canvas: Canvas, direction: 'horizontal' | 'vertical'): void {
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'activeSelection') return;
  const selection = activeObject as ActiveSelection;
  const objects = selection.getObjects();
  if (objects.length < 3) return;

  const sorted = [...objects].sort((a, b) =>
    direction === 'horizontal' ? (a.left ?? 0) - (b.left ?? 0) : (a.top ?? 0) - (b.top ?? 0)
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalSpace = direction === 'horizontal' ? (last.left ?? 0) - (first.left ?? 0) : (last.top ?? 0) - (first.top ?? 0);
  const spacing = totalSpace / (sorted.length - 1);

  sorted.forEach((obj, index) => {
    if (index === 0 || index === sorted.length - 1) return;
    if (direction === 'horizontal') obj.set('left', (first.left ?? 0) + spacing * index);
    else obj.set('top', (first.top ?? 0) + spacing * index);
    obj.setCoords();
  });
  canvas.renderAll();
}
