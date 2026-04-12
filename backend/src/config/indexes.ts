/**
 * Database Optimization - MongoDB Indexes
 * 
 * This file defines all indexes needed for optimal query performance.
 * Run this during deployment to production.
 */

import logger from '../config/logger';

interface IndexDefinition {
  collection: string;
  name: string;
  keys: Record<string, 1 | -1>;
  options?: Record<string, any>;
}

const INDEXES: IndexDefinition[] = [
  // ===== USER COLLECTION =====
  {
    collection: 'users',
    name: 'email_unique',
    keys: { email: 1 },
    options: { unique: true }
  },
  {
    collection: 'users',
    name: 'createdAt_index',
    keys: { createdAt: -1 }
  },
  {
    collection: 'users',
    name: 'stripeCustomerId_index',
    keys: { stripeCustomerId: 1 },
    options: { sparse: true }
  },
  {
    collection: 'users',
    name: 'deletedAt_ttl',
    keys: { deletedAt: 1 },
    options: {
      expireAfterSeconds: 2592000, // 30 days
      sparse: true
    }
  },

  // ===== TASK COLLECTION =====
  {
    collection: 'tasks',
    name: 'userId_index',
    keys: { userId: 1 }
  },
  {
    collection: 'tasks',
    name: 'userId_status_compound',
    keys: { userId: 1, status: 1 }
  },
  {
    collection: 'tasks',
    name: 'userId_dueDate_compound',
    keys: { userId: 1, dueDate: 1 }
  },
  {
    collection: 'tasks',
    name: 'userId_priority_compound',
    keys: { userId: 1, priority: 1 }
  },
  {
    collection: 'tasks',
    name: 'userId_category_compound',
    keys: { userId: 1, category: 1 }
  },
  {
    collection: 'tasks',
    name: 'teamId_status_compound',
    keys: { teamId: 1, status: 1 }
  },
  {
    collection: 'tasks',
    name: 'dueDate_index',
    keys: { dueDate: 1 }
  },
  {
    collection: 'tasks',
    name: 'createdAt_index',
    keys: { createdAt: -1 }
  },
  {
    collection: 'tasks',
    name: 'status_index',
    keys: { status: 1 }
  },
  {
    collection: 'tasks',
    name: 'priority_index',
    keys: { priority: 1 }
  },
  {
    collection: 'tasks',
    name: 'category_index',
    keys: { category: 1 }
  },
  {
    collection: 'tasks',
    name: 'tags_index',
    keys: { tags: 1 }
  },
  {
    collection: 'tasks',
    name: 'collaborators_index',
    keys: { collaborators: 1 }
  },
  {
    collection: 'tasks',
    name: 'title_description_tags_text',
    keys: { title: 'text', description: 'text', tags: 'text' },
    options: { weights: { title: 10, description: 5, tags: 3 } }
  },
  {
    collection: 'tasks',
    name: 'deletedAt_ttl',
    keys: { deletedAt: 1 },
    options: {
      expireAfterSeconds: 2592000, // 30 days
      sparse: true
    }
  },

  // ===== TEAM COLLECTION =====
  {
    collection: 'teams',
    name: 'ownerId_index',
    keys: { ownerId: 1 }
  },
  {
    collection: 'teams',
    name: 'createdAt_index',
    keys: { createdAt: -1 }
  },

  // ===== TEAM MEMBER COLLECTION =====
  {
    collection: 'team_members',
    name: 'teamId_userId_compound',
    keys: { teamId: 1, userId: 1 },
    options: { unique: true }
  },
  {
    collection: 'team_members',
    name: 'userId_index',
    keys: { userId: 1 }
  },

  // ===== ACHIEVEMENT COLLECTION =====
  {
    collection: 'achievements',
    name: 'userId_index',
    keys: { userId: 1 }
  },
  {
    collection: 'achievements',
    name: 'awardedAt_index',
    keys: { awardedAt: -1 }
  },
  {
    collection: 'achievements',
    name: 'type_index',
    keys: { type: 1 }
  },

  // ===== NOTIFICATION COLLECTION =====
  {
    collection: 'notifications',
    name: 'userId_index',
    keys: { userId: 1 }
  },
  {
    collection: 'notifications',
    name: 'userId_read_compound',
    keys: { userId: 1, read: 1 }
  },
  {
    collection: 'notifications',
    name: 'createdAt_index',
    keys: { createdAt: -1 }
  },
  {
    collection: 'notifications',
    name: 'createdAt_ttl',
    keys: { createdAt: 1 },
    options: {
      expireAfterSeconds: 7776000 // 90 days
    }
  },

  // ===== HABIT COLLECTION =====
  {
    collection: 'habits',
    name: 'userId_index',
    keys: { userId: 1 }
  },
  {
    collection: 'habits',
    name: 'teamId_index',
    keys: { teamId: 1 },
    options: { sparse: true }
  },

  // ===== AUDIT LOG COLLECTION =====
  {
    collection: 'audit_logs',
    name: 'userId_index',
    keys: { userId: 1 },
    options: { sparse: true }
  },
  {
    collection: 'audit_logs',
    name: 'timestamp_index',
    keys: { timestamp: -1 }
  },
  {
    collection: 'audit_logs',
    name: 'action_index',
    keys: { action: 1 }
  },
  {
    collection: 'audit_logs',
    name: 'timestamp_ttl',
    keys: { timestamp: 1 },
    options: {
      expireAfterSeconds: 7776000 // 90 days
    }
  },

  // ===== AI USAGE COLLECTION =====
  {
    collection: 'ai_usage',
    name: 'userId_index',
    keys: { userId: 1 }
  },
  {
    collection: 'ai_usage',
    name: 'timestamp_index',
    keys: { timestamp: -1 }
  },
  {
    collection: 'ai_usage',
    name: 'userId_timestamp_compound',
    keys: { userId: 1, timestamp: -1 }
  }
];

