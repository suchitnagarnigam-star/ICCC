import app from './app';
import { ENV } from './config/env';
import { startNotificationOutboxWorker, stopNotificationOutboxWorker } from './workers/notificationWorker';

const server = app.listen(ENV.PORT, () => {
  console.log(`====================================================`);
  console.log(`🏛️  MCL ICCC Complaint Management System API`);
  console.log(`🚀 Server listening on http://localhost:${ENV.PORT}`);
  console.log(`🌐 Environment: ${ENV.NODE_ENV}`);
  console.log(`⏳ 48-Hour SLA Engine Baseline Initialized`);
  console.log(`====================================================`);

  // Start background outbox delivery worker
  startNotificationOutboxWorker(10000);
});

// Graceful shutdown handling
function gracefulShutdown(signal: string) {
  console.log(`${signal} received. Initiating graceful shutdown...`);
  stopNotificationOutboxWorker();
  server.close(() => {
    console.log('HTTP server closed. Process terminated cleanly.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
