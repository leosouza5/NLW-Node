import { z } from 'zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { createGoal } from '../../features/create-goals';
import { getWeekPendingGoals } from '../../features/get-week-pending-goals';
import { createGoalCompletion } from '../../features/create-goal-completion';

export const createCompletionRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/completions',
    {
      schema: {
        body: z.object({
          goalId: z.string(),
        }),
      },
    },
    async request => {
      const { goalId } = request.body
      const result = await createGoalCompletion({
        goalId
      })
    }

  )


};