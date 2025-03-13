-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For trigram text search used in some challenges
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";  -- For query performance analysis 