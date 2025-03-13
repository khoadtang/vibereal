const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Get database metrics
  router.get('/', async (req, res, next) => {
    try {
      // Get active connections
      const connectionsQuery = `
        SELECT count(*) as active_connections 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `;
      
      // Get table statistics
      const tableStatsQuery = `
        SELECT 
          schemaname,
          relname as table_name,
          seq_scan,
          seq_tup_read,
          idx_scan,
          idx_tup_fetch,
          n_tup_ins,
          n_tup_upd,
          n_tup_del,
          n_live_tup,
          n_dead_tup
        FROM pg_stat_user_tables
        WHERE schemaname = 'ecommerce'
        ORDER BY n_live_tup DESC
      `;
      
      // Get query statistics
      const queryStatsQuery = `
        SELECT 
          substring(query, 1, 50) as query_preview,
          calls,
          total_time,
          min_time,
          max_time,
          mean_time,
          rows
        FROM pg_stat_statements
        ORDER BY total_time DESC
        LIMIT 10
      `;
      
      const [connections, tableStats, queryStats] = await Promise.all([
        pool.query(connectionsQuery),
        pool.query(tableStatsQuery),
        pool.query(queryStatsQuery).catch(() => ({ rows: [] })) // Gracefully handle if pg_stat_statements is not available
      ]);
      
      res.json({
        connections: connections.rows[0],
        table_stats: tableStats.rows,
        query_stats: queryStats.rows
      });
    } catch (err) {
      next(err);
    }
  });

  // Get table sizes
  router.get('/table-sizes', async (req, res, next) => {
    try {
      const query = `
        SELECT
          table_schema,
          table_name,
          pg_size_pretty(pg_total_relation_size('"' || table_schema || '"."' || table_name || '"')) as total_size,
          pg_size_pretty(pg_relation_size('"' || table_schema || '"."' || table_name || '"')) as table_size,
          pg_size_pretty(pg_total_relation_size('"' || table_schema || '"."' || table_name || '"') - 
                         pg_relation_size('"' || table_schema || '"."' || table_name || '"')) as index_size
        FROM information_schema.tables
        WHERE table_schema = 'ecommerce'
        ORDER BY pg_total_relation_size('"' || table_schema || '"."' || table_name || '"') DESC
      `;
      
      const result = await pool.query(query);
      
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  // Get slow queries
  router.get('/slow-queries', async (req, res, next) => {
    try {
      const query = `
        SELECT 
          substring(query, 1, 200) as query_preview,
          calls,
          total_time,
          mean_time,
          max_time,
          rows
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat_statements%'
        ORDER BY mean_time DESC
        LIMIT 20
      `;
      
      const result = await pool.query(query).catch(() => ({ rows: [] }));
      
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  // Get index usage statistics
  router.get('/index-usage', async (req, res, next) => {
    try {
      const query = `
        SELECT
          schemaname,
          relname as table_name,
          indexrelname as index_name,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes
        WHERE schemaname = 'ecommerce'
        ORDER BY idx_scan DESC
      `;
      
      const result = await pool.query(query);
      
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  return router;
}; 