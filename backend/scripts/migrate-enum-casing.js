/* One-off migration: normalize legacy task enum casing.
 *
 * Earlier frontend builds wrote PascalCase values ('Completed', 'Medium',
 * 'NotStarted', ...) straight into MongoDB because updates skipped schema
 * validation, and the pre-2026-07 schema used 'not_started' where the
 * unified vocabulary now uses 'pending'. This rewrites every task document
 * to the canonical lowercase values.
 *
 * Usage: MONGODB_URI=... node scripts/migrate-enum-casing.js
 * (defaults to mongodb://localhost:27017/task-manager)
 *
 * Safe to re-run: every update is a no-op once documents are normalized.
 */
const { MongoClient } = require('mongodb')

const STATUS_MAP = {
  NotStarted: 'pending',
  not_started: 'pending',
  Pending: 'pending',
  InProgress: 'in_progress',
  'in-progress': 'in_progress',
  Completed: 'completed',
  Paused: 'on_hold',
  OnHold: 'on_hold',
  Cancelled: 'cancelled',
  Archived: 'cancelled',
}
const PRIORITY_MAP = { Critical: 'critical', High: 'high', Medium: 'medium', Low: 'low' }
const DIFFICULTY_MAP = { Easy: 'easy', Medium: 'medium', Hard: 'hard', VeryHard: 'very_hard' }

async function migrateField(tasks, field, map) {
  let total = 0
  for (const [from, to] of Object.entries(map)) {
    if (from === to) continue
    const res = await tasks.updateMany({ [field]: from }, { $set: { [field]: to } })
    if (res.modifiedCount) {
      console.log(`  ${field}: '${from}' -> '${to}' (${res.modifiedCount})`)
      total += res.modifiedCount
    }
  }
  return total
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager'
  const client = new MongoClient(uri)
  await client.connect()
  const tasks = client.db().collection('tasks')

  console.log(`Migrating task enum casing in ${uri}`)
  const changed =
    (await migrateField(tasks, 'status', STATUS_MAP)) +
    (await migrateField(tasks, 'priority', PRIORITY_MAP)) +
    (await migrateField(tasks, 'difficulty', DIFFICULTY_MAP))

  const canonical = {
    status: ['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'],
    priority: ['low', 'medium', 'high', 'critical'],
    difficulty: ['easy', 'medium', 'hard', 'very_hard'],
  }
  for (const [field, values] of Object.entries(canonical)) {
    const stragglers = await tasks.countDocuments({ [field]: { $nin: values, $exists: true } })
    if (stragglers) {
      console.warn(`  WARNING: ${stragglers} document(s) still carry an unrecognized ${field}`)
    }
  }

  console.log(`Done. ${changed} field value(s) rewritten.`)
  await client.close()
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
