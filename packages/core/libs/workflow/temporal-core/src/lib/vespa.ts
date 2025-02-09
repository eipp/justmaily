import { YSQLQuery, VespaResult, VespaDocument, IndexConfig } from '../types';
import { createApiClient } from '../../../utils/api-client-factory'; // Import API client factory

export class VespaClient {
  private client: any;

  constructor(private config: {
    endpoint: string;
    applicationName: string;
    tenant: string;
    apiKey?: string;
  }) {
    this.client = createApiClient({ // Use createApiClient factory
      baseURL: config.endpoint,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-API-Key': config.apiKey })
      }
    });
  }

  async query<T>(query: YSQLQuery): Promise<VespaResult<T>> {
    try {
      const response = await this.client.post('/search/', {
        yql: query.yql,
        ranking: query.ranking,
        timeout: query.timeout || '5s',
        trace: {
          level: 3,
          timestamps: true
        }
      });

      return {
        totalCount: response.data.root.fields.totalCount,
        hits: response.data.root.children.map(this.transformHit)
      };
    } catch (error) {
      throw new Error(`Vespa query failed: ${error.message}`);
    }
  }

  async feed(documents: VespaDocument[]): Promise<void> {
    try {
      await this.client.post('/document/v1/', documents.map(doc => ({
        'put': `id:${this.config.tenant}:${doc.type}::${doc.id}`,
        'fields': doc.fields
      })));
    } catch (error) {
      throw new Error(`Vespa feed failed: ${error.message}`);
    }
  }

  async createIndex(config: IndexConfig): Promise<void> {
    try {
      await this.client.post('/application/v2/tenant/default/prepareandactivate', {
        services: {
          'content': {
            'documents': [
              {
                'document': config.name,
                'fields': config.fields.map(field => ({
                  'name': field.name,
                  'type': field.type,
                  'indexing': field.indexing || ['attribute', 'summary'],
                  'ranking': field.ranking || ['identity']
                }))
              }
            ]
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to create index: ${error.message}`);
    }
  }

  async search(query: string, type: string, ranking?: string): Promise<any[]> {
    try {
      const response = await this.client.get('/search/', {
        params: {
          yql: `select * from ${type} where userQuery()`,
          query,
          ranking,
          timeout: '1s'
        }
      });

      return response.data.root.children.map(this.transformHit);
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  async getDocument(type: string, id: string): Promise<any> {
    try {
      const response = await this.client.get(
        `/document/v1/${this.config.tenant}/${type}/docid/${id}`
      );
      return this.transformDocument(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to get document: ${error.message}`);
    }
  }

  async updateDocument(type: string, id: string, fields: Record<string, any>): Promise<void> {
    try {
      await this.client.put(
        `/document/v1/${this.config.tenant}/${type}/docid/${id}`,
        { fields }
      );
    } catch (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }

  async deleteDocument(type: string, id: string): Promise<void> {
    try {
      await this.client.delete(
        `/document/v1/${this.config.tenant}/${type}/docid/${id}`
      );
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  async createRankProfile(name: string, config: any): Promise<void> {
    try {
      await this.client.post('/application/v2/tenant/default/prepareandactivate', {
        services: {
          'content': {
            'rank-profiles': {
              [name]: config
            }
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to create rank profile: ${error.message}`);
    }
  }

  private transformHit(hit: any) {
    return {
      id: hit.id,
      relevance: hit.relevance,
      source: hit.source,
      fields: hit.fields
    };
  }

  private transformDocument(doc: any) {
    return {
      id: doc.id,
      fields: doc.fields
    };
  }

  // Analytics-specific methods
  async storeAnalytics(data: {
    type: string;
    timestamp: Date;
    metrics: Record<string, number>;
    metadata: Record<string, any>;
  }): Promise<void> {
    const document: VespaDocument = {
      type: 'analytics',
      id: `${data.type}_${data.timestamp.getTime()}`,
      fields: {
        type: data.type,
        timestamp: data.timestamp.toISOString(),
        metrics: data.metrics,
        metadata: data.metadata
      }
    };

    await this.feed([document]);
  }

  async queryAnalytics(params: {
    type: string;
    startTime: Date;
    endTime: Date;
    aggregation?: string;
    filters?: Record<string, any>;
  }): Promise<any> {
    const query = `
      select ${params.aggregation || '*'}
      from analytics
      where type = "${params.type}"
      and timestamp range(${params.startTime.toISOString()}, ${params.endTime.toISOString()})
      ${this.buildFilters(params.filters)}
    `;

    return await this.query({ yql: query });
  }

  async getAggregatedMetrics(params: {
    type: string;
    metric: string;
    interval: 'hour' | 'day' | 'week';
    startTime: Date;
    endTime: Date;
  }): Promise<any> {
    const query = `
      select
        timestamp.${params.interval}() as period,
        sum(metrics.${params.metric}) as value
      from analytics
      where type = "${params.type}"
      and timestamp range(${params.startTime.toISOString()}, ${params.endTime.toISOString()})
      group by period
      order by period
    `;

    return await this.query({ yql: query });
  }

  private buildFilters(filters?: Record<string, any>): string {
    if (!filters) return '';
    
    return Object.entries(filters)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `and metadata.${key} contains "${value}"`;
        }
        return `and metadata.${key} = ${value}`;
      })
      .join(' ');
  }
}