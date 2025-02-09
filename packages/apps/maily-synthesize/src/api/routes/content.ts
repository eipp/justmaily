import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ContentGenerationService, ContentGenerationOptions, SubjectLineOptions, ModelResponse } from '../../services/content';
import { AudienceDataSchema } from '../../types/validation';

const contentGenerationOptionsSchema = z.object({
  tone: z.string().optional(),
  style: z.string().optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  callToAction: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  personalization: z.record(z.string()).optional()
});

const subjectLineOptionsSchema = z.object({
  tone: z.string().optional(),
  maxLength: z.number().min(10).max(100).optional(),
  keywords: z.array(z.string()).optional(),
  abTestVariants: z.number().min(2).max(5).optional()
});

const chatCompletionOptionsSchema = z.object({
  message: z.string().min(1),
  tone: z.string().optional(), // Add tone option
  style: z.string().optional(), // Add style option
  length: z.enum(['short', 'medium', 'long']).optional(), // Add length option
});

const audienceDataSchema = z.array(z.record(z.any()));

export default async function contentRoutes(
  fastify: FastifyInstance,
  contentService: ContentGenerationService
) {
  // Generate email content
  fastify.post<{
    Body: {
      brief: string;
      options: ContentGenerationOptions;
    };
  }>(
    '/generate',
    {
      schema: {
        body: z.object({
          brief: z.string().min(10),
          options: contentGenerationOptionsSchema
        }),
        response: {
          200: z.object({
            content: z.string(),
            metrics: z.object({
              promptTokens: z.number(),
              completionTokens: z.number(),
              totalTokens: z.number(),
              latencyMs: z.number()
            })
          })
        }
      }
    },
    async (request: FastifyRequest<{ Body: { brief: string; options: ContentGenerationOptions } }>, reply: FastifyReply) => {
      const { brief, options } = request.body;
      const result = await contentService.generateEmailContent(brief, options);

      return reply.send({
        content: result.data,
        metrics: {
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          totalTokens: result.usage.totalTokens,
          latencyMs: result.usage.latencyMs
        }
      });
    }
  );

  // Generate subject lines
  fastify.post<{
    Body: {
      emailContent: string;
      options: SubjectLineOptions;
    };
  }>(
    '/subject-lines',
    {
      schema: {
        body: z.object({
          emailContent: z.string().min(10),
          options: subjectLineOptionsSchema
        }),
        response: {
          200: z.object({
            subjectLines: z.array(z.string()),
            metrics: z.object({
              promptTokens: z.number(),
              completionTokens: z.number(),
              totalTokens: z.number(),
              latencyMs: z.number()
            })
          })
        }
      }
    },
    async (request: FastifyRequest<{ Body: { emailContent: string; options: SubjectLineOptions } }>, reply: FastifyReply) => {
      const { emailContent, options } = request.body;
      const result = await contentService.generateSubjectLines(
        emailContent,
        options
      );

      return reply.send({
        subjectLines: result.data,
        metrics: {
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          totalTokens: result.usage.totalTokens,
          latencyMs: result.usage.latencyMs
        }
      });
    }
  );

  // Generate A/B test suggestions
  fastify.post<{
    Body: {
      content: string;
      targetMetric: 'openRate' | 'clickRate' | 'conversionRate';
    };
  }>(
    '/ab-test',
    {
      schema: {
        body: z.object({
          content: z.string().min(10),
          targetMetric: z.enum(['openRate', 'clickRate', 'conversionRate'])
        }),
        response: {
          200: z.object({
            suggestions: z.array(
              z.object({
                variant: z.string(),
                rationale: z.string(),
                predictedImpact: z.object({
                  openRate: z.number().optional(),
                  clickRate: z.number().optional(),
                  conversionRate: z.number().optional()
                })
              })
            ),
            metrics: z.object({
              promptTokens: z.number(),
              completionTokens: z.number(),
              totalTokens: z.number(),
              latencyMs: z.number()
            })
          })
        }
      }
    },
    async (request: FastifyRequest<{ Body: { content: string; targetMetric: 'openRate' | 'clickRate' | 'conversionRate' } }>, reply: FastifyReply) => {
      const { content, targetMetric } = request.body;
      const result = await contentService.generateABTestSuggestions(
        content,
        targetMetric
      );

      return reply.send({
        suggestions: result.data,
        metrics: {
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          totalTokens: result.usage.totalTokens,
          latencyMs: result.usage.latencyMs
        }
      });
    }
  );

  // Generate personalization recommendations
  fastify.post<{
    Body: {
      content: string;
      audienceData: Record<string, any>[];
    };
  }>(
    '/personalization',
    {
      schema: {
        body: z.object({
          content: z.string().min(10),
          audienceData: audienceDataSchema
        }),
        response: {
          200: z.object({
            recommendations: z.array(z.record(z.string())),
            metrics: z.object({
              promptTokens: z.number(),
              completionTokens: z.number(),
              totalTokens: z.number(),
              latencyMs: z.number()
            })
          })
        }
      }
    },
    async (request: FastifyRequest<{ Body: { content: string; audienceData: Record<string, any>[] } }>, reply: FastifyReply) => {
      const { content, audienceData } = request.body;
      const result = await contentService.generatePersonalizationRecommendations(
        content,
        audienceData
      );

      return reply.send({
        recommendations: result.data,
        metrics: {
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          totalTokens: result.usage.totalTokens,
          latencyMs: result.usage.latencyMs
        }
      });
    }
  );

  // Optimize content for deliverability
  fastify.post<{
    Body: {
      content: string;
    };
  }>(
    '/optimize-deliverability',
    {
      schema: {
        body: z.object({
          content: z.string().min(10)
        }),
        response: {
          200: z.object({
            optimizedContent: z.string(),
            improvements: z.array(z.string()),
            spamScore: z.number(),
            metrics: z.object({
              promptTokens: z.number(),
              completionTokens: z.number(),
              totalTokens: z.number(),
              latencyMs: z.number()
            })
          })
        }
      }
    },
    async (request: FastifyRequest<{ Body: { content: string } }>, reply: FastifyReply) => {
      const { content } = request.body;
      const result = await contentService.optimizeForDeliverability(content);

      return reply.send({
        ...result.data,
        metrics: {
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          totalTokens: result.usage.totalTokens,
          latencyMs: result.usage.latencyMs
        }
      });
    }
  );

  // Chat endpoint
  fastify.post<{
    Body: {
      message: string;
      tone?: string;
      style?: string;
      length?: 'short' | 'medium' | 'long';
    };
  }>(
    '/chat/completions',
    {
      schema: {
        body: z.object({
          message: chatCompletionOptionsSchema
        }),
        response: {
          200: z.object({
            content: z.string(),
            metrics: z.object({
              promptTokens: z.number(),
              completionTokens: z.number(),
              totalTokens: z.number(),
              latencyMs: z.number()
            })
          })
        }
      }
    },
    async (request: FastifyRequest<{ Body: { message: string; tone?: string; style?: string; length?: 'short' | 'medium' | 'long' } }>, reply: FastifyReply) => {
      const { message, tone, style, length } = request.body;
      // Use generateEmailContent for chat completions
      const result: ModelResponse<string> = await contentService.generateEmailContent(message, { tone, style, length });

      return reply.send({
        content: result.data,
        metrics: result.usage
      });
    }
  );

  // New route for chat completion
  fastify.post<{
    Body: {
      message: string;
    };
  }>(
    '/chat',
    {
      schema: {
        body: z.object({
          message: z.string().min(1)
        }),
        response: {
          200: z.object({
            content: z.string(),
            metrics: z.object({
              promptTokens: z.number(),
              completionTokens: z.number(),
              totalTokens: z.number(),
              latencyMs: z.number()
            })
          })
        }
      }
    },
    async (request: FastifyRequest<{ Body: { message: string } }>, reply: FastifyReply) => {
      try {
        // Validate the request body using the refined audience schema
        const input = AudienceDataSchema.parse(request.body);
        // Use dedicated method for chat completion
        const result = await contentService.generateChatCompletion(input);
        reply.status(200).send({
          content: result.data,
          metrics: result.usage
        });
      } catch (error) {
        reply.status(500).send({ error: 'Internal Server Error' });
      }
    }
  );
}