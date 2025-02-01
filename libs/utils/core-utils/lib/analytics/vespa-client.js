"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VespaClient = void 0;
const axios_1 = __importStar(require("axios"));
const exponential_backoff_1 = require("exponential-backoff");
const p_limit_1 = __importDefault(require("p-limit"));
const zod_1 = require("zod");
// Validation schemas
const vespaConfigSchema = zod_1.z.object({
    endpoint: zod_1.z.string().url(),
    maxConnections: zod_1.z.number().int().positive().default(10),
    timeout: zod_1.z.number().int().positive().default(5000),
    retries: zod_1.z.number().int().nonnegative().default(3),
    retryDelay: zod_1.z.number().int().positive().default(1000),
});
const vespaQuerySchema = zod_1.z.object({
    yql: zod_1.z.string(),
    hits: zod_1.z.number().int().positive().optional(),
    offset: zod_1.z.number().int().nonnegative().optional(),
    timeout: zod_1.z.string().optional(),
});
class VespaClient {
    constructor(config, metrics, security) {
        this.metrics = metrics;
        this.security = security;
        this.config = vespaConfigSchema.parse(config);
        this.connectionPool = new Set();
        this.idleConnections = [];
        this.concurrencyLimit = (0, p_limit_1.default)(this.config.maxConnections);
        this.client = this.createAxiosInstance();
        this.initializeConnectionPool();
    }
    createAxiosInstance() {
        const instance = axios_1.default.create({
            baseURL: this.config.endpoint,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        instance.interceptors.request.use((config) => {
            this.metrics.increment('vespa.requests.total');
            return config;
        }, (error) => {
            this.metrics.increment('vespa.requests.error');
            return Promise.reject(error);
        });
        instance.interceptors.response.use((response) => {
            this.metrics.increment('vespa.responses.success');
            return response;
        }, (error) => {
            this.metrics.increment('vespa.responses.error');
            return Promise.reject(error);
        });
        return instance;
    }
    initializeConnectionPool() {
        for (let i = 0; i < this.config.maxConnections; i++) {
            const connection = this.createAxiosInstance();
            this.connectionPool.add(connection);
            this.idleConnections.push(connection);
        }
    }
    async getConnection() {
        let connection = this.idleConnections.pop();
        if (!connection) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            connection = this.idleConnections.pop();
        }
        if (!connection) {
            throw new Error('No available connections in the pool');
        }
        return connection;
    }
    releaseConnection(connection) {
        if (this.connectionPool.has(connection)) {
            this.idleConnections.push(connection);
        }
    }
    async query(query) {
        const parsedQuery = typeof query === 'string' ? { yql: query } : query;
        const validatedQuery = vespaQuerySchema.parse(parsedQuery);
        try {
            const connection = await this.getConnection();
            try {
                const response = await (0, exponential_backoff_1.backOff)(() => connection.post('/search/', validatedQuery), {
                    numOfAttempts: this.config.retries,
                    startingDelay: this.config.retryDelay,
                });
                this.releaseConnection(connection);
                return response.data;
            }
            catch (error) {
                this.releaseConnection(connection);
                if (error instanceof axios_1.AxiosError) {
                    this.metrics.increment('vespa.query.error');
                    throw new Error(`Vespa query failed: ${error.message}`);
                }
                throw error;
            }
        }
        catch (error) {
            if (error instanceof axios_1.AxiosError) {
                this.metrics.increment('vespa.query.error');
                throw new Error(`Vespa query failed: ${error.message}`);
            }
            if (error instanceof Error) {
                throw new Error(`Vespa query failed: ${error.message}`);
            }
            throw new Error('Vespa query failed with an unknown error');
        }
    }
    async feed(documents) {
        const startTime = Date.now();
        const batchId = Math.random().toString(36).substring(7);
        try {
            // Process documents in parallel with concurrency limit
            await Promise.all(documents.map(doc => this.concurrencyLimit(() => (0, exponential_backoff_1.backOff)(async () => {
                const connection = await this.getConnection();
                try {
                    await connection.post('/document/v1/', doc);
                }
                finally {
                    this.releaseConnection(connection);
                }
            }, {
                numOfAttempts: this.config.retries,
                startingDelay: this.config.retryDelay,
                timeMultiple: 2,
                maxDelay: 10000,
            }))));
            // Record metrics
            this.metrics.recordLatency('vespa_feed_duration', Date.now() - startTime);
            this.metrics.incrementCounter('vespa_feed_success', documents.length);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.metrics.recordError('vespa_feed_error', errorMessage, {
                batch_id: batchId,
                document_count: documents.length,
                duration: Date.now() - startTime
            });
            throw error;
        }
    }
    async delete(collection, id) {
        const startTime = Date.now();
        try {
            await this.concurrencyLimit(() => (0, exponential_backoff_1.backOff)(async () => {
                const connection = await this.getConnection();
                try {
                    await connection.delete(`/document/v1/${collection}/docid/${id}`);
                }
                finally {
                    this.releaseConnection(connection);
                }
            }, {
                numOfAttempts: this.config.retries,
                startingDelay: this.config.retryDelay,
                timeMultiple: 2,
                maxDelay: 10000,
            }));
            // Record metrics
            this.metrics.recordLatency('vespa_delete_duration', Date.now() - startTime);
            this.metrics.incrementCounter('vespa_delete_success');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.metrics.recordError('vespa_delete_error', errorMessage, {
                collection,
                document_id: id,
                duration: Date.now() - startTime
            });
            throw error;
        }
    }
    async optimize(collection) {
        const startTime = Date.now();
        try {
            await this.concurrencyLimit(() => (0, exponential_backoff_1.backOff)(async () => {
                const connection = await this.getConnection();
                try {
                    await connection.post(`/document/v1/${collection}/optimize`);
                }
                finally {
                    this.releaseConnection(connection);
                }
            }, {
                numOfAttempts: this.config.retries,
                startingDelay: this.config.retryDelay,
                timeMultiple: 2,
                maxDelay: 10000,
            }));
            // Record metrics
            this.metrics.recordLatency('vespa_optimize_duration', Date.now() - startTime);
            this.metrics.incrementCounter('vespa_optimize_success');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.metrics.recordError('vespa_optimize_error', errorMessage, {
                collection,
                duration: Date.now() - startTime
            });
            throw error;
        }
    }
    transformHit(hit) {
        return {
            id: hit.id,
            relevance: hit.relevance,
            source: hit.source,
            fields: hit.fields
        };
    }
    isSensitiveQuery(yql) {
        const sensitivePatterns = [
            /password/i,
            /credit.?card/i,
            /ssn/i,
            /social.?security/i,
            /bank.?account/i,
        ];
        return sensitivePatterns.some(pattern => pattern.test(yql));
    }
    // Cleanup method to be called when shutting down
    async cleanup() {
        for (const connection of this.connectionPool) {
            if (connection) {
                connection.interceptors.request.eject(0);
                connection.interceptors.response.eject(0);
            }
        }
        this.connectionPool.clear();
        this.idleConnections.length = 0;
    }
}
exports.VespaClient = VespaClient;
