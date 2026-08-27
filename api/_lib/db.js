import { neon } from '@neondatabase/serverless';

// Neon's HTTP driver — one round trip per query, no pooling to manage, which is
// exactly right for short-lived serverless invocations. DATABASE_URL is the
// POOLED connection string from the Neon dashboard (…-pooler.…).
if (!process.env.DATABASE_URL) {
  console.warn('[newsletter] DATABASE_URL is not set — subscribe/confirm/unsubscribe will fail.');
}

export const sql = neon(process.env.DATABASE_URL || '');
