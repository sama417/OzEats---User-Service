const app = require('./app');
const port = 3000;

app.listen(port, () => {
  console.log(`User Service running on http://localhost:${port}`);
});