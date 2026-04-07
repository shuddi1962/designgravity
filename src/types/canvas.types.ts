export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  selectedObjects: string[];
  activeTool: ToolType;
  activePage: string;
  isDrawing: boolean;
  isDragging: boolean;
}

export type ToolType =
  | 'select'
  | 'text'
  | 'rectangle'
  | 'ellipse'
  | 'polygon'
  | 'line'
  | 'pen'
  | 'image'
  | 'crop'
  | 'eyedropper'
  | 'hand';

export interface HistoryEntry {
  id: string;
  action: string;
  timestamp: number;
  state: string;
}

export interface Layer {
  id: string;
  name: string;
  objects: string[];
  locked: boolean;
  visible: boolean;
  blendMode: string;
  opacity: number;
}

export interface Guide {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number;
  locked: boolean;
}

export interface AlignmentTarget {
  id: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  };
}

export type AlignmentType =
  | 'left'
  | 'center-x'
  | 'right'
  | 'top'
  | 'center-y'
  | 'bottom'
  | 'distribute-x'
  | 'distribute-y';

export interface ExportSettings {
  format: ExportFormat;
  quality: number;
  dpi: number;
  transparent: boolean;
  colorMode: 'RGB' | 'CMYK';
}

export type ExportFormat =
  | 'png'
  | 'jpg'
  | 'webp'
  | 'svg'
  | 'pdf'
  | 'tiff'
  | 'gif'
  | 'mp4'
  | 'webm';
