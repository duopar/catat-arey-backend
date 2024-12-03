const http = require('http');
const app = require('./app');
const { initializeSecrets } = require('./middlewares/authMiddleware');

const PORT = 8080;

const sever = http.createServer(app);

initializeSecrets()
  .then(() => {
    sever.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize secrets:', error);
    process.exit(1);
  });
