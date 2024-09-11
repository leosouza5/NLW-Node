import { count, and, gte, lte, eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

const firstDayOfWeek = dayjs().startOf('week').toDate()
const lastDayOfWeek = dayjs().endOf('week').toDate()

interface CreateGoalCompletionRequest {
  goalId: string
}


export async function createGoalCompletion({
  goalId
}: CreateGoalCompletionRequest) {
  const goalCompetionCounts = db.$with('goal_completion_counts').as(
    db.select({
      completionCount: count(goalCompletions.id).mapWith(Number).as('completionCount'),
      goalId: goalCompletions.goalId
    }
    ).from(goalCompletions).where(and(
      gte(goalCompletions.createdAt, firstDayOfWeek),
      lte(goalCompletions.createdAt, lastDayOfWeek),
      eq(goalCompletions.goalId, goalId)
    ),
    )
      .groupBy(goalCompletions.goalId)
  )
  const result = await db.with(goalCompetionCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql`
        COALESCE(
          ${goalCompetionCounts.completionCount},0
        )
        `.mapWith(Number)
    })
    .from(goals)
    .leftJoin(goalCompetionCounts, eq(goalCompetionCounts.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1)

  const { completionCount, desiredWeeklyFrequency } = result[0]

  if (completionCount >= desiredWeeklyFrequency)
    throw new Error('Goal already completed this week')

  const insertResult = await db
    .insert(goalCompletions)
    .values({ goalId })
    .returning()

  const goalCompletion = result[0]

  return { goalCompletion }
}
