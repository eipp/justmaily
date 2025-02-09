'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.VespaClient = void 0;
const axios_1 = __importDefault(require('axios'));
class VespaClient {
  constructor(config) {
    this.config = config;
    this.client = axios_1.default.create({
      baseURL: config.endpoint,
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        config.apiKey && { 'X-API-Key': config.apiKey },
      ),
    });
  }
  async query(query) {
    try {
      const response = await this.client.post('/search/', {
        yql: query.yql,
        ranking: query.ranking,
        timeout: query.timeout || '5s',
        trace: {
          level: 3,
          timestamps: true,
        },
      });
      return {
        totalCount: response.data.root.fields.totalCount,
        hits: response.data.root.children.map(this.transformHit),
      };
    } catch (error) {
      throw new Error(`Vespa query failed: ${error.message}`);
    }
  }
  async feed(documents) {
    try {
      await this.client.post(
        '/document/v1/',
        documents.map((doc) => ({
          put: `id:${this.config.tenant}:${doc.type}::${doc.id}`,
          fields: doc.fields,
        })),
      );
    } catch (error) {
      throw new Error(`Vespa feed failed: ${error.message}`);
    }
  }
  async createIndex(config) {
    try {
      await this.client.post(
        '/application/v2/tenant/default/prepareandactivate',
        {
          services: {
            content: {
              documents: [
                {
                  document: config.name,
                  fields: config.fields.map((field) => ({
                    name: field.name,
                    type: field.type,
                    indexing: field.indexing || ['attribute', 'summary'],
                    ranking: field.ranking || ['identity'],
                  })),
                },
              ],
            },
          },
        },
      );
    } catch (error) {
      throw new Error(`Failed to create index: ${error.message}`);
    }
  }
  async search(query, type, ranking) {
    try {
      const response = await this.client.get('/search/', {
        params: {
          yql: `select * from ${type} where userQuery()`,
          query,
          ranking,
          timeout: '1s',
        },
      });
      return response.data.root.children.map(this.transformHit);
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
  async getDocument(type, id) {
    var _a;
    try {
      const response = await this.client.get(
        `/document/v1/${this.config.tenant}/${type}/docid/${id}`,
      );
      return this.transformDocument(response.data);
    } catch (error) {
      if (
        ((_a = error.response) === null || _a === void 0
          ? void 0
          : _a.status) === 404
      ) {
        return null;
      }
      throw new Error(`Failed to get document: ${error.message}`);
    }
  }
  async updateDocument(type, id, fields) {
    try {
      await this.client.put(
        `/document/v1/${this.config.tenant}/${type}/docid/${id}`,
        { fields },
      );
    } catch (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }
  async deleteDocument(type, id) {
    try {
      await this.client.delete(
        `/document/v1/${this.config.tenant}/${type}/docid/${id}`,
      );
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }
  async createRankProfile(name, config) {
    try {
      await this.client.post(
        '/application/v2/tenant/default/prepareandactivate',
        {
          services: {
            content: {
              'rank-profiles': {
                [name]: config,
              },
            },
          },
        },
      );
    } catch (error) {
      throw new Error(`Failed to create rank profile: ${error.message}`);
    }
  }
  transformHit(hit) {
    return {
      id: hit.id,
      relevance: hit.relevance,
      source: hit.source,
      fields: hit.fields,
    };
  }
  transformDocument(doc) {
    return {
      id: doc.id,
      fields: doc.fields,
    };
  }
  // Analytics-specific methods
  async storeAnalytics(data) {
    const document = {
      type: 'analytics',
      id: `${data.type}_${data.timestamp.getTime()}`,
      fields: {
        type: data.type,
        timestamp: data.timestamp.toISOString(),
        metrics: data.metrics,
        metadata: data.metadata,
      },
    };
    await this.feed([document]);
  }
  async queryAnalytics(params) {
    const query = `
      select ${params.aggregation || '*'}
      from analytics
      where type = "${params.type}"
      and timestamp range(${params.startTime.toISOString()}, ${params.endTime.toISOString()})
      ${this.buildFilters(params.filters)}
    `;
    return await this.query({ yql: query });
  }
  async getAggregatedMetrics(params) {
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
  buildFilters(filters) {
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
exports.VespaClient = VespaClient;
