// Entry point
require('dotenv').config();
//This is the first line and that's intentional. dotenv reads your server/.env file and loads everything into process.
// env. So after this line runs, process.env.DATABASE_URL, process.env.PORT etc are all available anywhere in the app. 
// If this ran after require('./src/app'), the app would start before the env variables were loaded — bugs would follow.
const app = require('./src/app');

//Imports the Express app object from app.js.
//  Notice we're not creating the app here — app.js creates it and exports it. server.js just receives it.
//  This separation means you could import the same app in a test file without starting a real server.

const PORT = process.env.PORT || 3000;
//Reads PORT from .env. The || 3000 is a fallback — if .env doesn't have PORT defined, use 3000. 
// When you deploy to a cloud host later, they inject their own PORT automatically.

app.listen(PORT, () => {
  console.log(`CryptoTrack server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
//This is what actually starts the server and begins listening for HTTP requests. 
// The callback function fires once the server is ready — that's when you see the console messages.
//  Nothing before this line accepts incoming requests.

// The full picture of server.js:
// Load .env → import app → start listening on port 3000
// That's it. Three responsibilities, that's all it does.