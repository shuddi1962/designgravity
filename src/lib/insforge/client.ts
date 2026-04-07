import { eventBus, EVENTS } from '../event-bus';
import type { Project } from '@/types/project.types';

const API_BASE = process.env.NEXT_PUBLIC_INSFORGE_API_URL || 'https://api.insforge.dev';

interface RequestOptions extends RequestInit {
  timeout?: number;
}

class InsforgeClient {
  private publicKey: string;
  private accessToken: string | undefined;
  private refreshToken: string | undefined;

  constructor() {
    this.publicKey = process.env.NEXT_PUBLIC_INSFORGE_PUBLIC_KEY || '';
    this.accessToken = process.env.INSFORGE_ACCESS_TOKEN;
    this.refreshToken = process.env.INSFORGE_REFRESH_TOKEN;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens(): void {
    this.accessToken = undefined;
    this.refreshToken = undefined;
  }

  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Api-Key': this.publicKey,
      ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { timeout = 30000, ...fetchOptions } = options;

    const headers = {
      ...this.getAuthHeaders(),
      ...fetchOptions.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/storage/upload`);
      xhr.setRequestHeader('X-Api-Key', this.publicKey);
      if (this.accessToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
      }

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            onProgress((e.loaded / e.total) * 100);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.url || response.publicUrl);
          } catch {
            reject(new Error('Invalid response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  }

  async aiGenerateImage(params: {
    prompt: string;
    model?: string;
    width?: number;
    height?: number;
    style?: string;
    negativePrompt?: string;
  }): Promise<{ jobId: string }> {
    const result = await this.post<{ jobId: string }>('/ai/generate-image', params);
    eventBus.emit(EVENTS.AI_GENERATION_STARTED, { type: 'image', jobId: result.jobId });
    return result;
  }

  async aiEnhanceImage(params: {
    imageUrl: string;
    enhancementType: string;
    strength?: number;
  }): Promise<{ jobId: string }> {
    return this.post<{ jobId: string }>('/ai/enhance-image', params);
  }

  async aiRemoveBackground(imageUrl: string): Promise<{ jobId: string }> {
    return this.post<{ jobId: string }>('/ai/remove-background', { imageUrl });
  }

  async aiGenerateVideo(params: {
    prompt?: string;
    imageUrl?: string;
    duration?: number;
  }): Promise<{ jobId: string }> {
    return this.post<{ jobId: string }>('/ai/generate-video', params);
  }

  async aiTextToSpeech(params: {
    text: string;
    voice?: string;
    language?: string;
  }): Promise<{ jobId: string }> {
    return this.post<{ jobId: string }>('/ai/text-to-speech', params);
  }

  async aiBirthdayCard(params: {
    personName: string;
    age?: number;
    occasionType: string;
    tone: string;
    message?: string;
    senderName?: string;
    photoUrl?: string;
  }): Promise<{ cardDesignUrl: string; suggestedMessage: string }> {
    return this.post('/ai/birthday-card/generate-writeup', params);
  }

  async aiBirthdayCardAutoDesign(params: {
    cardId: string;
    templateId?: string;
    photoUrl?: string;
  }): Promise<{ cardDesignUrl: string }> {
    return this.post('/ai/birthday-card/auto-design', params);
  }

  async aiBirthdayCardEnhancePhoto(photoUrl: string): Promise<{ enhancedUrl: string }> {
    return this.post('/ai/birthday-card/enhance-photo', { photoUrl });
  }

  async aiBirthdayCardRemoveBackground(photoUrl: string): Promise<{ processedUrl: string }> {
    return this.post('/ai/birthday-card/remove-background', { photoUrl });
  }

  async getJobStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    result?: unknown;
    error?: string;
  }> {
    return this.get(`/jobs/${jobId}`);
  }

  async pollJob<T>(jobId: string, interval = 1000): Promise<T> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getJobStatus(jobId);
          if (status.status === 'completed') {
            resolve(status.result as T);
          } else if (status.status === 'failed') {
            reject(new Error(status.error || 'Job failed'));
          } else {
            setTimeout(poll, interval);
          }
        } catch (error) {
          reject(error);
        }
      };
      poll();
    });
  }

  async chat(messages: Array<{ role: string; content: string }>, model?: string): Promise<string> {
    const result = await this.post<{ response: string }>('/ai/chat', {
      messages,
      model: model || 'deepseek/deepseek-v3.2',
    });
    return result.response;
  }
}

export const insforge = new InsforgeClient();
