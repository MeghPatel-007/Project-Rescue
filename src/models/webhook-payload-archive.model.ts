import { Schema, model, models } from "mongoose";
import type { IWebhookPayloadArchive } from "../types/webhook-payload-archive.type";

const webhookPayloadArchiveSchema = new Schema<IWebhookPayloadArchive>(
  {
    deliveryId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true, index: true },
    projectId: { type: String, index: true },
    receivedAt: { type: Date, required: true, default: Date.now },
    payload: { type: Schema.Types.Mixed, required: true, default: {} },
    processingStatus: {
      type: String,
      enum: ["received", "processed", "failed", "ignored"],
      required: true,
      default: "received",
    },
    schemaVersion: { type: Number, required: true, default: 1 },
  },
  {
    timestamps: true,
  },
);

webhookPayloadArchiveSchema.index({ eventType: 1, receivedAt: -1 });

export const WebhookPayloadArchive =
  models.WebhookPayloadArchive ??
  model<IWebhookPayloadArchive>(
    "WebhookPayloadArchive",
    webhookPayloadArchiveSchema,
  );
