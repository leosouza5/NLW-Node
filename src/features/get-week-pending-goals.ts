import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { db } from '../db'
import { goals } from '../db/schema'

dayjs.extend(weekOfYear)

export function getWeekPendingGoals() {
  const currentYear = dayjs().year()
  const currentWeek = dayjs().week()
}
