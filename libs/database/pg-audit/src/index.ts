import { Pool } from 'pg';
import pino from 'pino';

const logger = pino({
  name: 'pg-audit',
  level: process.env.LOG_LEVEL || 'info'
});

export interface AuditLogEntry {
  action: string;
  table: string;
  record_id: string;
  user_id: string;
  changes: Record<string, any>;
  timestamp: Date;
}

export class PgAudit {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production'
    });
  }

  async logChange(entry: Omit<AuditLogEntry, 'timestamp'>) {
    try {
      const timestamp = new Date();
      const query = `
        INSERT INTO audit_logs (action, table_name, record_id, user_id, changes, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      
      await this.pool.query(query, [
        entry.action,
        entry.table,
        entry.record_id,
        entry.user_id,
        JSON.stringify(entry.changes),
        timestamp
      ]);

      logger.info({
        msg: 'Audit log entry created',
        action: entry.action,
        table: entry.table,
        recordId: entry.record_id
      });
    } catch (error) {
      logger.error({
        msg: 'Failed to create audit log entry',
        error,
        entry
      });
      throw error;
    }
  }

  async getChanges(table: string, recordId: string) {
    try {
      const query = `
        SELECT * FROM audit_logs
        WHERE table_name = $1 AND record_id = $2
        ORDER BY created_at DESC
      `;
      
      const result = await this.pool.query(query, [table, recordId]);
      return result.rows;
    } catch (error) {
      logger.error({
        msg: 'Failed to retrieve audit log entries',
        error,
        table,
        recordId
      });
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }
} 