export type WebhookProcessingStatus =
  | "received"
  | "processed"
  | "failed"
  | "ignored";

export interface IWebhookPayloadArchive {
  deliveryId: string; // GitHub X-GitHub-Delivery header
  eventType: string; // e.g. issues, pull_request
  projectId?: string; // Foreign PostgreSQL Project UUID (if mapped)
  receivedAt: Date;
  payload: Record<string, unknown>;
  processingStatus: WebhookProcessingStatus;
  schemaVersion: number;
  createdAt?: Date;
  updatedAt?: Date;
}
