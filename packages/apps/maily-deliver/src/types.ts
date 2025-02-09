export interface Message {
  id: string;
  to: string[];
  subject: string;
  content: string;
  textContent?: string;
  trackOpens: boolean;
  trackClicks: boolean;
  metadata?: Record<string, any>;
  cc?: string[];
  bcc?: string[];
}

export interface WebhookEvent {
  type: string;
  timestamp: string;
  payload: {
  };
  signature: string;
} 