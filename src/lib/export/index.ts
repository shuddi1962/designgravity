import { Canvas } from 'fabric';

export interface ExportOptions {
  format: 'png' | 'jpg' | 'webp' | 'svg' | 'pdf';
  quality?: number;
  multiplier?: number;
  transparent?: boolean;
  includeBackground?: boolean;
}

export interface ExportResult {
  url: string;
  blob: Blob;
  filename: string;
  size: number;
  width: number;
  height: number;
}

export interface PlatformSize {
  name: string;
  width: number;
  height: number;
  category: string;
}

export const PLATFORM_SIZES: PlatformSize[] = [
  { name: 'Instagram Post', width: 1080, height: 1080, category: 'social' },
  { name: 'Instagram Story', width: 1080, height: 1920, category: 'social' },
  { name: 'Facebook Post', width: 1200, height: 630, category: 'social' },
  { name: 'Twitter Post', width: 1600, height: 900, category: 'social' },
  { name: 'LinkedIn Post', width: 1200, height: 627, category: 'social' },
  { name: 'YouTube Thumbnail', width: 1280, height: 720, category: 'video' },
  { name: 'Pinterest Pin', width: 1000, height: 1500, category: 'social' },
  { name: 'TikTok', width: 1080, height: 1920, category: 'video' },
  { name: 'A4 Print', width: 2480, height: 3508, category: 'print' },
  { name: 'Business Card', width: 1050, height: 600, category: 'print' },
  { name: 'Flyer', width: 2550, height: 3300, category: 'print' },
  { name: 'Poster', width: 2700, height: 3600, category: 'print' },
  { name: 'Presentation', width: 1920, height: 1080, category: 'web' },
  { name: 'Banner', width: 1500, height: 500, category: 'web' },
  { name: 'Website Header', width: 1920, height: 400, category: 'web' },
];

export async function exportCanvas(canvas: Canvas, options: ExportOptions): Promise<ExportResult> {
  const { format, quality = 1, multiplier = 1 } = options;
  if (format === 'svg') return exportSVG(canvas);
  return exportRaster(canvas, { format, quality, multiplier });
}

async function exportRaster(canvas: Canvas, options: { format: string; quality: number; multiplier: number }): Promise<ExportResult> {
  const dataURL = canvas.toDataURL({ format: options.format as 'png' | 'jpeg' | 'webp', quality: options.quality, multiplier: options.multiplier });
  const response = await fetch(dataURL);
  const blob = await response.blob();
  const width = Math.round(canvas.getWidth() * options.multiplier);
  const height = Math.round(canvas.getHeight() * options.multiplier);
  return { url: dataURL, blob, filename: `design-${Date.now()}.${options.format}`, size: blob.size, width, height };
}

function exportSVG(canvas: Canvas): ExportResult {
  const svgString = canvas.toSVG();
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  return { url, blob, filename: `design-${Date.now()}.svg`, size: blob.size, width: canvas.getWidth(), height: canvas.getHeight() };
}

export function downloadExport(result: ExportResult): void {
  const link = document.createElement('a');
  link.href = result.url;
  link.download = result.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (result.url.startsWith('blob:')) URL.revokeObjectURL(result.url);
}

export function checkExportQuality(canvas: Canvas, multiplier: number): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const width = canvas.getWidth() * multiplier;
  const height = canvas.getHeight() * multiplier;
  if (width * height > 16777216) warnings.push('Export dimensions exceed 16 megapixels. This may cause performance issues.');
  if (width > 8192 || height > 8192) warnings.push('Export dimensions exceed 8192px. Some browsers may fail to render.');
  const imageCount = canvas.getObjects().filter((obj) => obj.type === 'image').length;
  if (imageCount > 50) warnings.push('Design contains many images. Export may take longer.');
  return { isValid: warnings.length === 0, warnings };
}

export function getOptimalMultiplier(targetDPI: number, baseDPI: number = 72): number {
  return targetDPI / baseDPI;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
