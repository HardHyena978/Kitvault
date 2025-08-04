const serverless = require("serverless-http");
const app = require("../../backend/server"); // Import your existing express app

// Wrap the app in the serverless handler
module.exports.handler = serverless(app);
