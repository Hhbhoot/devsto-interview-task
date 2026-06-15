import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { initSocket } from './lib/socket';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize Socket.IO
initSocket(server);

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Process interrupted');
    process.exit(0);
  });
});

process.on('uncaughtException', (err: Error) => {
  console.log('Uncaught Exception', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason: Error) => {
  console.log('Unhandled Rejection', reason);
  process.exit(1);
});
