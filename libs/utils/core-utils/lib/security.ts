import { createCipheriv, createDecipheriv, randomBytes, Cipher, Decipher } from 'crypto';
import type { AuditLogger } from '@justmaily/pg-audit';
import type { WorkflowClient } from '@justmaily/temporal-core';
import { z } from 'zod';

import type { MetricsService } from './monitoring';

export const SecurityConfigSchema = z.object({
  encryptionKey: z.string().min(32),
  encryptionAlgorithm: z.string().default('aes-256-gcm'),
  auditLogEnabled: z.boolean().default(true),
  gdprEnabled: z.boolean().default(true),
});

export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;

export interface EncryptedData {
  iv: string;
  authTag: string;
  encryptedData: string;
}

export interface AuditEvent {
  userId: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

export class SecurityService {
  private readonly encryptionKey: Buffer;
  private readonly algorithm: string;
  private readonly auditLogger: AuditLogger;
  private readonly workflowClient: WorkflowClient;
  private readonly metrics: MetricsService;

  constructor(
    config: SecurityConfig,
    auditLogger: AuditLogger,
    workflowClient: WorkflowClient,
    metrics: MetricsService
  ) {
    this.encryptionKey = Buffer.from(config.encryptionKey, 'utf-8');
    this.algorithm = config.encryptionAlgorithm;
    this.auditLogger = auditLogger;
    this.workflowClient = workflowClient;
    this.metrics = metrics;
  }

  encrypt(data: string): EncryptedData {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.encryptionKey, iv) as Cipher & { getAuthTag(): Buffer };
    
    const encryptedData = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final(),
    ]);

    return {
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex'),
      encryptedData: encryptedData.toString('hex'),
    };
  }

  decrypt(encryptedData: EncryptedData): string {
    const decipher = createDecipheriv(
      this.algorithm,
      this.encryptionKey,
      Buffer.from(encryptedData.iv, 'hex')
    ) as Decipher & { setAuthTag(tag: Buffer): void };

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedData.encryptedData, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  async logAuditEvent(event: AuditEvent): Promise<void> {
    await this.auditLogger.log({
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      details: event.details,
      timestamp: event.timestamp,
    });
  }

  // Unused parameters are prefixed with _
  async handleDataRequest(_userId: string, _data: Record<string, unknown>): Promise<void> {
    // Implementation pending
  }

  async handleDataDeletion(_data: Record<string, unknown>): Promise<void> {
    // Implementation pending
  }

  async handleDataExport(_data: Record<string, unknown>): Promise<void> {
    // Implementation pending
  }

  async handleDataUpdate(_data: Record<string, unknown>): Promise<void> {
    // Implementation pending
  }
} 