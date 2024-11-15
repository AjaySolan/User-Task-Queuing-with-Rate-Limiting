const cluster = require('cluster');
const os = require('os');
const app = require('./app');

if (cluster.isMaster) {
  const numCPUs = 2; // Set to 2 for two replica sets
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Replace dead worker to ensure resilience
  });
} else {
  app.listen(3000, () => {
    console.log(`Worker ${process.pid} started`);
  });
}
