const { promisify } = require('util');
const sleep = promisify(setTimeout);

async function rateLimitQueue(redisClient, user_id, task) {
  const limitPerSecond = 1;
  const limitPerMinute = 20;

  const secKey = `rate_limit:${user_id}:second`;
  const minKey = `rate_limit:${user_id}:minute`;

  // Increment counts
  const [secCount, minCount] = await Promise.all([
    promisify(redisClient.incr).bind(redisClient)(secKey),
    promisify(redisClient.incr).bind(redisClient)(minKey),
  ]);

  // Set expiration on the counts
  if (secCount === 1) await promisify(redisClient.expire).bind(redisClient)(secKey, 1);
  if (minCount === 1) await promisify(redisClient.expire).bind(redisClient)(minKey, 60);

  // Check if limits are exceeded
  if (secCount > limitPerSecond || minCount > limitPerMinute) {
    await sleep(1000); // Wait for a second to re-check
    return rateLimitQueue(redisClient, user_id, task); // Re-queue the task
  }

  // Execute the task and log
  await task(user_id);
}

module.exports = rateLimitQueue;
