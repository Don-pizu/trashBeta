//config/redis.js
// redis is a fast in-memory/temporary data store 

const IORedis = require('ioredis');

let connectionRedis;

if (process.env.NODE_ENV === 'production') {
  // For Production (Render)
  connectionRedis = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });

} else {
  // Local Development
  connectionRedis = new IORedis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_DB_PORT) || 6379,
    password: process.env.REDIS_PASS || undefined,     //for development
    maxRetriesPerRequest: null,     //  REQUIRED for BullMQ
    enableReadyCheck: false         //  prevents "Ready check" errors
  });
}

connectionRedis.on('connect', () => console.log('✅ Redis connected successfully!'));
connectionRedis.on('error', (err) => console.error('❌ Redis connection error:', err));

module.exports =  connectionRedis;
