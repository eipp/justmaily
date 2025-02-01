import { useState, useCallback } from 'react';
import axios from 'axios';

interface UseQueryRewritingOptions {
  baseUrl?: string;
}

interface RewriteQueryResponse {
  rewrittenQuery: string;
}

interface BatchRewriteResponse {
  rewrittenQueries: string[];
}

export function useQueryRewriting(options: UseQueryRewritingOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const baseUrl = options.baseUrl || process.env.NEXT_PUBLIC_AI_ORCHESTRATION_URL;

  const rewriteQuery = useCallback(
    async (query: string, context?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.post<RewriteQueryResponse>(
          `${baseUrl}/query-rewriting/rewrite`,
          { query, context }
        );
        return response.data.rewrittenQuery;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to rewrite query');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [baseUrl]
  );

  const batchRewrite = useCallback(
    async (queries: string[]) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.post<BatchRewriteResponse>(
          `${baseUrl}/query-rewriting/batch-rewrite`,
          { queries }
        );
        return response.data.rewrittenQueries;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to batch rewrite queries');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [baseUrl]
  );

  const provideFeedback = useCallback(
    async (feedback: {
      originalQuery: string;
      rewrittenQuery: string;
      retrievalSuccess: boolean;
      relevanceScore: number;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        await axios.post(`${baseUrl}/query-rewriting/feedback`, feedback);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to provide feedback');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [baseUrl]
  );

  return {
    rewriteQuery,
    batchRewrite,
    provideFeedback,
    isLoading,
    error,
  };
} 