const pgMigrations = require('postgres-migrations');
const config = require('../config.js');

if (!('DB_HOST' in process.env)) {
  const nodeEnv = process.env.NODE_ENV || 'development';
  config.loadConfig(`../.env.${nodeEnv}`);
}

const MIGRATIONS_PATH = process.env.MIGRATIONS_PATH || 'migrations';

async function runMigrations() {
  const dbConfig = {
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT, 10),

    // Default: false for backwards-compatibility
    // This might change!
    ensureDatabaseExists: true,

    // Default: "postgres"
    // Used when checking/creating "database-name"
    defaultDatabase: 'postgres'
  };

  try {
    await pgMigrations.migrate(dbConfig, MIGRATIONS_PATH);
  } catch (err) {
    console.log(err);
  }
}

runMigrations();