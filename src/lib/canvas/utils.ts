import { Canvas } from 'fabric';

export function validateCanvasState(canvas: Canvas | null): boolean {
  if (!canvas) return false;
  try {
    const json = canvas.toJSON();
    return typeof json === 'object' && 'objects' in json;
  } catch {
    return false;
  }
}

export function getCanvasDimensions(canvas: Canvas): { width: number; height: number } {
  return { width: canvas.getWidth(), height: canvas.getHeight() };
}

export function calculateZoomToFit(
  canvasWidth: number,
  canvasHeight: number,
  containerWidth: number,
  containerHeight: number,
  padding: number = 40
): number {
  const availableWidth = containerWidth - padding * 2;
  const availableHeight = containerHeight - padding * 2;
  const scaleX = availableWidth / canvasWidth;
  const scaleY = availableHeight / canvasHeight;
  return Math.min(scaleX, scaleY, 1);
}

export function getViewportCenter(canvas: Canvas): { x: number; y: number } {
  const vpt = canvas.viewportTransform;
  if (!vpt) return { x: 0, y: 0 };
  const width = canvas.getWidth();
  const height = canvas.getHeight();
  const zoom = canvas.getZoom();
  return { x: (-vpt[4] + width / 2) / zoom, y: (-vpt[5] + height / 2) / zoom };
}

export function panToCenter(canvas: Canvas): void {
  const width = canvas.getWidth();
  const height = canvas.getHeight();
  const zoom = canvas.getZoom();
  const vpt = canvas.viewportTransform;
  if (vpt) {
    vpt[4] = width / 2 - (width * zoom) / 2;
    vpt[5] = height / 2 - (height * zoom) / 2;
    canvas.requestRenderAll();
  }
}
