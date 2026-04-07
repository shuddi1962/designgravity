type EventCallback<T = unknown> = (data: T) => void;

interface EventSubscription<T = unknown> {
  id: string;
  callback: EventCallback<T>;
  once: boolean;
}

class EventBus {
  private events: Map<string, EventSubscription[]> = new Map();
  private isDebug = false;

  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    const subscription: EventSubscription = {
      id: this.generateId(),
      callback: callback as EventCallback,
      once: false,
    };

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(subscription);

    if (this.isDebug) {
      // Debug logging only when enabled - used for development
    }

    return () => this.off(event, subscription.id);
  }

  once<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    const subscription: EventSubscription = {
      id: this.generateId(),
      callback: callback as EventCallback,
      once: true,
    };

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(subscription);

    return () => this.off(event, subscription.id);
  }

  off(event: string, subscriptionId?: string): void {
    if (subscriptionId) {
      const subscriptions = this.events.get(event);
      if (subscriptions) {
        const index = subscriptions.findIndex((s) => s.id === subscriptionId);
        if (index !== -1) {
          subscriptions.splice(index, 1);
        }
      }
    } else {
      this.events.delete(event);
    }
  }

  emit<T = unknown>(event: string, data?: T): void {
    const subscriptions = this.events.get(event);
    if (!subscriptions) return;

    if (this.isDebug) {
      // Debug logging only when enabled - used for development
    }

    for (let i = subscriptions.length - 1; i >= 0; i--) {
      const subscription = subscriptions[i];
      subscription.callback(data);

      if (subscription.once) {
        subscriptions.splice(i, 1);
      }
    }
  }

  clear(): void {
    this.events.clear();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  setDebug(enabled: boolean): void {
    this.isDebug = enabled;
  }
}

export const eventBus = new EventBus();

export const EVENTS = {
  PROJECT_CREATED: 'project:created',
  PROJECT_OPENED: 'project:opened',
  PROJECT_SAVED: 'project:saved',
  PROJECT_DELETED: 'project:deleted',
  PROJECT_DUPLICATED: 'project:duplicated',

  OBJECT_SELECTED: 'canvas:object-selected',
  OBJECT_DESELECTED: 'canvas:object-deselected',
  OBJECT_ADDED: 'canvas:object-added',
  OBJECT_REMOVED: 'canvas:object-removed',
  OBJECT_UPDATED: 'canvas:object-updated',

  LAYER_CHANGED: 'canvas:layer-changed',
  PAGE_CHANGED: 'canvas:page-changed',
  TOOL_CHANGED: 'canvas:tool-changed',
  HISTORY_CHANGED: 'canvas:history-changed',

  AI_GENERATION_STARTED: 'ai:generation-started',
  AI_GENERATION_COMPLETED: 'ai:generation-completed',
  AI_GENERATION_FAILED: 'ai:generation-failed',

  EXPORT_STARTED: 'export:started',
  EXPORT_COMPLETED: 'export:completed',
  EXPORT_FAILED: 'export:failed',

  CARD_EXPORTED: 'card:exported',

  BRAND_KIT_APPLIED: 'brand-kit:applied',
  BRAND_KIT_UPDATED: 'brand-kit:updated',

  TEMPLATE_APPLIED: 'template:applied',

  MODULE_OPENED: 'module:opened',
  MODULE_CLOSED: 'module:closed',

  NOTIFICATION_SHOW: 'notification:show',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',

  SETTINGS_UPDATED: 'settings:updated',
  USER_LOGGED_IN: 'user:logged-in',
  USER_LOGGED_OUT: 'user:logged-out',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
