import Redis from 'ioredis'

const redis = new Redis('redis://localhost:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

export default redis
