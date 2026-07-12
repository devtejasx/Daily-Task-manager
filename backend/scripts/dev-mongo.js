/* Local development MongoDB without a system install or Docker.
 *
 * Starts a real mongod (downloaded and cached by mongodb-memory-server)
 * bound to localhost:27017 so the backend's default MONGODB_URI works.
 * Data lives in memory: it disappears when this process stops. For
 * persistent data, install MongoDB Community or run the mongo Docker
 * image instead.
 *
 * Usage: node scripts/dev-mongo.js
 */
const { MongoMemoryServer } = require('mongodb-memory-server')

async function main() {
  const server = await MongoMemoryServer.create({
    instance: { port: 27017, dbName: 'task-manager' },
  })
  console.log(`mongod ready at ${server.getUri()} (in-memory, dev only)`)

  const stop = async () => {
    await server.stop()
    process.exit(0)
  }
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
}

main().catch((err) => {
  console.error('Failed to start in-memory MongoDB:', err)
  process.exit(1)
})
