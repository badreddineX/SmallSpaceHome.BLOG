import { neon } from '@neondatabase/serverless';

// Neon's HTTP driver. DATABASE_URL is the POOLED connection string.
// Lazy so a missing/blank env var surfaces as a caught JSON 500 in the route
// (with a useful message) instead of crashing the whole function at import.
let _client;

function client() {
  if (!_client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    _client = neon(url);
  }
  return _client;
}

// Tagged-template passthrough: `sql\`select ...\`` works exactly as before.
export function sql(strings, ...values) {
  return client()(strings, ...values);
}
