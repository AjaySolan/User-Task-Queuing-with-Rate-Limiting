const express = require('express');
const redis = require('redis');
const fs = require('fs');
const rateLimitQueue = require('./rateLimitQueue');

const app = express();
app.use(express.json());

const redisClient = redis.createClient();

// Log file path
const logFilePath = './task_logs.txt';

// Task function with logging
async function task(user_id) {
  const logEntry = `${user_id} - task completed at - ${new Date().toISOString()}\n`;
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) console.error('Error writing to log file', err);
  });
}

// API route with rate limiting and queueing
app.post('/BRs/vi/task', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) return res.status(400).send('User ID is required');

  // Check and process with rate limiting
  rateLimitQueue(redisClient, user_id, task)
    .then(() => res.status(200).send('Task added to the queue'))
    .catch(() => res.status(429).send('Rate limit exceeded, task queued'));
});

module.exports = app;
