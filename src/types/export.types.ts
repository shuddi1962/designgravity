export type ExportFormat =
  | 'png'
  | 'jpg'
  | 'webp'
  | 'svg'
  | 'pdf'
  | 'tiff'
  | 'gif'
  | 'mp4'
  | 'webm'
  | 'mov'
  | 'avif';

export interface ExportRequest {
  projectId: string;
  format: ExportFormat;
  quality: number;
  dpi: number;
  transparent: boolean;
  pages?: string[];
  options?: ExportOptions;
}

export interface ExportOptions {
  includeBleed?: boolean;
  includeCropMarks?: boolean;
  includeRegistrationMarks?: boolean;
  colorMode?: 'RGB' | 'CMYK';
  flattenLayers?: boolean;
  optimizeFileSize?: boolean;
}

export interface ExportResponse {
  success: boolean;
  jobId?: string;
  downloadUrl?: string;
  error?: string;
}

export interface QualityCheckResult {
  passed: boolean;
  issues: QualityIssue[];
}

export interface QualityIssue {
  severity: 'error' | 'warning' | 'info';
  category: QualityCategory;
  message: string;
  objectId?: string;
  fix?: string;
}

export type QualityCategory =
  | 'resolution'
  | 'alignment'
  | 'spacing'
  | 'color'
  | 'font'
  | 'bleed'
  | 'margin'
  | 'spelling'
  | 'general';

export interface PlatformSize {
  platform: string;
  width: number;
  height: number;
  name: string;
}

export const PLATFORM_SIZES: PlatformSize[] = [
  { platform: 'Instagram Post', width: 1080, height: 1080, name: '1:1' },
  { platform: 'Instagram Story', width: 1080, height: 1920, name: '9:16' },
  { platform: 'Facebook Post', width: 1200, height: 630, name: '1.91:1' },
  { platform: 'Facebook Cover', width: 820, height: 312, name: '2.63:1' },
  { platform: 'Twitter/X Post', width: 1200, height: 675, name: '16:9' },
  { platform: 'LinkedIn Post', width: 1200, height: 627, name: '1.91:1' },
  { platform: 'YouTube Thumbnail', width: 1280, height: 720, name: '16:9' },
  { platform: 'TikTok', width: 1080, height: 1920, name: '9:16' },
  { platform: 'Pinterest Pin', width: 1000, height: 1500, name: '2:3' },
];