/**
 * Create all indexes
 */
export async function createIndexes(db: any): Promise<void> {
  try {
    logger.info('Starting index creation...');

    for (const indexDef of INDEXES) {
      const collection = db.collection(indexDef.collection);

      try {
        await collection.createIndex(indexDef.keys, {
          name: indexDef.name,
          ...indexDef.options
        });

        logger.info('Index created', {
          collection: indexDef.collection,
          index: indexDef.name
        });
      } catch (error: any) {
        // Index might already exist
        if (error.code === 85) {
          logger.debug('Index already exists', {
            collection: indexDef.collection,
            index: indexDef.name
          });
        } else {
          logger.error('Failed to create index', {
            collection: indexDef.collection,
            index: indexDef.name,
            error: error.message
          });
        }
      }
    }

    logger.info('Index creation completed');
  } catch (error: any) {
    logger.error('Index creation failed', { error: error.message });
    throw error;
  }
}

/**
 * Analyze indexes and get statistics
 */
export async function analyzeIndexes(db: any): Promise<any[]> {
  try {
    const collections = await db.listCollections().toArray();
    const stats = [];

    for (const collMeta of collections) {
      const collection = db.collection(collMeta.name);
      const indexes = await collection.getIndexes();

      for (const index of indexes) {
        const indexStats = await collection.aggregate([
          { $indexStats: {} }
        ]).toArray();

        stats.push({
          collection: collMeta.name,
          index: index.name,
          keys: index.key,
          size: index.size,
          usage: indexStats.find((s: any) => s.name === index.name)?.accesses
        });
      }
    }

    logger.info('Index analysis completed', { count: stats.length });
    return stats;
  } catch (error: any) {
    logger.error('Index analysis failed', { error: error.message });
    throw error;
  }
}

/**
 * Query optimization recommendations
 */
export const QUERY_OPTIMIZATION_TIPS = `
TASK MANAGEMENT QUERIES:

1. Get user tasks (most common query)
   ✓ Use compound index: userId_status_compound
   - db.find({ userId: id, status: 'pending' })

2. Get tasks due today
   ✓ Use index: userId_dueDate_compound
   - db.find({ userId: id, dueDate: { $gte: today, $lt: tomorrow } })

3. Search usertasks
   ✓ Use text index: title_description_tags_text
   - db.find({ $text: { $search: 'keyword' } })

4. Get high priority tasks
   ✓ Use index: userId_priority_compound
   - db.find({ userId: id, priority: 'high' })

PAGINATION TIPS:
- Use .lean() in Mongoose for read-only queries (30% faster)
- Limit fields with projection: .select('title status priority')
- Use skip/limit for pagination, not cursor sorting

CONNECTION POOLING:
- Default: 100 connections
- Adjust for your workload: minPoolSize: 10, maxPoolSize: 100

QUERY ANALYSIS:
- Use explain() to analyze query performance
- Look for missing indexes (COLLSCAN vs IXSCAN)
- Check for index intersections (slow)

CACHING:
- Cache frequently accessed data in Redis (5-30 min TTL)
- Invalidate on writes
- Use separate cache keys for different filters

BATCH OPERATIONS:
- Use bulkWrite() instead of individual inserts/updates
- Can be 10x faster for large operations
- Better for transaction handling
`;

/**
 * Export index configuration for other tools
 */
export const getIndexConfiguration = () => INDEXES;
