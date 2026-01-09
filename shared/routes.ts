import { z } from 'zod';
import { insertCampaignSchema, insertActionSchema, insertUserSchema, campaigns, actions, executions, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    getOrCreate: {
      method: 'POST' as const,
      path: '/api/users/auth',
      input: z.object({
        walletAddress: z.string(),
        role: z.enum(["user", "advertiser"]).optional()
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        201: z.custom<typeof users.$inferSelect>(),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:walletAddress',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/users/:walletAddress/stats',
      responses: {
        200: z.object({
          totalEarned: z.string(),
          pendingRewards: z.string(),
          tasksCompleted: z.number(),
          reputation: z.number(),
          balance: z.string(),
          tokenBalances: z.array(z.object({
            symbol: z.string(),
            balance: z.string(),
            earned: z.string(),
            pending: z.string()
          })).optional()
        }),
      }
    },
    executions: {
      method: 'GET' as const,
      path: '/api/users/:walletAddress/executions',
      responses: {
        200: z.array(z.custom<typeof executions.$inferSelect & { action: typeof actions.$inferSelect, campaign: typeof campaigns.$inferSelect }>()),
      }
    }
  },
  campaigns: {
    list: {
      method: 'GET' as const,
      path: '/api/campaigns',
      input: z.object({
        creatorId: z.string().optional(), // Filter by creator
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof campaigns.$inferSelect & { actions: typeof actions.$inferSelect[] }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/campaigns/:id',
      responses: {
        200: z.custom<typeof campaigns.$inferSelect & { actions: typeof actions.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/campaigns',
      input: insertCampaignSchema.extend({
        actions: z.array(insertActionSchema.omit({ campaignId: true }))
      }),
      responses: {
        201: z.custom<typeof campaigns.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  executions: {
    verify: {
      method: 'POST' as const,
      path: '/api/verify',
      input: z.object({
        actionId: z.number(),
        userWallet: z.string(),
        proof: z.string().optional(),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
          status: z.enum(["verified", "rejected", "pending", "holding", "waiting", "ready", "paid"]),
          message: z.string(),
          executionId: z.number().optional(),
          remaining: z.number().optional(),
          txSignature: z.string().optional()
        }),
        400: errorSchemas.validation,
      },
    },
    claim: {
      method: 'POST' as const,
      path: '/api/claim',
      input: z.object({
        executionId: z.number(),
        userWallet: z.string(),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
          txSignature: z.string().optional(),
        }),
        400: errorSchemas.validation,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
