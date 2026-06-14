export type AdminNotificationEvent =
  | "ACCOUNT_ACTIVATED"
  | "TELEGRAM_BOUND"
  | "PASSWORD_RESET_COMPLETED"
  | "PASSWORD_RESET_ASSISTANCE_REQUEST";

export interface AdminNotificationPayload {
  event: AdminNotificationEvent;
  userId: string;
  userName: string;
  userUsername: string;
  role: string;
  email: string;
  level?: string | null;
  telegramUsername?: string | null;
  telegramId?: string | null;
  operationTime: string;
  metadata?: Record<string, unknown>;
}

export interface AdminNotificationResult {
  success: boolean;
  event: AdminNotificationEvent;
  message: string;
  timestamp: string;
  error?: string;
}
