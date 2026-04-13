import { Pool } from 'pg'

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: 'admin',
  database: 'evict',
  max: 10,
  connectionTimeoutMillis: 5000,
  idle_in_transaction_session_timeout: 10000,
  statement_timeout: 10000,
})

export default pool
