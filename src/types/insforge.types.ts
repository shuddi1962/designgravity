export interface InsforgeConfig {
  apiUrl: string;
  publicKey: string;
  secretKey?: string;
}

export interface InsforgeResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface InsforgeUploadResponse {
  url: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface InsforgeJobResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: unknown;
  error?: string;
}

export interface InsforgeAuthResponse {
  userId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface InsforgeUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: SubscriptionPlan;
  workspaceId: string;
  createdAt: string;
}

export type SubscriptionPlan = 'free' | 'pro' | 'business' | 'enterprise';

export interface InsforgeWorkspace {
  id: string;
  name: string;
  ownerId: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
}

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
}

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';

export interface WorkspaceSettings {
  defaultBrandKit?: string;
  defaultColorMode: string;
  allowedFileTypes: string[];
  maxFileSize: number;
}
