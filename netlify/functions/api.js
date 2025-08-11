const serverless = require("serverless-http");
// Go up one level from 'netlify/functions' and then into 'backend/server.js'
const app = require("../../backend/server");

module.exports.handler = serverless(app);
